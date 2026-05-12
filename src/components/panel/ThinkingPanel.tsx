import { RefreshCcw, Settings2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useThinkingStore } from "../../stores/useThinkingStore";
import { Button } from "../ui/button";
import { ConceptMapCanvas } from "../canvas/ConceptMapCanvas";

type ThinkingPanelProps = {
  onGenerate: () => Promise<void>;
  onCollapse: () => void;
};

export function ThinkingPanel({ onGenerate, onCollapse }: ThinkingPanelProps) {
  const {
    document,
    status,
    error,
    notice,
    recentAction,
    undoLastRemoval,
    setNotice,
    setAutoGenerate,
    clearCurrentMap
  } = useThinkingStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const settingsCardRef = useRef<HTMLDivElement>(null);
  const conversationTitle = document?.conversation.title || "Current chat";
  const isGenericConversationTitle = /^(chatgpt|current chat)$/i.test(conversationTitle.trim());
  const displayConversationTitle = isGenericConversationTitle ? "Current chat" : conversationTitle;
  const autoGenerate = document?.settings.autoGenerate ?? true;
  const nodeCount = document?.nodes.filter((node) => node.data.status !== "removed").length ?? 0;
  const edgeCount = document?.edges.filter((edge) => edge.data?.status !== "removed").length ?? 0;
  const sourceLostCount = document?.sources.filter((source) => source.status === "lost").length ?? 0;
  const isWorkspaceEmpty = Boolean(document) && nodeCount === 0;
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
    status === "generating"
      ? "Scanning the current chat and refreshing the draft without interrupting your workspace."
      : status === "waiting"
        ? "Waiting for more conversation before expanding the current draft."
        : error ?? "Something blocked map generation. You can try the current scan again.";
  const showStatusBar = status === "generating" || status === "waiting" || status === "failed";
  const headerSummary = isWorkspaceEmpty
    ? "No concepts have been drafted from the visible chat yet. Continue or reopen the conversation on the left, then refresh once the latest reply is fully available."
    : "Shape the conversation into a concept map without leaving the chat flow.";
  const bottomLog = notice
    ? notice
    : isWorkspaceEmpty
      ? "No concepts available yet. Continue the conversation on the left, or refresh after the latest assistant reply finishes loading."
      : document
        ? `Map available for direct editing. ${mapSummary}.`
        : "Start a conversation on the left and Thinking IDE will draft a concept map here."
  const emptyWorkspaceLead = isWorkspaceEmpty
    ? "Thinking IDE is attached, but the current visible chat has not yielded a concept draft yet."
    : null;

  useEffect(() => {
    if (!isSettingsOpen) {
      setIsConfirmingClear(false);
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (settingsCardRef.current?.contains(target)) {
        return;
      }

      setIsSettingsOpen(false);
      setIsConfirmingClear(false);
    }

    window.addEventListener("pointerdown", handlePointerDown, true);
    return () => window.removeEventListener("pointerdown", handlePointerDown, true);
  }, [isSettingsOpen]);

  return (
    <section className="ti-panel">
      <header className="ti-header">
        <div className="ti-header__identity">
          <div className="ti-header__meta">
            <div className="ti-header__eyebrow-row">
              <div className="ti-eyebrow">Thinking IDE</div>
              <span className={`ti-status-pill ti-status-pill--${status}`}>{statusLabel}</span>
            </div>
          </div>
          <h1>{displayConversationTitle}</h1>
          <p className="ti-header__summary">{headerSummary}</p>
        </div>
        <div className="ti-header__actions">
          <Button variant="ghost" onClick={() => void onGenerate()}>
            <RefreshCcw size={14} />
            Refresh
          </Button>
          <div className="ti-settings-anchor">
            <Button
              variant="ghost"
              aria-expanded={isSettingsOpen}
              aria-haspopup="dialog"
              onClick={() => setIsSettingsOpen((open) => !open)}
            >
              <Settings2 size={14} />
              Settings
            </Button>
            {isSettingsOpen ? (
              <div className="ti-settings-card" ref={settingsCardRef} role="dialog" aria-label="Workspace settings">
                <div className="ti-floating-card__eyebrow">Workspace settings</div>
                <label className="ti-toggle-row" htmlFor="ti-auto-generate-toggle">
                  <div className="ti-toggle-row__copy">
                    <span>Auto-refresh from chat</span>
                    <p>Keep observing new chat messages and refresh the concept map automatically.</p>
                  </div>
                  <input
                    id="ti-auto-generate-toggle"
                    type="checkbox"
                    checked={autoGenerate}
                    onChange={(event) => {
                      void setAutoGenerate(event.currentTarget.checked);
                    }}
                  />
                </label>

                <div className="ti-settings-card__section">
                  <div className="ti-settings-card__label">Clear current map</div>
                  <p className="ti-settings-card__meta">
                    Remove the saved concept map for this chat and start fresh.
                  </p>
                  {isConfirmingClear ? (
                    <div className="ti-settings-card__confirm">
                      <p>This removes the saved map for this conversation. The chat itself stays untouched.</p>
                      <div className="ti-floating-card__actions">
                        <Button
                          variant="secondary"
                          className="ti-settings-card__danger"
                          onClick={() => {
                            void clearCurrentMap();
                            setIsSettingsOpen(false);
                            setIsConfirmingClear(false);
                          }}
                          disabled={!document}
                        >
                          <Trash2 size={14} />
                          Confirm clear
                        </Button>
                        <Button variant="ghost" onClick={() => setIsConfirmingClear(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="ti-settings-card__clear"
                      onClick={() => setIsConfirmingClear(true)}
                      disabled={!document}
                    >
                      <Trash2 size={14} />
                      Clear current map
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <Button variant="ghost" onClick={onCollapse}>
            Collapse
          </Button>
        </div>
      </header>

      {showStatusBar ? (
        <div className="ti-statusbar">
          <div className="ti-statusbar__copy">
            <span className="ti-statusbar__label">{statusLabel}</span>
            <p>{statusMessage}</p>
          </div>
          <div className="ti-statusbar__rail">
            <Button variant="ghost" className="ti-statusbar__action" onClick={() => void onGenerate()}>
              <RefreshCcw size={14} />
              Refresh
            </Button>
          </div>
        </div>
      ) : null}

      <div className="ti-panel__main">
        {emptyWorkspaceLead ? (
          <div className="ti-empty-workspace-callout" role="note">
            <div className="ti-empty-workspace-callout__eyebrow">Awaiting concept draft</div>
            <p>{emptyWorkspaceLead}</p>
          </div>
        ) : null}
        {document ? (
          <ConceptMapCanvas />
        ) : (
          <div className="ti-canvas-shell ti-canvas-shell--placeholder">
            <ConceptMapCanvas />
          </div>
        )}
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
