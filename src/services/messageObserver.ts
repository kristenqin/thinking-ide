import { getAssistantCompletionState, type AssistantCompletionState } from "./chatAdapter";

export type MessageObserverHandle = {
  disconnect: () => void;
  resetCompletionDedup: (completionKey?: string | null) => void;
};

export type ChatMutationPhase = "waiting" | "streaming" | "settled";

export type ChatMutationEvent = {
  phase: ChatMutationPhase;
  completionKey: string | null;
};

type ObserverOptions = {
  debounceMs?: number;
  settleMs?: number;
  getCompletionState?: () => AssistantCompletionState;
};

function isMessageMutationTarget(node: Node | null): boolean {
  if (!node) {
    return false;
  }

  const element =
    node instanceof HTMLElement
      ? node
      : node instanceof Text
        ? node.parentElement
        : null;

  return Boolean(element?.closest('[data-message-author-role]'));
}

export function observeChatMutations(
  onMeaningfulChange: (event: ChatMutationEvent) => void,
  options: ObserverOptions = {}
): MessageObserverHandle {
  const debounceMs = options.debounceMs ?? 700;
  const settleMs = options.settleMs ?? 1700;
  const getCompletionState = options.getCompletionState ?? getAssistantCompletionState;
  let timeoutId: number | undefined;
  let settleTimeoutId: number | undefined;
  let scheduledCompletionKey: string | null = null;
  let dispatchedCompletionKey: string | null = null;

  function emitWaitingLikeState(state: AssistantCompletionState) {
    onMeaningfulChange({
      phase: state.isStreaming ? "streaming" : "waiting",
      completionKey: state.completionKey
    });
  }

  function clearSettleTimeout() {
    if (settleTimeoutId) {
      window.clearTimeout(settleTimeoutId);
      settleTimeoutId = undefined;
    }
    scheduledCompletionKey = null;
  }

  function scheduleCompletionCheck(state: AssistantCompletionState) {
    if (!state.completionKey || dispatchedCompletionKey === state.completionKey) {
      return;
    }

    if (scheduledCompletionKey === state.completionKey) {
      return;
    }

    clearSettleTimeout();
    scheduledCompletionKey = state.completionKey;
    settleTimeoutId = window.setTimeout(() => {
      const latestState = getCompletionState();
      const stableCompletionKey =
        latestState.latestMessageRole === "assistant" && !latestState.isStreaming
          ? latestState.completionKey
          : null;

      settleTimeoutId = undefined;
      scheduledCompletionKey = null;

      if (!stableCompletionKey || stableCompletionKey !== state.completionKey) {
        emitWaitingLikeState(latestState);
        return;
      }

      if (dispatchedCompletionKey === stableCompletionKey) {
        return;
      }

      dispatchedCompletionKey = stableCompletionKey;
      onMeaningfulChange({
        phase: "settled",
        completionKey: stableCompletionKey
      });
    }, settleMs);
  }

  function evaluateConversationProgress() {
    const state = getCompletionState();

    if (state.latestMessageRole !== "assistant" || !state.completionKey) {
      clearSettleTimeout();
      emitWaitingLikeState(state);
      return;
    }

    if (state.isStreaming) {
      clearSettleTimeout();
      emitWaitingLikeState(state);
      return;
    }

    scheduleCompletionCheck(state);
  }

  const observer = new MutationObserver((mutations) => {
    const shouldRefresh = mutations.some((mutation) => {
      if (mutation.type === "characterData") {
        return isMessageMutationTarget(mutation.target);
      }

      return Array.from(mutation.addedNodes).some((node) => {
        if (!(node instanceof HTMLElement)) {
          return isMessageMutationTarget(node);
        }

        return Boolean(
          node.matches?.('[data-message-author-role]') ||
            node.querySelector?.('[data-message-author-role]')
        );
      });
    });

    if (!shouldRefresh) {
      return;
    }

    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      evaluateConversationProgress();
    }, debounceMs);
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true
  });

  return {
    resetCompletionDedup(completionKey) {
      if (!completionKey || dispatchedCompletionKey === completionKey) {
        dispatchedCompletionKey = null;
      }
    },
    disconnect() {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      clearSettleTimeout();
      observer.disconnect();
    }
  };
}
