import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "../app/App";
import appStyles from "./content.css?inline";
import reactFlowStyles from "@xyflow/react/dist/style.css?inline";

const ROOT_ID = "thinking-ide-sidepanel-root";
const APP_ID = "thinking-ide-sidepanel-app";
const SHELL_MODE_ATTR = "data-thinking-ide-layout-mode";

function ensureMount() {
  const existing = document.getElementById(ROOT_ID);
  if (existing?.shadowRoot?.getElementById(APP_ID)) {
    return null;
  }

  const host = existing ?? document.createElement("div");
  host.id = ROOT_ID;
  host.setAttribute(SHELL_MODE_ATTR, "sidepanel");

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

  return { app };
}

function bootSidePanel() {
  document.body.style.margin = "0";
  document.body.style.height = "100vh";
  document.body.style.minHeight = "100vh";
  document.body.style.overflow = "hidden";
  document.body.style.background = "#f6f5f2";

  const mount = ensureMount();
  if (!mount) {
    return;
  }

  const root = createRoot(mount.app);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootSidePanel();
