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
  const mapSummary = document
    ? `${nodeCount} concepts · ${edgeCount} relations${sourceLostCount ? ` · ${sourceLostCount} source issue${sourceLostCount > 1 ? "s" : ""}` : ""}`
    : "Concept map workspace";

  const statusLabel =
    status === "synced"
      ? "Synced"
      : status === "generating"
        ? "Generating"
        : status === "failed"
          ? "Needs review"
          : status === "waiting"
            ? "Waiting"
            : "Ready";
  const statusMessage =
    status === "synced"
      ? "Keep shaping the map directly on the canvas. Your edits stay local to this chat."
      : status === "generating"
        ? "Scanning the current chat and refreshing the draft without interrupting your workspace."
      : status === "waiting"
        ? "Waiting for more conversation before expanding the current draft."
      : error ?? "Something blocked map generation. You can try the current scan again.";
  const bottomLog = notice
    ? notice
    : document
      ? `Map available for direct editing. ${mapSummary}.`
      : "Start a conversation on the left and Thinking IDE will draft a concept map here.";

  return (
    <section className="ti-panel">
      <header className="ti-header">
        <div className="ti-header__identity">
          <div className="ti-header__meta">
            <div className="ti-header__eyebrow-row">
              <div className="ti-eyebrow">Thinking IDE</div>
              <span className={`ti-status-pill ti-status-pill--${status}`}>{statusLabel}</span>
            </div>
            <p className="ti-header__kicker">{mapSummary}</p>
          </div>
          <h1>{conversationTitle}</h1>
          <p className="ti-header__summary">
            Shape the conversation into a concept map without leaving the chat flow.
          </p>
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
        <div className="ti-statusbar__rail" aria-label="workspace guidance">
          <div className="ti-status-chip">Click to select</div>
          <div className="ti-status-chip">Double-click to rename</div>
          <div className="ti-status-chip">Drag to arrange</div>
          <Button variant="ghost" className="ti-statusbar__action" onClick={() => void onGenerate()}>
            <RefreshCcw size={14} />
            Refresh scan
          </Button>
        </div>
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
