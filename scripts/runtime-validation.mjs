import { createServer } from "node:http";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const mockHostFile = resolve(repoRoot, "runtime-validation/mock-chat.html");
const extensionBundle = resolve(repoRoot, "dist");
const SIDEPANEL_ROOT_ID = "thinking-ide-sidepanel-root";
const SIDEPANEL_APP_ID = "thinking-ide-sidepanel-app";
const DEFAULT_VIEWPORT = {
  width: 1440,
  height: 1080
};

function startMockHostServer() {
  const html = readFileSync(mockHostFile);

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;

    if (pathname === "/" || pathname === "/mock-chat.html") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(html);
      return;
    }

    response.writeHead(404);
    response.end("not found");
  });

  return new Promise((resolveServer, rejectServer) => {
    server.once("error", rejectServer);
    server.listen(0, "127.0.0.1", () => resolveServer(server));
  });
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function waitForBridgeHost(page) {
  await page.waitForFunction(() => {
    const html = document.documentElement;
    return Boolean(
      html.getAttribute("data-thinking-ide-runtime-validation") === "true" &&
        window.__thinkingIdeBootstrapMockHost &&
        html.getAttribute("data-thinking-ide-runtime-id")
    );
  });
}

async function readExtensionIdFromHost(page) {
  const extensionId = await page.evaluate(() => document.documentElement.getAttribute("data-thinking-ide-runtime-id"));
  if (!extensionId) {
    throw new Error("Runtime validation could not read chrome.runtime.id from the content runtime bridge");
  }

  return extensionId;
}

async function assertNoLegacyInjectedRoot(page) {
  const hasLegacyRoot = await page.evaluate(() => Boolean(document.getElementById("thinking-ide-root")));
  if (hasLegacyRoot) {
    throw new Error("Runtime validation found the legacy content-side UI root after sidePanel migration");
  }
}

async function waitForSidePanelApp(page) {
  await page.waitForFunction(
    ([rootId, appId]) => {
      const host = document.getElementById(rootId);
      return Boolean(host?.shadowRoot?.getElementById(appId));
    },
    [SIDEPANEL_ROOT_ID, SIDEPANEL_APP_ID]
  );
}

async function waitForHealthyPanel(page, titleSnippet) {
  await page.waitForFunction(
    ([rootId, expectedTitle]) => {
      const host = document.getElementById(rootId);
      const shadowRoot = host?.shadowRoot;
      const nodeCount = shadowRoot?.querySelectorAll(".react-flow__node").length ?? 0;
      const statusText =
        shadowRoot?.querySelector(".ti-status-pill")?.textContent?.trim() ??
        shadowRoot?.querySelector(".ti-statusbar__label")?.textContent?.trim() ??
        "";
      const titles = Array.from(shadowRoot?.querySelectorAll(".ti-node__title") ?? []).map((node) =>
        node.textContent?.trim() ?? ""
      );
      const canvasShellHeight =
        shadowRoot?.querySelector(".ti-canvas-shell")?.getBoundingClientRect().height ?? 0;

      return (
        nodeCount >= 3 &&
        canvasShellHeight > 300 &&
        !/needs review|error/i.test(statusText) &&
        titles.some((title) => title.includes(expectedTitle))
      );
    },
    [SIDEPANEL_ROOT_ID, titleSnippet]
  );
}

async function readPanelState(page) {
  return page.evaluate((rootId) => {
    const host = document.getElementById(rootId);
    const shadowRoot = host?.shadowRoot;
    const titles = Array.from(shadowRoot?.querySelectorAll(".ti-node__title") ?? []).map((node) =>
      node.textContent?.trim() ?? ""
    );
    const buttonTexts = Array.from(shadowRoot?.querySelectorAll("button") ?? []).map((button) =>
      button.textContent?.trim() ?? ""
    );

    return {
      statusText:
        shadowRoot?.querySelector(".ti-status-pill")?.textContent?.trim() ??
        shadowRoot?.querySelector(".ti-statusbar__label")?.textContent?.trim() ??
        "",
      nodeCount: shadowRoot?.querySelectorAll(".react-flow__node").length ?? 0,
      titles,
      buttonTexts,
      canvasShellHeight:
        shadowRoot?.querySelector(".ti-canvas-shell")?.getBoundingClientRect().height ?? 0
    };
  }, SIDEPANEL_ROOT_ID);
}

