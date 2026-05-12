import type { ConversationRef } from "../models/conversation";
import type { MessageRef } from "../models/messageRef";
import type { SourceRef } from "../models/source";
import type { AssistantCompletionState, ScanMessagesResult } from "./chatAdapter";
import type { RevealSourceResult, RevealTargetHint } from "./sourceLocator";
import {
  MESSAGE_ACTIVE_HOST_CHANGED,
  MESSAGE_CHAT_SETTLED,
  MESSAGE_CLOSE_SIDEPANEL,
  MESSAGE_FETCH_CHAT_CONTEXT,
  MESSAGE_REVEAL_SOURCE,
  MESSAGE_SCAN_CHAT,
  type ActiveHostChangedEvent,
  type ChatSettledEvent,
  type FetchChatContextResponse,
  type RevealSourceResponse,
  type ScanChatResponse
} from "../extension/runtimeMessages";

export type ActiveChatContext = {
  conversation: ConversationRef;
  completion: AssistantCompletionState;
};

type SettledListener = (event: ChatSettledEvent) => void;
type ActiveHostChangeListener = (event: ActiveHostChangedEvent) => void;

function isSupportedHostTab(tab: chrome.tabs.Tab | undefined): tab is chrome.tabs.Tab & { id: number; url: string } {
  if (!tab?.id || !tab.url) {
    return false;
  }

  return (
    /^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(tab.url) ||
    /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(tab.url)
  );
}

export async function getActiveHostTab(): Promise<(chrome.tabs.Tab & { id: number; url: string }) | null> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const activeSupported = tabs.find(
    (tab): tab is chrome.tabs.Tab & { id: number; url: string } => tab.active === true && isSupportedHostTab(tab)
  );
  if (activeSupported) {
    return activeSupported;
  }

  const fallback = tabs
    .filter(isSupportedHostTab)
    .sort((left, right) => (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0))[0];

  return fallback ?? null;
}

async function sendMessageToActiveTab<TResponse>(message: object): Promise<TResponse> {
  const tab = await getActiveHostTab();
  if (!tab) {
    throw new Error("Thinking IDE could not find an active supported chat tab.");
  }

  return chrome.tabs.sendMessage(tab.id, message) as Promise<TResponse>;
}

export async function fetchActiveChatContext(): Promise<ActiveChatContext> {
  return sendMessageToActiveTab<FetchChatContextResponse>({
    type: MESSAGE_FETCH_CHAT_CONTEXT
  });
}

export async function scanActiveChat(previousMessages: MessageRef[]): Promise<ScanMessagesResult> {
  return sendMessageToActiveTab<ScanChatResponse>({
    type: MESSAGE_SCAN_CHAT,
    previousMessages
  });
}

export async function closeSidePanel(): Promise<void> {
  await chrome.runtime.sendMessage({
    type: MESSAGE_CLOSE_SIDEPANEL
  });
}

export async function revealSourceInActiveChat(
  source: SourceRef | undefined,
  targetHint?: RevealTargetHint
): Promise<RevealSourceResult> {
  const response = await sendMessageToActiveTab<RevealSourceResponse>({
    type: MESSAGE_REVEAL_SOURCE,
    source,
    targetHint
  });

  return response.result;
}

export function subscribeToSettledMessages(listener: SettledListener): () => void {
  const runtimeListener: Parameters<typeof chrome.runtime.onMessage.addListener>[0] = (message, sender) => {
    if (!message || typeof message !== "object" || message.type !== MESSAGE_CHAT_SETTLED) {
      return;
    }

    void (async () => {
      const activeTab = await getActiveHostTab();
      if (!activeTab || sender.tab?.id !== activeTab.id) {
        return;
      }

      listener(message as ChatSettledEvent);
    })();
  };

  chrome.runtime.onMessage.addListener(runtimeListener);
  return () => chrome.runtime.onMessage.removeListener(runtimeListener);
}

export function subscribeToActiveHostChanges(listener: ActiveHostChangeListener): () => void {
  let timeoutId: number | undefined;

  const runtimeListener: Parameters<typeof chrome.runtime.onMessage.addListener>[0] = (message) => {
    if (!message || typeof message !== "object" || message.type !== MESSAGE_ACTIVE_HOST_CHANGED) {
      return;
    }

    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      timeoutId = undefined;
      listener(message as ActiveHostChangedEvent);
    }, 120);
  };

  chrome.runtime.onMessage.addListener(runtimeListener);
  return () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    chrome.runtime.onMessage.removeListener(runtimeListener);
  };
}
