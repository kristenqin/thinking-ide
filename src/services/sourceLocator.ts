import { normalizeText } from "../utils/text";
import type { SourceRef } from "../models/source";

export type RevealSourceResult = "revealed" | "lost" | "missing";

function findSourceElement(source: SourceRef): Element | undefined {
  const { anchor } = source;
  const elements = Array.from(document.querySelectorAll(anchor.selector));

  if (anchor.domId) {
    const byId = document.getElementById(anchor.domId);
    if (byId) {
      return byId;
    }
  }

  const roleMatches = elements.filter(
    (element) => element.getAttribute("data-message-author-role") === anchor.role
  );
  const normalizedStart = normalizeText(anchor.previewStart);
  const normalizedEnd = normalizeText(anchor.previewEnd);

  const exact = roleMatches.find((element) => {
    const text = normalizeText(element.textContent ?? "");
    return text.includes(normalizedStart) && text.includes(normalizedEnd);
  });
  if (exact) {
    return exact;
  }

  const byOccurrence = roleMatches[anchor.occurrenceIndex];
  if (byOccurrence) {
    return byOccurrence;
  }

  return roleMatches[0];
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
