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
      const statusText = root?.shadowRoot?.querySelector(".ti-statusbar")?.textContent ?? "";
      const nodeCount = root?.shadowRoot?.querySelectorAll(".react-flow__node").length ?? 0;
      return /Status:\s*ready/i.test(statusText) && nodeCount >= 3;
    });

    const initialNodeCount = await page.evaluate(() => {
      const root = document.getElementById("thinking-ide-root");
      return root?.shadowRoot?.querySelectorAll(".react-flow__node").length ?? 0;
    });

    if (initialNodeCount < 3) {
      throw new Error(`Expected at least 3 nodes after initial injection, received ${initialNodeCount}`);
    }

    await page.locator("#append-exchange").click({ force: true });
    await wait(1200);

    const refreshedNodeCount = await page.evaluate(() => {
      const root = document.getElementById("thinking-ide-root");
      return root?.shadowRoot?.querySelectorAll(".react-flow__node").length ?? 0;
    });

    if (refreshedNodeCount < 3) {
      throw new Error(`Expected refreshed concept map after appending chat exchange, received ${refreshedNodeCount}`);
    }

    const statusText = await page.evaluate(() => {
      const root = document.getElementById("thinking-ide-root");
      return root?.shadowRoot?.querySelector(".ti-statusbar")?.textContent ?? "";
    });

    if (!/Status:\s*ready/i.test(statusText)) {
      throw new Error(`Expected ready status in injected panel, received: ${statusText}`);
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