async function clickHostButton(page, buttonId) {
  await page.evaluate((id) => {
    const button = document.getElementById(id);
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Missing ${id} button in runtime validation host`);
    }

    button.click();
  }, buttonId);
}

async function waitForLatestExchange(page, previousTitles, expectedTitle) {
  await page.waitForFunction(
    ([rootId, priorTitles, titleSnippet]) => {
      const host = document.getElementById(rootId);
      const shadowRoot = host?.shadowRoot;
      const titles = Array.from(shadowRoot?.querySelectorAll(".ti-node__title") ?? []).map((node) =>
        node.textContent?.trim() ?? ""
      );

      return titles.some((title) => title.includes(titleSnippet)) && titles.join("||") !== priorTitles.join("||");
    },
    [SIDEPANEL_ROOT_ID, previousTitles, expectedTitle]
  );
}

async function clickPanelButton(page, label) {
  await page.evaluate(
    ([rootId, expectedLabel]) => {
      const host = document.getElementById(rootId);
      const shadowRoot = host?.shadowRoot;
      const button = Array.from(shadowRoot?.querySelectorAll("button") ?? []).find((entry) =>
        (entry.textContent?.trim() ?? "").includes(expectedLabel)
      );

      if (!(button instanceof HTMLButtonElement)) {
        throw new Error(`Could not find sidePanel button containing "${expectedLabel}"`);
      }

      button.click();
    },
    [SIDEPANEL_ROOT_ID, label]
  );
}

async function main() {
  const server = await startMockHostServer();
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Mock host server did not expose a TCP port");
  }

  const userDataDir = mkdtempSync(join(tmpdir(), "thinking-ide-sidepanel-"));
  const mockHostUrl = `http://127.0.0.1:${address.port}/mock-chat.html`;
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: DEFAULT_VIEWPORT,
    args: [
      `--disable-extensions-except=${extensionBundle}`,
      `--load-extension=${extensionBundle}`
    ]
  });

  try {
    const hostPage = await context.newPage();
    await hostPage.goto(mockHostUrl, { waitUntil: "domcontentloaded" });
    await waitForBridgeHost(hostPage);
    await assertNoLegacyInjectedRoot(hostPage);
    const extensionId = await readExtensionIdFromHost(hostPage);

    const panelPage = await context.newPage();
    await panelPage.goto(`chrome-extension://${extensionId}/sidepanel.html`, {
      waitUntil: "domcontentloaded"
    });

    await waitForSidePanelApp(panelPage);
    await waitForHealthyPanel(panelPage, "chat scan");

    const initialState = await readPanelState(panelPage);
    if (!/up to date|synced|refreshing|generating|standing by|waiting/i.test(initialState.statusText)) {
      throw new Error(`Expected sidePanel UI to expose a visible status, received "${initialState.statusText}"`);
    }

    if (!initialState.buttonTexts.some((text) => /settings/i.test(text))) {
      throw new Error("Expected sidePanel header to expose the settings control");
    }

    if (!initialState.buttonTexts.some((text) => /refresh/i.test(text))) {
      throw new Error("Expected sidePanel header to expose the refresh control");
    }

    if (!initialState.buttonTexts.some((text) => /close|close panel|collapse/i.test(text))) {
      throw new Error("Expected sidePanel header to expose the shell close control");
    }

    await clickHostButton(hostPage, "append-exchange");
    await waitForLatestExchange(panelPage, initialState.titles, "Exchange 1 should trigger");

    const expandedState = await readPanelState(panelPage);
    if (!expandedState.titles.some((title) => title.includes("Exchange 1 should trigger"))) {
      throw new Error("Expected the sidePanel to regenerate against the latest appended assistant exchange");
    }

    await clickHostButton(hostPage, "remove-assistant-sources");
    await clickPanelButton(panelPage, "Refresh");
    await wait(400);

    console.log("runtime validation passed");
  } finally {
    server.close();
    await context.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

await main();
