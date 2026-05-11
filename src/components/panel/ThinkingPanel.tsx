import { RefreshCcw, Sparkles } from "lucide-react";
import { useThinkingStore } from "../../stores/useThinkingStore";
import { Button } from "../ui/button";
import { ConceptMapCanvas } from "../canvas/ConceptMapCanvas";

type ThinkingPanelProps = {
  onGenerate: () => Promise<void>;
};

export function ThinkingPanel({ onGenerate }: ThinkingPanelProps) {
  const { document, status, error } = useThinkingStore();
  const conversationTitle = document?.conversation.title || "Current chat";
  const nodeCount = document?.nodes.length ?? 0;
  const edgeCount = document?.edges.length ?? 0;

  return (
    <section className="ti-panel">
      <header className="ti-header">
        <div>
          <div className="ti-eyebrow">Thinking IDE</div>
          <h1>{conversationTitle}</h1>
        </div>
        <Button onClick={() => void onGenerate()}>
          <Sparkles size={16} />
          Regenerate Draft
        </Button>
      </header>

      <div className="ti-statusbar">
        <span>Status: {status}</span>
        <span>
          {nodeCount} nodes / {edgeCount} edges
        </span>
        <Button variant="ghost" onClick={() => void onGenerate()}>
          <RefreshCcw size={14} />
          Refresh chat scan
        </Button>
      </div>

      {error ? <div className="ti-error">{error}</div> : null}
      <ConceptMapCanvas />
    </section>
  );
}
