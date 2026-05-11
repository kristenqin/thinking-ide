import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const mockHostFile = resolve(repoRoot, "runtime-validation/mock-chat.html");
const contentBundle = resolve(repoRoot, "dist/content.js");
const port = 4173;

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
    server.listen(port, "127.0.0.1", () => resolveServer(server));
  });
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function run() {
  const server = await startMockHostServer();

  let browser;

  try {
    browser = await chromium.launch({
      headless: true
    });
    const page = await browser.newPage({
      viewport: {
        width: 1680,
        height: 1080
      }
    });
    await page.goto(`http://127.0.0.1:${port}/mock-chat.html`, {
      waitUntil: "domcontentloaded"
    });
    await page.addScriptTag({
      path: contentBundle
    });

    await page.waitForFunction(() => {
      const host = document.getElementById("thinking-ide-root");
      return Boolean(host?.shadowRoot?.getElementById("thinking-ide-app"));
    });

    const initialNodeCount = await page.evaluate(() => {
      const root = document.getElementById("thinking-ide-root");
      return root?.shadowRoot?.querySelectorAll(".react-flow__node").length ?? 0;
    });

    if (initialNodeCount < 3) {
      throw new Error(`Expected at least 3 nodes after initial injection, received ${initialNodeCount}`);
    }

    await page.click("#append-exchange");
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
    await browser?.close();
    server.close();
  }
}

run().catch((error) => {
  console.error("runtime validation failed");
  console.error(error);
  process.exitCode = 1;
});
