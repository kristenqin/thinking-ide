export type MessageObserverHandle = {
  disconnect: () => void;
};

type ObserverOptions = {
  debounceMs?: number;
};

export function observeChatMutations(
  onMeaningfulChange: () => void,
  options: ObserverOptions = {}
): MessageObserverHandle {
  const debounceMs = options.debounceMs ?? 700;
  let timeoutId: number | undefined;

  const observer = new MutationObserver((mutations) => {
    const shouldRefresh = mutations.some((mutation) => {
      if (mutation.type === "characterData") {
        return true;
      }

      return Array.from(mutation.addedNodes).some((node) => {
        if (!(node instanceof HTMLElement)) {
          return false;
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
      onMeaningfulChange();
    }, debounceMs);
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true
  });

  return {
    disconnect() {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      observer.disconnect();
    }
  };
}
