export function clampText(text: string, maxLength = 140): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

export function normalizeText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function normalizeSourceComparableText(input: string): string {
  return normalizeText(input)
    .replace(/[…]+$/u, "")
    .replace(/\.{3,}$/u, "")
    .replace(/^#{1,6}\s+/u, "")
    .replace(/\s#{1,6}\s+/gu, " ")
    .replace(/^>\s+/u, "")
    .replace(/\s>\s+/gu, " ")
    .replace(/\s[-*+]\s+/gu, " ")
    .replace(/\s\d+[\.\)]\s+/gu, " ")
    .replace(/\*{1,3}([^*]+)\*{1,3}/gu, "$1")
    .replace(/_{1,3}([^_]+)_{1,3}/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1")
    .trim();
}

export type ConceptCandidate = {
  title: string;
  summary: string;
};

export function splitIntoConcepts(text: string): ConceptCandidate[] {
  const segments = text
    .split(/\n+|(?<=。)|(?<=\.)|(?<=:)|(?<=：)|(?<=;)|(?<=；)/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .filter((segment) => !segment.startsWith("# "));

  const candidates: ConceptCandidate[] = [];
  const seenTitles = new Set<string>();

  segments.forEach((segment) => {
    const summary = normalizeText(stripOutlineMarker(segment));
    if (summary.length < 8) {
      return;
    }

    const title = deriveConceptTitle(summary);
    if (title.length < 2 || seenTitles.has(title)) {
      return;
    }

    seenTitles.add(title);
    candidates.push({ title, summary });
  });

  return candidates.slice(0, 5);
}

function stripOutlineMarker(text: string): string {
  return text
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s+/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[\.\)]\s+/, "")
    .replace(/^[一二三四五六七八九十]+[、.．]\s*/, "");
}

function deriveConceptTitle(summary: string): string {
  const withoutLead = summary
    .replace(
      /^(?:first|second|third|fourth|fifth|another|next|final)\s+(?:concept|point|idea|step|theme|pillar|principle|reason|part)\s+(?:explains|covers|shows|describes|introduces|highlights|discusses|outlines)\s+/i,
      ""
    )
    .replace(/^(?:首先|其次|再次|最后|另外|同时|然后|此外|并且|而且|所以|因此)[，,\s]*/u, "")
    .trim();

  const colonCandidate = withoutLead.split(/[:：]/).at(-1)?.trim();
  const strippedColonCandidate = colonCandidate ? stripTrailingQualifier(colonCandidate) : "";
  if (isCompactConcept(strippedColonCandidate, withoutLead)) {
    return strippedColonCandidate;
  }

  const trailingNounLike = withoutLead.match(/([\p{Script=Han}A-Za-z0-9_.-]{2,20})[。.!?？；;]*$/u)?.[1];
  const strippedTrailingNounLike = trailingNounLike ? stripTrailingQualifier(trailingNounLike) : "";
  if (isCompactConcept(strippedTrailingNounLike, withoutLead)) {
    return strippedTrailingNounLike;
  }

  const clauseCandidate = withoutLead
    .split(/[，,、]/)
    .map((part) => stripTrailingQualifier(part.trim()))
    .find((part) => isCompactConcept(part, withoutLead));
  if (clauseCandidate) {
    return clauseCandidate;
  }

  return clampText(withoutLead, 24);
}

function stripTrailingQualifier(text: string): string {
  return text
    .replace(/\b(?:clearly|safely|directly|carefully|properly|effectively|better)\b[。.!?]?$/i, "")
    .replace(/[。.!?？；;]+$/u, "")
    .trim();
}

function isCompactConcept(candidate: string, summary: string): boolean {
  if (!candidate) {
    return false;
  }

  if (candidate.length < 2 || candidate.length > 20) {
    return false;
  }

  if (candidate === summary) {
    return false;
  }

  return true;
}

export function splitIntoOutlineItems(text: string): string[] {
  const markdownH1 = Array.from(text.matchAll(/^# (.+)$/gm))
    .map((match) => normalizeText(stripOutlineMarker(match[1] ?? "")))
    .filter((segment) => segment.length >= 3);
  const uniqueMarkdownH1 = Array.from(new Set(markdownH1));
  if (uniqueMarkdownH1.length > 0) {
    return uniqueMarkdownH1.slice(0, 4);
  }

  const outlineMarkerPattern = /^(?:#{1,6}\s+|[-*+]\s+|\d+[\.\)]\s+|[一二三四五六七八九十]+[、.．]\s*)/;
  const items: string[] = [];
  let paragraphBuffer = "";

  const flushParagraph = () => {
    const normalized = normalizeText(paragraphBuffer);
    if (normalized.length >= 10) {
      items.push(normalized);
    }
    paragraphBuffer = "";
  };

  text.split(/\n/).forEach((line) => {
    const raw = line.trim();
    if (!raw) {
      flushParagraph();
      return;
    }

    const cleaned = normalizeText(stripOutlineMarker(raw));
    if (!cleaned) {
      return;
    }

    if (outlineMarkerPattern.test(raw)) {
      flushParagraph();
      items.push(cleaned);
      return;
    }

    paragraphBuffer = paragraphBuffer ? `${paragraphBuffer} ${cleaned}` : cleaned;
    if (/[。.!?；;:]$/.test(cleaned)) {
      flushParagraph();
    }
  });

  flushParagraph();

  const uniqueItems = Array.from(new Set(items));
  if (uniqueItems.length > 0) {
    return uniqueItems.slice(0, 4);
  }

  return text
    .split(/(?<=。)|(?<=\.)|(?<=:)|(?<=：)|(?<=;)|(?<=；)/)
    .map((segment) => normalizeText(stripOutlineMarker(segment)))
    .filter((segment) => segment.length >= 14)
    .slice(0, 3);
}
