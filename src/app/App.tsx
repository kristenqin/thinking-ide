import { useEffect } from "react";
import { ThinkingPanel } from "../components/panel/ThinkingPanel";
import { buildThinkingDocument } from "../services/documentBuilder";
import { generateDraftMap } from "../services/generator";
import { getConversationRef, scanMessages } from "../services/chatAdapter";
import { observeChatMutations } from "../services/messageObserver";
import { useThinkingStore } from "../stores/useThinkingStore";
import { createDefaultSettings } from "../models/settings";

const DEFAULT_SETTINGS = createDefaultSettings();

export function App() {
  const { document, hydrate, getDocument, replaceDocument, setStatus } = useThinkingStore();
  const conversation = getConversationRef();
  const autoGenerate = document?.settings.autoGenerate ?? DEFAULT_SETTINGS.autoGenerate;

  useEffect(() => {
    void hydrate(conversation.id);
  }, [conversation.id, hydrate]);

  async function regenerate() {
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
    } catch (error) {
      setStatus("failed", error instanceof Error ? error.message : "Failed to generate concept map");
    }
  }

  useEffect(() => {
    void regenerate();
  }, []);

  useEffect(() => {
    if (!autoGenerate) {
      setStatus("waiting");
      return;
    }

    const handle = observeChatMutations(() => {
      void regenerate();
    });

    return () => {
      handle.disconnect();
    };
  }, [autoGenerate, setStatus]);

  return <ThinkingPanel onGenerate={regenerate} />;
}
