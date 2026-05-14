import { fromMarkdown as parseMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import { visit } from "unist-util-visit";
import type { Heading, Root, Text } from "mdast";

import { normalizeText } from "./text";

export type OutlineHeading = {
  title: string;
  level: number;
};

export function parseMarkdownAst(content: string): Root {
  return parseMarkdown(content, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()]
  });
}

export function extractOutlineHeadings(content: string): OutlineHeading[] {
  const ast = parseMarkdownAst(content);
  const headings: OutlineHeading[] = [];
  const seen = new Set<string>();

  visit(ast, "heading", (node) => {
    const heading = node as Heading;
    const title = normalizeText(
      heading.children
        .map((child) => ("value" in child ? (child as Text).value : ""))
        .join("")
    );

    if (!title) {
      return;
    }

    const dedupeKey = `${heading.depth}:${title.toLowerCase()}`;
    if (seen.has(dedupeKey)) {
      return;
    }

    seen.add(dedupeKey);
    headings.push({
      title,
      level: heading.depth
    });
  });

  return headings;
}
