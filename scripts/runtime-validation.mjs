import { createServer } from "node:http";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const mockHostFile = resolve(repoRoot, "runtime-validation/mock-chat.html");
const extensionBundle = resolve(repoRoot, "dist");
const ROOT_ID = "thinking-ide-root";
const APP_ID = "thinking-ide-app";
const LAYOUT_STYLE_ID = "thinking-ide-layout-style";
const LAYOUT_MODE_ATTR = "data-thinking-ide-layout-mode";
const PAGE_SHELL_ATTR = "data-thinking-ide-page-shell";
const COLLAPSED_ATTR = "data-thinking-ide-collapsed";
const DEFAULT_VIEWPORT = {
  width: 1440,
  height: 1080
};

function startMockHostServer() {
  const html = readFileSync(mockHostFile);

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;

    if (pathname === "/" || pathname === "/mock-chat.html" || pathname === "/mock-chat-overlay.html") {
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

async function waitForInjectedApp(page) {
  await page.waitForFunction(
    ([rootId, appId]) => {
      const host = document.getElementById(rootId);
      return Boolean(host?.shadowRoot?.getElementById(appId));
    },
    [ROOT_ID, APP_ID]
  );
}

async function waitForCanvasShell(page) {
  await page.waitForFunction((rootId) => {
    const root = document.getElementById(rootId);
    return Boolean(root?.shadowRoot?.querySelector(".ti-canvas-shell"));
  }, ROOT_ID);
}

async function readPanelState(page) {
  return page.evaluate((rootId) => {
    const root = document.getElementById(rootId);
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
      canvasShellHeight: canvasShellRect?.height ?? 0,
      hostWidth: root?.getBoundingClientRect().width ?? 0,
      hasCollapseRail: Boolean(shadowRoot?.querySelector(".ti-collapse-rail"))
    };
  }, ROOT_ID);
}

async function readLayoutState(page) {
  return page.evaluate(
    ([rootId, layoutStyleId, layoutModeAttr, pageShellAttr]) => {
      const host = document.getElementById(rootId);
      const shadowRoot = host?.shadowRoot;
      const pageShell = document.querySelector(`[${pageShellAttr}="true"]`);
      const mockPageRoot = document.getElementById("mock-page-root");
      const hostRect = host?.getBoundingClientRect();
      const bodyRect = document.body.getBoundingClientRect();
      const pageRect = pageShell?.getBoundingClientRect();
      const hostStyle = host ? getComputedStyle(host) : null;
      const buttonTexts = Array.from(shadowRoot?.querySelectorAll("button") ?? []).map((entry) =>
        entry.textContent?.trim() ?? ""
      );

      return {
        mode: host?.getAttribute(layoutModeAttr) ?? "unknown",
        bodyMode: document.body.getAttribute(layoutModeAttr) ?? "",
        htmlMode: document.documentElement.getAttribute(layoutModeAttr) ?? "",
        hostParentTag: host?.parentElement?.tagName ?? "",
        hasLayoutStyle: Boolean(document.getElementById(layoutStyleId)),
        hasPageShell: pageShell instanceof HTMLElement,
        bodyChildren: Array.from(document.body.children).map((child) => child.id || child.className || child.tagName),
        pageShellContainsMockPage:
          pageShell instanceof HTMLElement && mockPageRoot instanceof HTMLElement && pageShell.contains(mockPageRoot),
        hostWidth: hostRect?.width ?? 0,
        bodyWidth: bodyRect?.width ?? 0,
        pageWidth: pageRect?.width ?? 0,
        hostLeft: hostRect?.left ?? 0,
        hostRight: hostRect?.right ?? 0,
        pageRight: pageRect?.right ?? 0,
        hostPosition: hostStyle?.position ?? "",
        bodyPaddingRight: document.body.style.paddingRight,
        panelWidthVar: host?.style.getPropertyValue("--thinking-ide-panel-width").trim() ?? "",
        hasTitle: /thinking ide/i.test(shadowRoot?.querySelector(".ti-eyebrow")?.textContent?.trim() ?? ""),
        hasStatus: Boolean(shadowRoot?.querySelector(".ti-status-pill, .ti-statusbar__label")),
        buttonTexts
      };
    },
    [ROOT_ID, LAYOUT_STYLE_ID, LAYOUT_MODE_ATTR, PAGE_SHELL_ATTR]
  );
}

async function waitForHealthyPanel(page, titleSnippet) {
  await page.waitForFunction(
    ([rootId, expectedTitle]) => {
      const root = document.getElementById(rootId);
      const shadowRoot = root?.shadowRoot;
      const nodeCount = shadowRoot?.querySelectorAll(".react-flow__node").length ?? 0;
      const hasError = Boolean(shadowRoot?.querySelector(".ti-error"));
      const statusText =
        shadowRoot?.querySelector(".ti-status-pill")?.textContent?.trim() ??
        shadowRoot?.querySelector(".ti-statusbar__label")?.textContent?.trim() ??
        shadowRoot?.querySelector(".ti-statusbar")?.textContent?.trim() ??
        "";
      const titles = Array.from(shadowRoot?.querySelectorAll(".ti-node__title") ?? []).map((node) =>
        node.textContent?.trim() ?? ""
      );

      return (
        nodeCount >= 3 &&
        !hasError &&
        !/needs review|error/i.test(statusText) &&
        titles.some((title) => title.includes(expectedTitle))
      );
    },
    [ROOT_ID, titleSnippet]
  );
}

async function assertCanvasShellHasMeaningfulHeight(page) {
  const canvasShellHeight = await page.evaluate((rootId) => {
    const root = document.getElementById(rootId);
    const shadowRoot = root?.shadowRoot;
    const canvasShell = shadowRoot?.querySelector(".ti-canvas-shell");

    if (!(canvasShell instanceof HTMLElement)) {
      throw new Error("Runtime validation could not find .ti-canvas-shell after panel injection");
    }

    return canvasShell.getBoundingClientRect().height;
  }, ROOT_ID);

  if (canvasShellHeight <= 300) {
    throw new Error(
      `Collapsed canvas shell regression: expected .ti-canvas-shell height to be greater than 300px after panel injection, received ${canvasShellHeight}px`
    );
  }
}

function assertSplitPaneLayout(layoutState) {
  if (layoutState.mode !== "layout") {
    throw new Error(
      `Expected the default mock host to inject in split-pane layout mode, received ${layoutState.mode} instead`
    );
  }

  if (layoutState.bodyMode !== "layout" || layoutState.htmlMode !== "layout") {
    throw new Error("Expected split-pane layout mode to be reflected on both <html> and <body>");
  }

  if (!layoutState.hasLayoutStyle || !layoutState.hasPageShell) {
    throw new Error("Expected split-pane layout mode to create light-DOM layout styles and mark the page shell");
  }

  if (layoutState.hostParentTag !== "BODY") {
    throw new Error(`Expected the injected host to sit directly under <body>, received parent ${layoutState.hostParentTag || "<none>"}`);
  }

  if (layoutState.bodyChildren.at(-1) !== ROOT_ID || !layoutState.pageShellContainsMockPage) {
    throw new Error("Expected split-pane ordering to keep the chat page first and the Thinking IDE host as the right-hand sibling");
  }

  if (layoutState.hostPosition !== "sticky") {
    throw new Error(`Expected split-pane host positioning to be sticky, received ${layoutState.hostPosition}`);
  }

  if (layoutState.bodyPaddingRight !== "") {
    throw new Error(
      `Expected split-pane mode to avoid body right-padding fallback, received inline paddingRight=${layoutState.bodyPaddingRight}`
    );
  }

  const panelRatio = layoutState.hostWidth / layoutState.bodyWidth;
  const chatRatio = layoutState.pageWidth / layoutState.bodyWidth;

  if (!Number.isFinite(panelRatio) || !Number.isFinite(chatRatio) || layoutState.bodyWidth <= 0) {
    throw new Error("Could not measure split-pane workspace widths during runtime validation");
  }

  if (panelRatio < 0.56 || panelRatio > 0.64) {
    throw new Error(
      `Expected the Thinking Panel to occupy roughly 60% of the workspace in layout mode, received ${(panelRatio * 100).toFixed(1)}%`
    );
  }

  if (chatRatio < 0.36 || chatRatio > 0.44) {
    throw new Error(
      `Expected the chat workspace to occupy roughly 40% of the workspace in layout mode, received ${(chatRatio * 100).toFixed(1)}%`
    );
  }

  if (Math.abs(layoutState.pageRight - layoutState.hostLeft) > 2) {
    throw new Error("Expected the split-pane workspace to align chat and panel edges without overlay overlap");
  }

  if (!layoutState.hasTitle || !layoutState.hasStatus) {
    throw new Error("Expected the expanded workspace header to expose the Thinking IDE title and visible status treatment");
  }

  if (!layoutState.buttonTexts.some((text) => /settings/i.test(text))) {
    throw new Error("Expected the expanded workspace header to expose the settings entry");
  }

  if (!layoutState.buttonTexts.some((text) => /refresh/i.test(text))) {
    throw new Error("Expected the expanded workspace header to expose the refresh control");
  }
}

function assertOverlayFallback(layoutState) {
  if (layoutState.mode !== "overlay") {
    throw new Error(`Expected the fallback mock host to inject in overlay mode, received ${layoutState.mode}`);
  }

  if (layoutState.bodyMode !== "overlay" || layoutState.htmlMode !== "overlay") {
    throw new Error("Expected overlay fallback mode to be reflected on both <html> and <body>");
  }

  if (layoutState.hasPageShell) {
    throw new Error("Expected overlay fallback to skip marking any page shell");
  }

  if (layoutState.bodyPaddingRight !== "var(--thinking-ide-panel-width)") {
    throw new Error(
      `Expected overlay fallback to reserve space with body paddingRight, received ${layoutState.bodyPaddingRight || "<empty>"}`
    );
  }

  if (!layoutState.panelWidthVar) {
    throw new Error("Expected overlay fallback to publish --thinking-ide-panel-width");
  }
}

async function clickNodeByTitle(page, expectedText) {
  await page.evaluate(
    ([rootId, titleSnippet]) => {
      const root = document.getElementById(rootId);
      const shadowRoot = root?.shadowRoot;
      const answerNode = Array.from(shadowRoot?.querySelectorAll(".react-flow__node") ?? []).find((node) =>
        node.textContent?.includes(titleSnippet)
      );

      if (!(answerNode instanceof HTMLElement)) {
        throw new Error(`Could not find node in runtime validation panel containing: ${titleSnippet}`);
      }

      answerNode.click();
    },
    [ROOT_ID, expectedText]
  );
}

async function clickShadowButtonByText(page, expectedTexts) {
  await page.evaluate(
    ([rootId, texts]) => {
      const root = document.getElementById(rootId);
      const shadowRoot = root?.shadowRoot;
      const button = Array.from(shadowRoot?.querySelectorAll("button") ?? []).find((entry) =>
        texts.some((text) => {
          const content = entry.textContent?.trim() ?? "";
          const label = entry.getAttribute("aria-label") ?? "";
          return content.includes(text) || label.includes(text);
        })
      );

      if (!(button instanceof HTMLButtonElement)) {
        throw new Error(`Could not find button containing any of: ${texts.join(", ")}`);
      }

      button.click();
    },
    [ROOT_ID, expectedTexts]
  );
}

async function clickPageButton(page, buttonId) {
  await page.evaluate((id) => {
    const button = document.getElementById(id);
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Missing ${id} button in runtime validation host`);
    }

    button.click();
  }, buttonId);
}

async function readBottomLog(page) {
  return page.evaluate((rootId) => {
    const root = document.getElementById(rootId);
    const shadowRoot = root?.shadowRoot;

    return (
      shadowRoot?.querySelector(".ti-bottomlog__message")?.textContent?.trim() ??
      shadowRoot?.querySelector(".ti-bottomlog")?.textContent?.trim() ??
      ""
    );
  }, ROOT_ID);
}

async function bootstrapOverlayMockHost(page) {
  await page.evaluate(() => {
    if (typeof window.__thinkingIdeBootstrapMockHost !== "function") {
      throw new Error("Runtime validation overlay scenario is missing window.__thinkingIdeBootstrapMockHost");
    }

    window.__thinkingIdeBootstrapMockHost();
  });
}

async function runDefaultLayoutScenario(context, origin) {
  const page = await context.newPage({ viewport: DEFAULT_VIEWPORT });

  try {
    await page.goto(`${origin}/mock-chat.html`, {
      waitUntil: "domcontentloaded"
    });

    await waitForInjectedApp(page);
    await waitForCanvasShell(page);
    await assertCanvasShellHasMeaningfulHeight(page);
    assertSplitPaneLayout(await readLayoutState(page));

    await waitForHealthyPanel(page, "I need a concept map");
    const initialState = await readPanelState(page);
    const initialNodeCount = initialState.nodeCount;

    if (initialNodeCount < 3) {
      throw new Error(`Expected at least 3 nodes after initial injection, received ${initialNodeCount}`);
    }

    if (!initialState.titles.some((title) => title.includes("I need a concept map"))) {
      throw new Error("Expected the initial concept map to include the seed user exchange");
    }

    await clickShadowButtonByText(page, ["Collapse"]);
    await page.waitForFunction(([rootId, collapsedAttr]) => {
      const root = document.getElementById(rootId);
      const shadowRoot = root?.shadowRoot;
      const hostWidth = root?.getBoundingClientRect().width ?? 0;

      return hostWidth <= 90 && root?.getAttribute(collapsedAttr) === "true" && Boolean(shadowRoot?.querySelector(".ti-collapse-rail"));
    }, [ROOT_ID, COLLAPSED_ATTR]);

    const collapsedState = await readPanelState(page);
    if (!collapsedState.hasCollapseRail || collapsedState.hostWidth > 90) {
      throw new Error(
        `Expected collapse rail mode after collapsing the workspace, received width=${collapsedState.hostWidth}px`
      );
    }

    await clickShadowButtonByText(page, ["Expand thinking workspace", "Thinking IDE"]);
    await page.waitForFunction(([rootId, collapsedAttr]) => {
      const root = document.getElementById(rootId);
      const shadowRoot = root?.shadowRoot;
      const hostWidth = root?.getBoundingClientRect().width ?? 0;

      return hostWidth > 500 && root?.getAttribute(collapsedAttr) === "false" && !shadowRoot?.querySelector(".ti-collapse-rail");
    }, [ROOT_ID, COLLAPSED_ATTR]);
    await assertCanvasShellHasMeaningfulHeight(page);
    assertSplitPaneLayout(await readLayoutState(page));

    await clickPageButton(page, "append-exchange");
    await page.waitForFunction(() => document.querySelectorAll("[data-message-author-role]").length >= 4);
    await waitForHealthyPanel(page, "Map the next exchange");
    await wait(200);

    const refreshedState = await readPanelState(page);
    const refreshedNodeCount = refreshedState.nodeCount;

    if (refreshedNodeCount < 3) {
      throw new Error(`Expected refreshed concept map after appending chat exchange, received ${refreshedNodeCount}`);
    }

    if (!refreshedState.titles.some((title) => title.includes("Map the next exchange"))) {
      throw new Error("Expected the refreshed concept map to include the appended exchange");
    }

    assertSplitPaneLayout(await readLayoutState(page));

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

    await clickPageButton(page, "remove-latest-assistant");
    await page.waitForFunction(
      () => document.querySelectorAll('[data-message-author-role="assistant"]').length === 1
    );

    await clickNodeByTitle(page, "Exchange 1 should trigger");
    await clickShadowButtonByText(page, ["Jump to source", "Source"]);
    await page.waitForFunction((rootId) => {
      const root = document.getElementById(rootId);
      const shadowRoot = root?.shadowRoot;
      const logText =
        shadowRoot?.querySelector(".ti-bottomlog__message")?.textContent?.trim() ??
        shadowRoot?.querySelector(".ti-bottomlog")?.textContent?.trim() ??
        "";

      return /original chat location is unavailable/i.test(logText);
    }, ROOT_ID);

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
  } finally {
    await page.close();
  }
}

async function runOverlayFallbackScenario(context, origin) {
  const page = await context.newPage({ viewport: DEFAULT_VIEWPORT });

  try {
    await page.goto(`${origin}/mock-chat-overlay.html?scenario=overlay-fallback`, {
      waitUntil: "domcontentloaded"
    });

    await waitForInjectedApp(page);
    await waitForCanvasShell(page);
    await assertCanvasShellHasMeaningfulHeight(page);
    assertOverlayFallback(await readLayoutState(page));

    await bootstrapOverlayMockHost(page);
    await page.waitForFunction(() => Boolean(document.getElementById("chat-root")));
    await clickPageButton(page, "append-exchange");
    await page.waitForFunction(() => document.querySelectorAll("[data-message-author-role]").length >= 4);
    await waitForHealthyPanel(page, "Map the next exchange");
    await wait(200);

    const fallbackState = await readPanelState(page);

    if (!fallbackState.titles.some((title) => title.includes("Map the next exchange"))) {
      throw new Error("Expected overlay fallback scenario to keep regenerating after the mock chat bootstraps");
    }

    if (fallbackState.hasError) {
      throw new Error(`Expected healthy injected panel in overlay fallback, received error state: ${fallbackState.statusText}`);
    }

    assertOverlayFallback(await readLayoutState(page));
  } finally {
    await page.close();
  }
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

    const origin = `http://127.0.0.1:${address.port}`;
    await runDefaultLayoutScenario(context, origin);
    await runOverlayFallbackScenario(context, origin);

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
