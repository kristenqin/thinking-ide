import { createServer } from "node:http";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const mockHostFile = resolve(repoRoot, "runtime-validation/mock-chat.html");
const extensionBundle = resolve(repoRoot, "dist");

function startMockHostServer() {
  const html = readFileSync(mockHostFile);

  const server = createServer((request, response) => {
    if (request.url === "/" || request.url?.startsWith("/mock-chat.html")) {
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

async function readPanelState(page) {
  return page.evaluate(() => {
    const root = document.getElementById("thinking-ide-root");
    const shadowRoot = root?.shadowRoot;
    const titles = Array.from(shadowRoot?.querySelectorAll(".ti-node__title") ?? []).map((node) =>
      node.textContent?.trim() ?? ""
    );
    const canvasShellRect = shadowRoot?.querySelector(".ti-canvas-shell")?.getBoundingClientRect();
    const statusText =
      shadowRoot?.querySelector(".ti-status-pill")?.textContent?.trim() ??
      shadowRoot?.querySelector(".ti-statusbar__label")?.textContent?.trim() ??
      shadowRoot?.querySelector(".ti-statusbar")?.textContent?.trim() ??
      "";
    const hasError = Boolean(shadowRoot?.querySelector(".ti-error"));

    return {
      statusText,
      hasError,
      nodeCount: shadowRoot?.querySelectorAll(".react-flow__node").length ?? 0,
      titles,
      canvasShellHeight: canvasShellRect?.height ?? 0
    };
  });
}

async function assertCanvasShellHasMeaningfulHeight(page) {
  const canvasShellHeight = await page.evaluate(() => {
    const root = document.getElementById("thinking-ide-root");
    const shadowRoot = root?.shadowRoot;
    const canvasShell = shadowRoot?.querySelector(".ti-canvas-shell");

    if (!(canvasShell instanceof HTMLElement)) {
      throw new Error("Runtime validation could not find .ti-canvas-shell after panel injection");
    }

    return canvasShell.getBoundingClientRect().height;
  });

  if (canvasShellHeight <= 300) {
    throw new Error(
      `Collapsed canvas shell regression: expected .ti-canvas-shell height to be greater than 300px after panel injection, received ${canvasShellHeight}px`
    );
  }
}

async function clickNodeByTitle(page, expectedText) {
  await page.evaluate((titleSnippet) => {
    const root = document.getElementById("thinking-ide-root");
    const shadowRoot = root?.shadowRoot;
    const answerNode = Array.from(shadowRoot?.querySelectorAll(".react-flow__node") ?? []).find((node) =>
      node.textContent?.includes(titleSnippet)
    );

    if (!(answerNode instanceof HTMLElement)) {
      throw new Error(`Could not find node in runtime validation panel containing: ${titleSnippet}`);
    }

    answerNode.click();
  }, expectedText);
}

async function clickShadowButtonByText(page, expectedTexts) {
  await page.evaluate((texts) => {
    const root = document.getElementById("thinking-ide-root");
    const shadowRoot = root?.shadowRoot;
    const button = Array.from(shadowRoot?.querySelectorAll("button") ?? []).find((entry) =>
      texts.some((text) => entry.textContent?.trim().includes(text))
    );

    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Could not find button containing any of: ${texts.join(", ")}`);
    }

    button.click();
  }, expectedTexts);
}

async function readBottomLog(page) {
  return page.evaluate(() => {
    const root = document.getElementById("thinking-ide-root");
    const shadowRoot = root?.shadowRoot;

    return (
      shadowRoot?.querySelector(".ti-bottomlog__message")?.textContent?.trim() ??
      shadowRoot?.querySelector(".ti-bottomlog")?.textContent?.trim() ??
      ""
    );
  });
}

async function run() {
  const server = await startMockHostServer();
  const userDataDir = mkdtempSync(join(tmpdir(), "thinking-ide-runtime-validation-"));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Runtime validation server did not expose a numeric localhost port");
  }

  let context;

  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      channel: "chromium",
      headless: true,
      args: [
        "--headless=new",
        `--disable-extensions-except=${extensionBundle}`,
        `--load-extension=${extensionBundle}`
      ]
    });
    const page = await context.newPage({
      viewport: {
        width: 1680,
        height: 1080
      }
    });
    await page.goto(`http://127.0.0.1:${address.port}/mock-chat.html`, {
      waitUntil: "domcontentloaded"
    });

    await page.waitForFunction(() => {
      const host = document.getElementById("thinking-ide-root");
      return Boolean(host?.shadowRoot?.getElementById("thinking-ide-app"));
    });

    await page.waitForFunction(() => {
      const root = document.getElementById("thinking-ide-root");
      return Boolean(root?.shadowRoot?.querySelector(".ti-canvas-shell"));
    });
    await assertCanvasShellHasMeaningfulHeight(page);

    await page.waitForFunction(() => {
      const root = document.getElementById("thinking-ide-root");
      const shadowRoot = root?.shadowRoot;
      const nodeCount = shadowRoot?.querySelectorAll(".react-flow__node").length ?? 0;
      const hasError = Boolean(shadowRoot?.querySelector(".ti-error"));
      const statusText =
        shadowRoot?.querySelector(".ti-status-pill")?.textContent?.trim() ??
        shadowRoot?.querySelector(".ti-statusbar__label")?.textContent?.trim() ??
        shadowRoot?.querySelector(".ti-statusbar")?.textContent?.trim() ??
        "";

      return nodeCount >= 3 && !hasError && !/needs review|error/i.test(statusText);
    });

    const initialState = await readPanelState(page);
    const initialNodeCount = initialState.nodeCount;

    if (initialNodeCount < 3) {
      throw new Error(`Expected at least 3 nodes after initial injection, received ${initialNodeCount}`);
    }

    if (!initialState.titles.some((title) => title.includes("I need a concept map"))) {
      throw new Error("Expected the initial concept map to include the seed user exchange");
    }

    await page.evaluate(() => {
      const button = document.getElementById("append-exchange");
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error("Missing append-exchange button in runtime validation host");
      }

      button.click();
    });
    await page.waitForFunction(() => document.querySelectorAll("[data-message-author-role]").length >= 4);
    await page.waitForFunction(() => {
      const root = document.getElementById("thinking-ide-root");
      const shadowRoot = root?.shadowRoot;
      const titles = Array.from(shadowRoot?.querySelectorAll(".ti-node__title") ?? []).map((node) =>
        node.textContent?.trim() ?? ""
      );

      return titles.some((title) => title.includes("Map the next exchange"));
    });
    await wait(200);

    const refreshedState = await readPanelState(page);
    const refreshedNodeCount = refreshedState.nodeCount;

    if (refreshedNodeCount < 3) {
      throw new Error(`Expected refreshed concept map after appending chat exchange, received ${refreshedNodeCount}`);
    }

    if (!refreshedState.titles.some((title) => title.includes("Map the next exchange"))) {
      throw new Error("Expected the refreshed concept map to include the appended exchange");
    }

    await clickNodeByTitle(page, "Exchange 1 should trigger");
    await clickShadowButtonByText(page, ["Jump to source", "Source"]);
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('[data-message-author-role="assistant"]')).some((element) => {
        const text = element.textContent ?? "";
        return (
          text.includes("Exchange 1 should trigger the observer") &&
          element.getAttribute("data-thinking-ide-highlight") === "true"
        );
      })
    );

    await page.evaluate(() => {
      const button = document.getElementById("remove-latest-assistant");
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error("Missing remove-latest-assistant button in runtime validation host");
      }

      button.click();
    });
    await page.waitForFunction(
      () => document.querySelectorAll('[data-message-author-role="assistant"]').length === 1
    );

    await clickNodeByTitle(page, "Exchange 1 should trigger");
    await clickShadowButtonByText(page, ["Jump to source", "Source"]);
    await page.waitForFunction(() => {
      const root = document.getElementById("thinking-ide-root");
      const shadowRoot = root?.shadowRoot;
      const logText =
        shadowRoot?.querySelector(".ti-bottomlog__message")?.textContent?.trim() ??
        shadowRoot?.querySelector(".ti-bottomlog")?.textContent?.trim() ??
        "";

      return /original chat location is unavailable/i.test(logText);
    });

    const failureLog = await readBottomLog(page);

    if (!/original chat location is unavailable/i.test(failureLog)) {
      throw new Error(`Expected source-lost feedback after removing the indexed assistant source, received: ${failureLog}`);
    }

    const highlightedAssistantCount = await page.evaluate(
      () => document.querySelectorAll('[data-message-author-role="assistant"][data-thinking-ide-highlight="true"]').length
    );

    if (highlightedAssistantCount !== 0) {
      throw new Error(
        `Expected no assistant highlight after source-lost jump, received ${highlightedAssistantCount} highlighted assistant messages`
      );
    }

    if (refreshedState.hasError) {
      throw new Error(`Expected healthy injected panel after refresh, received error state: ${refreshedState.statusText}`);
    }

    if (!/(ready|synced)/i.test(refreshedState.statusText)) {
      throw new Error(`Expected ready-like status in injected panel, received: ${refreshedState.statusText}`);
    }

    console.log("runtime validation passed");
  } finally {
    await context?.close();
    server.close();
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error("runtime validation failed");
  console.error(error);
  process.exitCode = 1;
});
