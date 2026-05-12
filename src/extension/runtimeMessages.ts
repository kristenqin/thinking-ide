import type { AssistantCompletionState, ScanMessagesResult } from "../services/chatAdapter";
import type { ConversationRef } from "../models/conversation";
import type { MessageRef } from "../models/messageRef";
import type { SourceRef } from "../models/source";
import type { RevealSourceResult } from "../services/sourceLocator";

export const MESSAGE_FETCH_CHAT_CONTEXT = "thinking-ide/fetch-chat-context";
export const MESSAGE_SCAN_CHAT = "thinking-ide/scan-chat";
export const MESSAGE_CHAT_SETTLED = "thinking-ide/chat-settled";
export const MESSAGE_ACTIVE_HOST_CHANGED = "thinking-ide/active-host-changed";
export const MESSAGE_CLOSE_SIDEPANEL = "thinking-ide/close-sidepanel";
export const MESSAGE_REVEAL_SOURCE = "thinking-ide/reveal-source";

export type FetchChatContextRequest = {
  type: typeof MESSAGE_FETCH_CHAT_CONTEXT;
};

export type FetchChatContextResponse = {
  conversation: ConversationRef;
  completion: AssistantCompletionState;
};

export type ScanChatRequest = {
  type: typeof MESSAGE_SCAN_CHAT;
  previousMessages: MessageRef[];
};

export type ScanChatResponse = ScanMessagesResult;

export type ChatSettledEvent = {
  type: typeof MESSAGE_CHAT_SETTLED;
  completionKey: string;
  conversationId: string;
};

export type ActiveHostChangedEvent = {
  type: typeof MESSAGE_ACTIVE_HOST_CHANGED;
  tabId: number;
  url?: string;
};

export type CloseSidePanelRequest = {
  type: typeof MESSAGE_CLOSE_SIDEPANEL;
};

export type RevealSourceRequest = {
  type: typeof MESSAGE_REVEAL_SOURCE;
  source?: SourceRef;
};

export type RevealSourceResponse = {
  result: RevealSourceResult;
};

export type RuntimeRequest = FetchChatContextRequest | ScanChatRequest | CloseSidePanelRequest | RevealSourceRequest;
