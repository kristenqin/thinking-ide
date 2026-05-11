export type MessageObserverHandle = {
  disconnect: () => void;
};

type ObserverOptions = {
  debounceMs?: number;
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
  onMeaningfulChange: () => void,
  options: ObserverOptions = {}
): MessageObserverHandle {
  const debounceMs = options.debounceMs ?? 700;
  let timeoutId: number | undefined;

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
