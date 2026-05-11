import { useEffect } from "react";
import { ThinkingPanel } from "../components/panel/ThinkingPanel";
import type { ThinkingDocument } from "../models/document";
import { generateDraftMap } from "../services/generator";
import { getConversationRef, scanMessages } from "../services/chatAdapter";
import { useThinkingStore } from "../stores/useThinkingStore";

const DEFAULT_SETTINGS = {
  panelMode: "layout" as const,
  panelWidth: 720
};

export function App() {
  const { hydrate, replaceDocument, setStatus } = useThinkingStore();
  const conversation = getConversationRef();

  useEffect(() => {
    void hydrate(conversation.id);
  }, [conversation.id, hydrate]);

  async function regenerate() {
    try {
      setStatus("scanning");
      const { messages, sources } = scanMessages();
      const generated = generateDraftMap(messages, sources);

      const document: ThinkingDocument = {
        conversation: {
          ...conversation,
          updatedAt: new Date().toISOString()
        },
        messages,
        sources,
        nodes: generated.nodes,
        edges: generated.edges,
        settings: DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString()
      };

      await replaceDocument(document);
    } catch (error) {
      setStatus("error", error instanceof Error ? error.message : "Failed to generate concept map");
    }
  }

  useEffect(() => {
    void regenerate();
  }, []);

  return <ThinkingPanel onGenerate={regenerate} />;
}
