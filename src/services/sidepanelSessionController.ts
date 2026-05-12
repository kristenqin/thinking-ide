import type { ConversationRef } from "../models/conversation";
import type { ThinkingDocument } from "../models/document";
import { createDefaultSettings } from "../models/settings";
import {
  closeSidePanel,
  fetchActiveChatContext,
  scanActiveChat,
  subscribeToActiveHostChanges,
  subscribeToSettledMessages,
  type ActiveChatContext
} from "./activeChatRuntime";
import { buildThinkingDocument } from "./documentBuilder";
import { generateDraftMap } from "./generator";

const DEFAULT_SETTINGS = createDefaultSettings();
const RETRY_DELAY_MS = 350;

type SyncSource = "initial" | "host-change";
type RegenerateMode = "auto" | "manual";
type Status = "ready" | "waiting" | "generating" | "synced" | "failed";

type SidepanelSessionStorePort = {
  hydrate: (conversationId: string) => Promise<void>;
  getDocument: () => ThinkingDocument | undefined;
  replaceDocument: (document: ThinkingDocument) => Promise<void>;
  setNotice: (notice?: string) => void;
  setStatus: (status: Status, error?: string) => void;
};

type SidepanelSessionControllerOptions = {
  autoGenerate: boolean;
  store: SidepanelSessionStorePort;
  runtime?: SidepanelRuntimePort;
};

export type SidepanelSessionController = {
  start: () => void;
  dispose: () => void;
  regenerate: (mode?: RegenerateMode) => Promise<void>;
  closePanel: () => Promise<void>;
  setAutoGenerate: (enabled: boolean) => void;
};

type SidepanelRuntimePort = {
  closeSidePanel: typeof closeSidePanel;
  fetchActiveChatContext: typeof fetchActiveChatContext;
  scanActiveChat: typeof scanActiveChat;
  subscribeToActiveHostChanges: typeof subscribeToActiveHostChanges;
  subscribeToSettledMessages: typeof subscribeToSettledMessages;
};

const defaultRuntimePort: SidepanelRuntimePort = {
  closeSidePanel,
  fetchActiveChatContext,
  scanActiveChat,
  subscribeToActiveHostChanges,
  subscribeToSettledMessages
};

function getRestoredIdleNotice() {
  return "Restored saved map for this conversation. Refresh after more history loads if source links still need recovery.";
}

function getPartialHistoryNotice(mode: RegenerateMode) {
  return mode === "manual"
    ? "Refresh skipped because only part of this conversation is visible right now. The saved map remains unchanged."
    : "Saved map stays in place because only part of this conversation is visible right now.";
}

function getReboundNotice() {
  return "Restored map rebound against the currently visible conversation window.";
}

function getManualRefreshNotice() {
  return "Map refreshed against the current chat history.";
}

