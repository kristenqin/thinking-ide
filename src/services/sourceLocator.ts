import { normalizeText } from "../utils/text";
import type { SourceRef } from "../models/source";

export type RevealSourceResult = "revealed" | "lost" | "missing";

type AnchorMatch = {
  start: boolean;
  end: boolean;
};

function getAnchorMatch(text: string, source: SourceRef): AnchorMatch {
  const normalizedText = normalizeText(text);
  const normalizedStart = normalizeText(source.anchor.previewStart);
  const normalizedEnd = normalizeText(source.anchor.previewEnd);

  return {
    start: Boolean(normalizedStart) && normalizedText.includes(normalizedStart),
    end: Boolean(normalizedEnd) && normalizedText.includes(normalizedEnd)
  };
}

function matchesAnyAnchorText(text: string, source: SourceRef): boolean {
  const match = getAnchorMatch(text, source);
  return match.start || match.end;
}

function findSourceElement(source: SourceRef): Element | undefined {
  const { anchor } = source;
  const elements = Array.from(document.querySelectorAll(anchor.selector));

  if (anchor.domId) {
    const byId = document.getElementById(anchor.domId);
    if (
      byId &&
      byId.getAttribute("data-message-author-role") === anchor.role &&
      matchesAnyAnchorText(byId.textContent ?? "", source)
    ) {
      return byId;
    }
  }

  const roleMatches = elements.filter(
    (element) => element.getAttribute("data-message-author-role") === anchor.role
  );

  const exact = roleMatches.find((element) => {
    const match = getAnchorMatch(element.textContent ?? "", source);
    return match.start && match.end;
  });
  if (exact) {
    return exact;
  }

  const byOccurrence = roleMatches[anchor.occurrenceIndex];
  if (byOccurrence && matchesAnyAnchorText(byOccurrence.textContent ?? "", source)) {
    return byOccurrence;
  }

  const partialMatches = roleMatches.filter((element) => matchesAnyAnchorText(element.textContent ?? "", source));
  if (partialMatches.length === 1) {
    return partialMatches[0];
  }

  return undefined;
}

export function revealSource(source: SourceRef | undefined): RevealSourceResult {
  if (!source) {
    return "missing";
  }

  const match = findSourceElement(source);

  if (!match) {
    return "lost";
  }

  match.scrollIntoView({ behavior: "smooth", block: "center" });
  match.setAttribute("data-thinking-ide-highlight", "true");
  window.setTimeout(() => {
    match.removeAttribute("data-thinking-ide-highlight");
  }, 2200);

  return "revealed";
}
