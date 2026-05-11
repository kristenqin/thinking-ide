import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "../app/App";
import appStyles from "./content.css?inline";
import reactFlowStyles from "@xyflow/react/dist/style.css?inline";

const ROOT_ID = "thinking-ide-root";
const APP_ID = "thinking-ide-app";

function isTargetPage(): boolean {
  if (/chatgpt\.com|chat\.openai\.com/.test(location.hostname)) {
    return true;
  }

  return (
    /localhost|127\.0\.0\.1/.test(location.hostname) &&
    document.documentElement.getAttribute("data-thinking-ide-runtime-validation") === "true"
  );
}

function ensureMount() {
  const existing = document.getElementById(ROOT_ID);
  if (existing?.shadowRoot?.getElementById(APP_ID)) {
    return null;
  }

  const host = existing ?? document.createElement("div");
  host.id = ROOT_ID;

  if (!existing) {
    document.body.appendChild(host);
  }

  const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  const styleTag = document.createElement("style");
  styleTag.textContent = `${reactFlowStyles}\n${appStyles}`;
  shadowRoot.appendChild(styleTag);

  const app = document.createElement("div");
  app.id = APP_ID;
  app.className = "ti-root";
  shadowRoot.appendChild(app);

  return app;
}

function applyLayoutCompensation() {
  const appWidth = "min(60vw, 760px)";
  document.documentElement.style.setProperty("--thinking-ide-panel-width", appWidth);
  document.body.style.paddingRight = "var(--thinking-ide-panel-width)";
}

function boot() {
  if (!isTargetPage()) {
    return;
  }

  const mountNode = ensureMount();
  if (!mountNode) {
    return;
  }

  applyLayoutCompensation();

  const root = createRoot(mountNode);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

boot();
