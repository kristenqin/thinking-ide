import type { SourceRef } from "../models/source";

export function revealSource(source: SourceRef | undefined): boolean {
  if (!source) {
    return false;
  }

  const elements = Array.from(document.querySelectorAll(source.anchor.selector));
  const match =
    elements.find((element) => (element.textContent ?? "").includes(source.anchor.previewText.slice(0, 20))) ??
    elements[0];

  if (!match) {
    return false;
  }

  match.scrollIntoView({ behavior: "smooth", block: "center" });
  match.setAttribute("data-thinking-ide-highlight", "true");
  window.setTimeout(() => {
    match.removeAttribute("data-thinking-ide-highlight");
  }, 2200);

  return true;
}
