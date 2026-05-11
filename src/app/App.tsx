import { useEffect } from "react";
import { ThinkingPanel } from "../components/panel/ThinkingPanel";
import { buildThinkingDocument } from "../services/documentBuilder";
import { generateDraftMap } from "../services/generator";
import { getConversationRef, scanMessages } from "../services/chatAdapter";
import { observeChatMutations } from "../services/messageObserver";
import { useThinkingStore } from "../stores/useThinkingStore";

const DEFAULT_SETTINGS = {
  panelMode: "layout" as const,
  panelWidth: 720
};

export function App() {
  const { hydrate, getDocument, replaceDocument, setStatus } = useThinkingStore();
  const conversation = getConversationRef();

  useEffect(() => {
    void hydrate(conversation.id);
  }, [conversation.id, hydrate]);

  async function regenerate() {
    try {
      setStatus("scanning");
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
      setStatus("error", error instanceof Error ? error.message : "Failed to generate concept map");
    }
  }

  useEffect(() => {
    void regenerate();
  }, []);

  useEffect(() => {
    const handle = observeChatMutations(() => {
      void regenerate();
    });

    return () => {
      handle.disconnect();
    };
  }, []);

  return <ThinkingPanel onGenerate={regenerate} />;
}
