import { RefreshCcw, Settings2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useThinkingStore } from "../../stores/useThinkingStore";
import { Button } from "../ui/button";
import { ConceptMapCanvas } from "../canvas/ConceptMapCanvas";

type ThinkingPanelProps = {
  onGenerate: () => Promise<void>;
  onCollapse: () => void;
};

type ShellNoticeTone = "neutral" | "info" | "warning" | "success" | "error";

type ShellCallout = {
  eyebrow: string;
  message: string;
  tone: Exclude<ShellNoticeTone, "neutral" | "success">;
};

function getShellNoticeTone(options: {
  status: string;
  error?: string;
  notice?: string;
}): ShellNoticeTone {
  const { status, error, notice } = options;

  if (status === "failed" || error) {
    return "error";
  }

  if (notice?.includes("only part of this conversation is visible")) {
    return "warning";
  }

  if (notice?.startsWith("Restored")) {
    return "info";
  }

  if (notice?.startsWith("Map refreshed")) {
    return "success";
  }

  return "neutral";
}

function getShellCallout(options: {
  notice?: string;
  isWorkspaceEmpty: boolean;
  documentPresent: boolean;
}): ShellCallout | null {
  const { notice, isWorkspaceEmpty, documentPresent } = options;

  if (notice?.startsWith("Restored saved map")) {
    return {
      eyebrow: "Restored locally",
      message: "This panel reopened a saved draft for the active conversation. Refresh again after more history loads if source links still need review.",
      tone: "info"
    };
  }

  if (notice?.startsWith("Restored map rebound")) {
    return {
      eyebrow: "Visible history rebound",
      message: "The saved draft is currently rebound against the visible conversation window. Review it before making structural edits.",
      tone: "warning"
    };
  }

  if (notice?.includes("only part of this conversation is visible")) {
    return {
      eyebrow: "Visible history only",
      message: notice,
      tone: "warning"
    };
  }

  if (isWorkspaceEmpty) {
    return {
      eyebrow: "Awaiting first draft",
      message: documentPresent
        ? "Thinking IDE is connected, but the currently visible chat has not yielded draftable concepts yet."
        : "Open a supported chat and wait for a completed assistant reply. Thinking IDE will draft the first concept map here.",
      tone: "info"
    };
  }

  return null;
}

export function ThinkingPanel({ onGenerate, onCollapse: onClosePanel }: ThinkingPanelProps) {
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
  const displayConversationTitle = isGenericConversationTitle ? "Active chat" : conversationTitle;
  const autoGenerate = document?.settings.autoGenerate ?? true;
  const nodeCount = document?.nodes.filter((node) => node.data.status !== "removed").length ?? 0;
  const edgeCount = document?.edges.filter((edge) => edge.data?.status !== "removed").length ?? 0;
  const sourceLostCount = document?.sources.filter((source) => source.status === "lost").length ?? 0;
  const isWorkspaceEmpty = !document || nodeCount === 0;
  const mapSummary = document
    ? `${nodeCount} concepts · ${edgeCount} relations${sourceLostCount ? ` · ${sourceLostCount} source issue${sourceLostCount > 1 ? "s" : ""}` : ""}`
    : "Concept map workspace";
  const shellNoticeTone = getShellNoticeTone({ status, error, notice });
  const shellCallout = getShellCallout({
    notice,
    isWorkspaceEmpty,
    documentPresent: Boolean(document)
  });

  const statusLabel =
    status === "synced"
      ? "Up to date"
      : status === "generating"
        ? "Refreshing"
        : status === "failed"
          ? "Needs attention"
          : status === "waiting"
            ? "Standing by"
            : "Connected";
  const statusMessage =
    status === "generating"
      ? "Scanning the active chat and refreshing this side panel without interrupting the current conversation."
      : status === "waiting"
        ? document
          ? "Waiting for the next completed assistant reply before refreshing the current draft."
          : "Waiting for a completed assistant reply before drafting the first map."
        : error ?? "Something blocked map generation. You can try the current scan again.";
  const showStatusBar = status === "generating" || status === "waiting" || status === "failed";
  const headerSummary =
    status === "failed"
      ? "This side panel could not refresh from the active chat. Review the message below, then try again."
      : status === "generating"
        ? "Refreshing the active conversation into a side-panel concept map."
        : shellCallout?.tone === "warning"
          ? "Review the currently visible history before making larger changes to the draft."
          : shellCallout?.tone === "info"
            ? "This side panel stays attached to the active conversation while history and source links settle."
            : document
              ? "Refine the current concept map without leaving the active chat."
              : "This panel stays ready for the active chat and drafts the first map once a completed reply is available.";
  const bottomLog = notice
    ? notice
    : !document
      ? "Waiting for the active chat to yield the first concept draft."
      : isWorkspaceEmpty
        ? "No concepts are available yet from the currently visible chat."
        : error
          ? error
          : `Map ready for direct editing. ${mapSummary}.`;

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
              <div className="ti-settings-card" ref={settingsCardRef} role="dialog" aria-label="Panel settings">
                <div className="ti-floating-card__eyebrow">Panel settings</div>
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
          <Button variant="ghost" onClick={onClosePanel}>
            Close
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
        {shellCallout ? (
          <div className={`ti-empty-workspace-callout ti-empty-workspace-callout--${shellCallout.tone}`} role="note">
            <div className="ti-empty-workspace-callout__eyebrow">{shellCallout.eyebrow}</div>
            <p>{shellCallout.message}</p>
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

      <div className={`ti-bottomlog ti-bottomlog--${shellNoticeTone}`}>
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
