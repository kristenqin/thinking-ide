import { useEffect, useRef } from "react";
import { ThinkingPanel } from "../components/panel/ThinkingPanel";
import { buildThinkingDocument } from "../services/documentBuilder";
import { generateDraftMap } from "../services/generator";
import { getAssistantCompletionState, getConversationRef, scanMessages } from "../services/chatAdapter";
import { observeChatMutations } from "../services/messageObserver";
import { useThinkingStore } from "../stores/useThinkingStore";
import { createDefaultSettings } from "../models/settings";

const DEFAULT_SETTINGS = createDefaultSettings();

export function App() {
  const { document, hydrate, getDocument, replaceDocument, setStatus } = useThinkingStore();
  const conversation = getConversationRef();
  const autoGenerate = document?.settings.autoGenerate ?? DEFAULT_SETTINGS.autoGenerate;
  const lastAutoCompletionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    void hydrate(conversation.id);
  }, [conversation.id, hydrate]);

  useEffect(() => {
    lastAutoCompletionKeyRef.current = null;
  }, [conversation.id]);

  async function regenerate(mode: "auto" | "manual" = "manual", completionKey?: string | null) {
    if (mode === "auto" && completionKey && lastAutoCompletionKeyRef.current === completionKey) {
      return;
    }

    try {
      setStatus("generating");
      const { messages, sources } = scanMessages();
      const generated = generateDraftMap(messages, sources);
      const document = buildThinkingDocument({
        conversation,
        messages,
        sources,
        generatedNodes: generated.nodes,
        generatedEdges: generated.edges,
        settings: DEFAULT_SETTINGS,
        previous: getDocument()
      });

      await replaceDocument(document);

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
      setStatus("waiting");
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
      setStatus("waiting");
    }

    const handle = observeChatMutations((event) => {
      if (event.phase === "settled" && event.completionKey) {
        void regenerate("auto", event.completionKey);
        return;
      }

      setStatus("waiting");
    });

    return () => {
      handle.disconnect();
    };
  }, [autoGenerate, conversation.id, setStatus]);

  return <ThinkingPanel onGenerate={() => regenerate("manual")} />;
}
