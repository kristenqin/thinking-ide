import { RefreshCcw, Sparkles } from "lucide-react";
import { useThinkingStore } from "../../stores/useThinkingStore";
import { Button } from "../ui/button";
import { ConceptMapCanvas } from "../canvas/ConceptMapCanvas";

type ThinkingPanelProps = {
  onGenerate: () => Promise<void>;
};

export function ThinkingPanel({ onGenerate }: ThinkingPanelProps) {
  const { document, status, error, notice, recentAction, undoLastRemoval, setNotice } = useThinkingStore();
  const conversationTitle = document?.conversation.title || "Current chat";
  const nodeCount = document?.nodes.filter((node) => node.data.status !== "removed").length ?? 0;
  const edgeCount = document?.edges.filter((edge) => edge.data?.status !== "removed").length ?? 0;
  const sourceLostCount = document?.sources.filter((source) => source.status === "lost").length ?? 0;

  const statusLabel =
    status === "ready" ? "Synced" : status === "scanning" ? "Generating" : status === "error" ? "Needs review" : "Ready";
  const statusMessage =
    status === "ready"
      ? "Keep shaping the map directly on the canvas. Your edits stay local to this chat."
      : status === "scanning"
        ? "Scanning the current chat and refreshing the draft without interrupting your workspace."
        : error ?? "Something blocked map generation. You can try the current scan again.";
  const bottomLog = notice
    ? notice
    : document
      ? `Generated ${nodeCount} nodes · ${edgeCount} relations${sourceLostCount ? ` · ${sourceLostCount} source link${sourceLostCount > 1 ? "s" : ""} need review` : ""}`
      : "Start a conversation on the left and Thinking IDE will draft a concept map here.";

  return (
    <section className="ti-panel">
      <header className="ti-header">
        <div className="ti-header__identity">
          <div className="ti-header__eyebrow-row">
            <div className="ti-eyebrow">Thinking IDE</div>
            <span className={`ti-status-pill ti-status-pill--${status}`}>{statusLabel}</span>
          </div>
          <h1>{conversationTitle}</h1>
          <p className="ti-header__summary">A conversation workspace for shaping concepts, links, and source context.</p>
        </div>
        <div className="ti-header__actions">
          <Button onClick={() => void onGenerate()}>
            <Sparkles size={16} />
            Regenerate draft
          </Button>
        </div>
      </header>

      <div className="ti-statusbar">
        <div className="ti-statusbar__copy">
          <span className="ti-statusbar__label">{statusLabel}</span>
          <p>{statusMessage}</p>
        </div>
        <Button variant="ghost" className="ti-statusbar__action" onClick={() => void onGenerate()}>
          <RefreshCcw size={14} />
          Refresh scan
        </Button>
      </div>

      <div className="ti-panel__main">
        <ConceptMapCanvas />
      </div>

      <div className={`ti-bottomlog${error ? " is-error" : ""}${notice ? " has-notice" : ""}`}>
        <p className="ti-bottomlog__message">{bottomLog}</p>
        <div className="ti-bottomlog__actions">
          {recentAction ? (
            <Button
              variant="ghost"
              className="ti-bottomlog__button"
              onClick={() => {
                void undoLastRemoval();
              }}
            >
              Undo
            </Button>
          ) : null}
          {notice && !recentAction ? (
            <Button variant="ghost" className="ti-bottomlog__button" onClick={() => setNotice(undefined)}>
              Dismiss
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
