import { MESSAGE_ACTIVE_HOST_CHANGED, MESSAGE_CLOSE_SIDEPANEL, type ActiveHostChangedEvent } from "./runtimeMessages";

const SIDEPANEL_PATH = "sidepanel.html";
const SUPPORTED_HOST_PATTERN = /^https:\/\/(chatgpt\.com|chat\.openai\.com)\//;
const SUPPORTED_LOCAL_PATTERN = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//;

type SidePanelCloseOptions = {
  tabId?: number;
  windowId?: number;
};

type SidePanelApiWithClose = typeof chrome.sidePanel & {
  close?: (options: SidePanelCloseOptions) => Promise<void>;
};

function isSupportedHostUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  return SUPPORTED_HOST_PATTERN.test(url) || SUPPORTED_LOCAL_PATTERN.test(url);
}

async function ensurePanelBehavior() {
  await chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true
  });
}

async function syncSidePanelForTab(tabId: number, url: string | undefined) {
  await chrome.sidePanel.setOptions({
    tabId,
    path: SIDEPANEL_PATH,
    enabled: isSupportedHostUrl(url)
  });
}

async function notifyActiveHostChanged(tabId: number, url: string | undefined) {
  const event: ActiveHostChangedEvent = {
    type: MESSAGE_ACTIVE_HOST_CHANGED,
    tabId,
    url
  };

  await chrome.runtime.sendMessage(event).catch(() => undefined);
}

async function syncExistingTabs() {
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs
      .filter((tab): tab is chrome.tabs.Tab & { id: number } => typeof tab.id === "number")
      .map((tab) => syncSidePanelForTab(tab.id, tab.url))
  );
}

async function closeSidePanelForActiveContext() {
  const sidePanelApi = chrome.sidePanel as SidePanelApiWithClose;
  if (!sidePanelApi.close) {
    console.info("Thinking IDE side panel close API is unavailable in this Chrome build.");
    return;
  }

  const [activeTab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  });

  if (typeof activeTab?.windowId !== "number") {
    return;
  }

  await sidePanelApi.close({
    windowId: activeTab.windowId
  });
}

async function initializeSidePanel() {
  await ensurePanelBehavior();
  await syncExistingTabs();
}

chrome.runtime.onInstalled.addListener(() => {
  console.info("Thinking IDE installed.");
  void initializeSidePanel();
});

chrome.runtime.onStartup.addListener(() => {
  void initializeSidePanel();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== "complete") {
    return;
  }

  const nextUrl = changeInfo.url ?? tab.url;
  void syncSidePanelForTab(tabId, nextUrl);

  if (tab.active) {
    void notifyActiveHostChanged(tabId, nextUrl);
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  void chrome.tabs
    .get(tabId)
    .then(async (tab) => {
      await syncSidePanelForTab(tabId, tab.url);
      await notifyActiveHostChanged(tabId, tab.url);
    })
    .catch(() => undefined);
});

chrome.runtime.onMessage.addListener((message) => {
  if (!message || typeof message !== "object") {
    return;
  }

  if (message.type === MESSAGE_CLOSE_SIDEPANEL) {
    void closeSidePanelForActiveContext();
  }
});

void initializeSidePanel();
