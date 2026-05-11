import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "../app/App";
import appStyles from "./content.css?inline";
import reactFlowStyles from "@xyflow/react/dist/style.css?inline";

const ROOT_ID = "thinking-ide-root";
const APP_ID = "thinking-ide-app";
const LIGHT_STYLE_ID = "thinking-ide-layout-style";
const TOGGLE_ID = "thinking-ide-layout-toggle";
const RAIL_ID = "thinking-ide-collapse-rail";
const LAYOUT_MODE_ATTR = "data-thinking-ide-layout-mode";
const PAGE_SHELL_ATTR = "data-thinking-ide-page-shell";
const COLLAPSED_ATTR = "data-thinking-ide-collapsed";
const PANEL_WIDTH = "clamp(560px, 60vw, 960px)";
const RAIL_WIDTH = "72px";

const LIGHT_DOM_LAYOUT_STYLES = `
html[${LAYOUT_MODE_ATTR}="layout"] {
  overflow-x: hidden;
}

body[${LAYOUT_MODE_ATTR}="layout"] {
  display: flex !important;
  align-items: stretch;
  min-height: 100vh;
  overflow-x: hidden;
}

body[${LAYOUT_MODE_ATTR}="layout"] > [${PAGE_SHELL_ATTR}="true"] {
  flex: 1 1 auto;
  min-width: 0;
  width: auto !important;
  max-width: none !important;
}

body[${LAYOUT_MODE_ATTR}="layout"] > [${PAGE_SHELL_ATTR}="true"] main {
  min-width: 0;
}
`;

type MountContext = {
  host: HTMLElement;
  shadowRoot: ShadowRoot;
  app: HTMLElement;
};

function isTargetPage(): boolean {
  if (/chatgpt\.com|chat\.openai\.com/.test(location.hostname)) {
    return true;
  }

  return (
    /localhost|127\.0\.0\.1/.test(location.hostname) &&
    document.documentElement.getAttribute("data-thinking-ide-runtime-validation") === "true"
  );
}

function ensureMount(): MountContext | null {
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

  return { host, shadowRoot, app };
}