export function createSidepanelSessionController({
  autoGenerate: initialAutoGenerate,
  store,
  runtime = defaultRuntimePort
}: SidepanelSessionControllerOptions): SidepanelSessionController {
  let autoGenerate = initialAutoGenerate;
  let activeConversation: ConversationRef | null = null;
  let lastAutoCompletionKey: string | null = null;
  let lastConversationId: string | null = null;
  let contextSyncToken = 0;
  let retryTimeoutId: number | undefined;
  let disposed = false;
  let unsubscribeSettled: () => void = () => undefined;
  let unsubscribeHostChanges: () => void = () => undefined;

  function setIdleStatus() {
    store.setStatus(store.getDocument() ? "synced" : "waiting");
  }

  async function syncContext(source: SyncSource = "initial") {
    const token = contextSyncToken + 1;
    contextSyncToken = token;

    try {
      const context = await runtime.fetchActiveChatContext();
      if (disposed || contextSyncToken !== token) {
        return;
      }

      activeConversation = context.conversation;
      if (lastConversationId !== context.conversation.id) {
        lastConversationId = context.conversation.id;
        lastAutoCompletionKey = null;
      }

      await store.hydrate(context.conversation.id);
      if (disposed || contextSyncToken !== token) {
        return;
      }

      const restored = store.getDocument();
      if (restored?.conversation.id === context.conversation.id) {
        store.setNotice(getRestoredIdleNotice());
      } else if (source === "initial") {
        store.setNotice(undefined);
      }

      if (shouldAutoRegenerate(context)) {
        void regenerate("auto", context.completion.completionKey, context.conversation);
        return;
      }

      setIdleStatus();
    } catch (error) {
      if (disposed) {
        return;
      }

      activeConversation = null;
      store.setStatus(
        "waiting",
        error instanceof Error ? error.message : "No supported chat tab is active."
      );
    }
  }

  function shouldAutoRegenerate(context: ActiveChatContext): context is ActiveChatContext & {
    completion: ActiveChatContext["completion"] & { completionKey: string };
  } {
    return (
      autoGenerate &&
      context.completion.latestMessageRole === "assistant" &&
      Boolean(context.completion.completionKey) &&
      !context.completion.isStreaming &&
      lastAutoCompletionKey !== context.completion.completionKey
    );
  }

  async function regenerate(
    mode: RegenerateMode = "manual",
    completionKey?: string | null,
    conversation: ConversationRef | null = activeConversation
  ) {
    if (!conversation) {
      store.setStatus("waiting", "Thinking IDE could not find an active supported chat tab.");
      return;
    }

    if (mode === "auto" && completionKey && lastAutoCompletionKey === completionKey) {
      return;
    }

    try {
      store.setStatus("generating");
      const previous = store.getDocument();
      const { messages, sources, history } = await runtime.scanActiveChat(previous?.messages ?? []);

      if (
        previous?.conversation.conversationKey === conversation.conversationKey &&
        history.coverage === "partial"
      ) {
        setIdleStatus();
        store.setNotice(getPartialHistoryNotice(mode));
        return;
      }

      const generated = generateDraftMap(messages, sources);
      const nextDocument = buildThinkingDocument({
        conversation,
        messages,
        sources,
        generatedNodes: generated.nodes,
        generatedEdges: generated.edges,
        settings: DEFAULT_SETTINGS,
        previous
      });

      await store.replaceDocument(nextDocument);
      if (previous?.conversation.conversationKey === conversation.conversationKey) {
        store.setNotice(getReboundNotice());
      } else if (mode === "manual") {
        store.setNotice(getManualRefreshNotice());
      }

      const { completion } = await runtime.fetchActiveChatContext();
      if (completion.latestMessageRole === "assistant" && completion.completionKey) {
        lastAutoCompletionKey = completion.completionKey;
      }
    } catch (error) {
      store.setStatus(
        "failed",
        error instanceof Error ? error.message : "Failed to generate concept map"
      );
    }
  }

  function start() {
    void syncContext("initial");
    retryTimeoutId = window.setTimeout(() => {
      if (!activeConversation) {
        void syncContext("host-change");
      }
    }, RETRY_DELAY_MS);

    unsubscribeSettled = runtime.subscribeToSettledMessages((event) => {
      if (!autoGenerate || !activeConversation || event.conversationId !== activeConversation.id) {
        return;
      }

      void regenerate("auto", event.completionKey, activeConversation);
    });

    unsubscribeHostChanges = runtime.subscribeToActiveHostChanges(() => {
      void syncContext("host-change");
    });
  }

  function dispose() {
    disposed = true;
    if (retryTimeoutId) {
      window.clearTimeout(retryTimeoutId);
    }
    unsubscribeSettled();
    unsubscribeHostChanges();
  }

  return {
    start,
    dispose,
    regenerate(mode = "manual") {
      return regenerate(mode);
    },
    closePanel() {
      return runtime.closeSidePanel();
    },
    setAutoGenerate(enabled) {
      autoGenerate = enabled;
    }
  };
}
