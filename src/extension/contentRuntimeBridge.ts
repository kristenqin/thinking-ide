import { getAssistantCompletionState, getConversationRef, scanMessages } from "../services/chatAdapter";
import { observeChatMutations, type MessageObserverHandle } from "../services/messageObserver";
import { revealSource } from "../services/sourceLocator";
import {
  MESSAGE_CHAT_SETTLED,
  MESSAGE_FETCH_CHAT_CONTEXT,
  MESSAGE_REVEAL_SOURCE,
  MESSAGE_SCAN_CHAT,
  type ChatSettledEvent,
  type FetchChatContextRequest,
  type FetchChatContextResponse,
  type RevealSourceRequest,
  type RevealSourceResponse,
  type ScanChatRequest,
  type ScanChatResponse
} from "./runtimeMessages";

const BRIDGE_STATE_KEY = "__thinkingIdeContentRuntimeBridge";

type RuntimeBridgeState = {
  disconnect: () => void;
};

type RuntimeBridgeWindow = Window & {
  [BRIDGE_STATE_KEY]?: RuntimeBridgeState;
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

function isRuntimeRequest(message: unknown): message is FetchChatContextRequest | ScanChatRequest | RevealSourceRequest {
  if (!message || typeof message !== "object" || !("type" in message)) {
    return false;
  }

  return (
    message.type === MESSAGE_FETCH_CHAT_CONTEXT ||
    message.type === MESSAGE_SCAN_CHAT ||
    message.type === MESSAGE_REVEAL_SOURCE
  );
}

function createRuntimeMessageListener(): Parameters<typeof chrome.runtime.onMessage.addListener>[0] {
  return (message, _sender, sendResponse) => {
    if (!isRuntimeRequest(message)) {
      return undefined;
    }

    if (message.type === MESSAGE_FETCH_CHAT_CONTEXT) {
      const response: FetchChatContextResponse = {
        conversation: getConversationRef(),
        completion: getAssistantCompletionState()
      };
      sendResponse(response);
      return false;
    }

    if (message.type === MESSAGE_REVEAL_SOURCE) {
      const response: RevealSourceResponse = {
        result: revealSource(message.source)
      };
      sendResponse(response);
      return false;
    }

    const response: ScanChatResponse = scanMessages(message.previousMessages);
    sendResponse(response);
    return false;
  };
}

function emitSettledAssistant(completionKey: string) {
  const conversation = getConversationRef();
  const event: ChatSettledEvent = {
    type: MESSAGE_CHAT_SETTLED,
    completionKey,
    conversationId: conversation.id
  };

  void chrome.runtime.sendMessage(event).catch(() => {
    // Ignore missing runtime listeners while keeping the content observer alive.
  });
}

function createSettledObserver(): MessageObserverHandle {
  return observeChatMutations((event) => {
    if (event.phase !== "settled" || !event.completionKey) {
      return;
    }

    emitSettledAssistant(event.completionKey);
  });
}

function createRuntimeBridge(): RuntimeBridgeState {
  const observer = createSettledObserver();
  const runtimeListener = createRuntimeMessageListener();
  chrome.runtime.onMessage.addListener(runtimeListener);

  return {
    disconnect() {
      observer.disconnect();
      chrome.runtime.onMessage.removeListener(runtimeListener);
    }
  };
}

export function bootContentRuntimeBridge() {
  if (!isTargetPage()) {
    return;
  }

  document.documentElement.setAttribute("data-thinking-ide-runtime-id", chrome.runtime.id);

  const runtimeWindow = window as RuntimeBridgeWindow;
  runtimeWindow[BRIDGE_STATE_KEY]?.disconnect();
  runtimeWindow[BRIDGE_STATE_KEY] = createRuntimeBridge();
}
