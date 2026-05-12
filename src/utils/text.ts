export function clampText(text: string, maxLength = 140): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

export function normalizeText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function splitIntoConcepts(text: string): string[] {
  return text
    .split(/\n+|(?<=。)|(?<=\.)|(?<=:)|(?<=：)|(?<=;)|(?<=；)/)
    .map((segment) => normalizeText(stripOutlineMarker(segment)))
    .filter((segment) => segment.length >= 8)
    .slice(0, 5);
}

function stripOutlineMarker(text: string): string {
  return text
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s+/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[\.\)]\s+/, "")
    .replace(/^[一二三四五六七八九十]+[、.．]\s*/, "");
}

export function splitIntoOutlineItems(text: string): string[] {
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
