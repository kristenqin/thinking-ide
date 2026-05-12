import { normalizeText } from "../utils/text";
import type { SourceRef } from "../models/source";

export type RevealSourceResult = "revealed" | "lost" | "missing";
export type RevealTargetHint = {
  kind: "heading";
  text: string;
};

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

function findHeadingElement(sourceElement: Element, hint: RevealTargetHint): Element | undefined {
  const normalizedHint = normalizeText(hint.text);
  if (!normalizedHint) {
    return undefined;
  }

  const headingCandidates = Array.from(
    sourceElement.querySelectorAll('h1, [role="heading"][aria-level="1"]')
  );

  const exact = headingCandidates.find(
    (element) => normalizeText(element.textContent ?? "") === normalizedHint
  );
  if (exact) {
    return exact;
  }

  return headingCandidates.find((element) =>
    normalizeText(element.textContent ?? "").includes(normalizedHint)
  );
}

function findHeadingElementFromSource(sourceElement: Element, source: SourceRef): Element | undefined {
  if (source.anchor.type !== "heading" || !source.anchor.headingText) {
    return undefined;
  }

  const normalizedHeadingText = normalizeText(source.anchor.headingText);
  if (!normalizedHeadingText) {
    return undefined;
  }

  const levelSelector =
    source.anchor.headingLevel === 1
      ? 'h1, [role="heading"][aria-level="1"]'
      : '[role="heading"]';
  const headingCandidates = Array.from(sourceElement.querySelectorAll(levelSelector));
  const exact = headingCandidates.find(
    (element) => normalizeText(element.textContent ?? "") === normalizedHeadingText
  );
  if (exact) {
    return exact;
  }

  return headingCandidates.find((element) =>
    normalizeText(element.textContent ?? "").includes(normalizedHeadingText)
  );
}

function revealElement(target: Element) {
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.setAttribute("data-thinking-ide-highlight", "true");
  window.setTimeout(() => {
    target.removeAttribute("data-thinking-ide-highlight");
  }, 2200);
}

export function revealSource(
  source: SourceRef | undefined,
  targetHint?: RevealTargetHint
): RevealSourceResult {
  if (!source) {
    return "missing";
  }

  const sourceElement = findSourceElement(source);

  if (!sourceElement) {
    return "lost";
  }

  const target =
    findHeadingElementFromSource(sourceElement, source) ??
    (targetHint?.kind === "heading" ? findHeadingElement(sourceElement, targetHint) : undefined) ??
    sourceElement;

  revealElement(target);

  return "revealed";
}