function ensureLightDomLayoutStyles() {
  if (document.getElementById(LIGHT_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = LIGHT_STYLE_ID;
  style.textContent = LIGHT_DOM_LAYOUT_STYLES;
  (document.head ?? document.documentElement).appendChild(style);
}

function isVisibleBodyChild(element: Element, host: HTMLElement): element is HTMLElement {
  if (!(element instanceof HTMLElement) || element === host) {
    return false;
  }

  if (["SCRIPT", "STYLE", "LINK", "NOSCRIPT", "TEMPLATE"].includes(element.tagName)) {
    return false;
  }

  if (element.hidden) {
    return false;
  }

  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.display === "none" || computedStyle.visibility === "hidden") {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
}

function clearPageShellMarker() {
  document.querySelectorAll(`[${PAGE_SHELL_ATTR}="true"]`).forEach((element) => {
    element.removeAttribute(PAGE_SHELL_ATTR);
  });
}

function resolvePrimaryPageRoot(host: HTMLElement): HTMLElement | null {
  const main = document.querySelector("main");
  if (!(main instanceof HTMLElement)) {
    return null;
  }

  const candidates = Array.from(document.body.children).filter((element) => isVisibleBodyChild(element, host));
  const pageRoot = candidates.find((element) => element.contains(main));

  if (!(pageRoot instanceof HTMLElement)) {
    return null;
  }

  return candidates.length === 1 ? pageRoot : null;
}

function applyOverlayMode(host: HTMLElement) {
  if (document.querySelector(`[${PAGE_SHELL_ATTR}="true"]`)) {
    clearPageShellMarker();
  }

  if (document.documentElement.getAttribute(LAYOUT_MODE_ATTR) !== "overlay") {
    document.documentElement.setAttribute(LAYOUT_MODE_ATTR, "overlay");
  }

  if (document.body.getAttribute(LAYOUT_MODE_ATTR) !== "overlay") {
    document.body.setAttribute(LAYOUT_MODE_ATTR, "overlay");
  }

  if (host.getAttribute(LAYOUT_MODE_ATTR) !== "overlay") {
    host.setAttribute(LAYOUT_MODE_ATTR, "overlay");
  }

  document.body.style.paddingRight = "var(--thinking-ide-panel-width)";
}

function applyLayoutMode(host: HTMLElement): boolean {
  ensureLightDomLayoutStyles();

  const pageRoot = resolvePrimaryPageRoot(host);
  if (!pageRoot) {
    return false;
  }

  const currentPageShell = document.querySelector(`[${PAGE_SHELL_ATTR}="true"]`);
  if (currentPageShell !== pageRoot) {
    clearPageShellMarker();
    pageRoot.setAttribute(PAGE_SHELL_ATTR, "true");
  }

  if (document.documentElement.getAttribute(LAYOUT_MODE_ATTR) !== "layout") {
    document.documentElement.setAttribute(LAYOUT_MODE_ATTR, "layout");
  }

  if (document.body.getAttribute(LAYOUT_MODE_ATTR) !== "layout") {
    document.body.setAttribute(LAYOUT_MODE_ATTR, "layout");
  }

  if (host.getAttribute(LAYOUT_MODE_ATTR) !== "layout") {
    host.setAttribute(LAYOUT_MODE_ATTR, "layout");
  }

  document.body.style.paddingRight = "";
  return true;
}

function ensureExpandRail(host: HTMLElement, shadowRoot: ShadowRoot) {
  if (shadowRoot.getElementById(RAIL_ID)) {
    return;
  }

  const rail = document.createElement("div");
  rail.id = RAIL_ID;
  rail.className = "ti-collapse-rail";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "ti-button ti-button--ghost ti-collapse-rail__toggle";
  button.textContent = "Expand thinking workspace";
  button.addEventListener("click", () => {
    setCollapsed(host, shadowRoot, false);
  });

  const identity = document.createElement("div");
  identity.className = "ti-collapse-rail__identity";

  const eyebrow = document.createElement("div");
  eyebrow.className = "ti-eyebrow";
  eyebrow.textContent = "Thinking IDE";

  identity.appendChild(eyebrow);
  rail.append(button, identity);
  shadowRoot.appendChild(rail);
}

function ensureCollapseToggle(host: HTMLElement, shadowRoot: ShadowRoot) {
  let button = shadowRoot.getElementById(TOGGLE_ID) as HTMLButtonElement | null;

  if (!(button instanceof HTMLButtonElement)) {
    button = document.createElement("button");
    button.id = TOGGLE_ID;
    button.type = "button";
    button.className = "ti-layout-toggle";
    button.addEventListener("click", () => {
      setCollapsed(host, shadowRoot, true);
    });
    shadowRoot.appendChild(button);
  }

  button.setAttribute("aria-label", "Collapse Thinking IDE panel");
  button.setAttribute("aria-expanded", "true");

  const glyph = document.createElement("span");
  glyph.className = "ti-layout-toggle__glyph";
  glyph.textContent = "⟩";

  const label = document.createElement("span");
  label.className = "ti-layout-toggle__label";
  label.textContent = "Collapse";

  button.replaceChildren(glyph, label);
}

function syncWorkspaceControls(host: HTMLElement, shadowRoot: ShadowRoot) {
  const collapsed = host.getAttribute(COLLAPSED_ATTR) === "true";

  if (collapsed) {
    shadowRoot.getElementById(TOGGLE_ID)?.remove();
    ensureExpandRail(host, shadowRoot);
    return;
  }

  shadowRoot.getElementById(RAIL_ID)?.remove();
  ensureCollapseToggle(host, shadowRoot);
}

function setCollapsed(host: HTMLElement, shadowRoot: ShadowRoot, collapsed: boolean) {
  host.setAttribute(COLLAPSED_ATTR, String(collapsed));
  syncWorkspaceControls(host, shadowRoot);
}

function startLayoutController(host: HTMLElement, shadowRoot: ShadowRoot) {
  host.style.setProperty("--thinking-ide-panel-width", PANEL_WIDTH);
  host.style.setProperty("--thinking-ide-rail-width", RAIL_WIDTH);
  setCollapsed(host, shadowRoot, false);

  let frame = 0;
  const refresh = () => {
    frame = 0;

    if (!applyLayoutMode(host)) {
      applyOverlayMode(host);
    }
  };

  const queueRefresh = () => {
    if (frame) {
      return;
    }

    frame = window.requestAnimationFrame(refresh);
  };

  queueRefresh();
  window.addEventListener("resize", queueRefresh, { passive: true });
  window.addEventListener("pageshow", queueRefresh);
  window.addEventListener("popstate", queueRefresh);
}

function boot() {
  if (!isTargetPage()) {
    return;
  }

  const mount = ensureMount();
  if (!mount) {
    return;
  }

  startLayoutController(mount.host, mount.shadowRoot);

  const root = createRoot(mount.app);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

boot();
