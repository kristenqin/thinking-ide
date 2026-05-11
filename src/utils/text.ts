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
    .map((segment) => normalizeText(segment))
    .filter((segment) => segment.length >= 8)
    .slice(0, 5);
}
