import { useEffect, useRef } from "react";
import { ThinkingPanel } from "../components/panel/ThinkingPanel";
import { buildThinkingDocument } from "../services/documentBuilder";
import { generateDraftMap } from "../services/generator";
import { getAssistantCompletionState, getConversationRef, scanMessages } from "../services/chatAdapter";
import { observeChatMutations, type MessageObserverHandle } from "../services/messageObserver";
import { useThinkingStore } from "../stores/useThinkingStore";
import { createDefaultSettings } from "../models/settings";

const DEFAULT_SETTINGS = createDefaultSettings();

type AppProps = {
  onCollapse: () => void;
};

export function App({ onCollapse }: AppProps) {
  const { document, hydrate, getDocument, replaceDocument, setNotice, setStatus } = useThinkingStore();
  const conversation = getConversationRef();
  const autoGenerate = document?.settings.autoGenerate ?? DEFAULT_SETTINGS.autoGenerate;
  const lastAutoCompletionKeyRef = useRef<string | null>(null);
  const observerHandleRef = useRef<MessageObserverHandle | null>(null);

  useEffect(() => {
    let cancelled = false;

    void hydrate(conversation.id).then(() => {
      if (cancelled) {
        return;
      }

      const restored = getDocument();
      if (restored?.conversation.id === conversation.id) {
        setNotice("Restored saved map for this conversation.");
        return;
      }

      setNotice(undefined);
    });

    return () => {
      cancelled = true;
    };
  }, [conversation.id, getDocument, hydrate, setNotice]);

  useEffect(() => {
    lastAutoCompletionKeyRef.current = null;
    observerHandleRef.current = null;
  }, [conversation.id]);

  function setIdleStatus() {
    setStatus(getDocument() ? "synced" : "waiting");
  }

  async function regenerate(mode: "auto" | "manual" = "manual", completionKey?: string | null) {
    if (mode === "auto" && completionKey && lastAutoCompletionKeyRef.current === completionKey) {
      return;
    }

    try {
      setStatus("generating");
      const previous = getDocument();
      const { messages, sources, history } = scanMessages(previous?.messages ?? []);

      if (
        previous?.conversation.conversationKey === conversation.conversationKey &&
        history.coverage === "partial"
      ) {
        setIdleStatus();
        setNotice(
          mode === "manual"
            ? "Refresh skipped because ChatGPT is only exposing part of this conversation right now. The restored map is unchanged."
            : "Restored saved map remains in place because ChatGPT is only exposing part of this conversation right now."
        );

        if (mode === "auto" && completionKey) {
          observerHandleRef.current?.resetCompletionDedup(completionKey);
        }
        return;
      }

      const generated = generateDraftMap(messages, sources);
      const document = buildThinkingDocument({
        conversation,
        messages,
        sources,
        generatedNodes: generated.nodes,
        generatedEdges: generated.edges,
        settings: DEFAULT_SETTINGS,
        previous
      });

      await replaceDocument(document);
      if (previous?.conversation.conversationKey === conversation.conversationKey) {
        setNotice("Restored map rebound to the currently available chat history.");
      } else if (mode === "manual") {
        setNotice("Map refreshed against the current chat history.");
      }

      const completionState = getAssistantCompletionState();
      if (completionState.latestMessageRole === "assistant" && completionState.completionKey) {
        lastAutoCompletionKeyRef.current = completionState.completionKey;
      }
    } catch (error) {
      setStatus("failed", error instanceof Error ? error.message : "Failed to generate concept map");
    }
  }

  useEffect(() => {
    if (!autoGenerate) {
      setIdleStatus();
      return;
    }

    const initialState = getAssistantCompletionState();
    if (
      initialState.latestMessageRole === "assistant" &&
      initialState.completionKey &&
      !initialState.isStreaming
    ) {
      void regenerate("auto", initialState.completionKey);
    } else {
      setIdleStatus();
    }

    const handle = observeChatMutations((event) => {
      if (event.phase === "settled" && event.completionKey) {
        void regenerate("auto", event.completionKey);
        return;
      }

      setIdleStatus();
    });
    observerHandleRef.current = handle;

    return () => {
      observerHandleRef.current = null;
      handle.disconnect();
    };
  }, [autoGenerate, conversation.id, document?.conversation.conversationKey, getDocument, setStatus]);

  return <ThinkingPanel onGenerate={() => regenerate("manual")} onCollapse={onCollapse} />;
}
