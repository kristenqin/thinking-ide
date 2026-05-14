import { fromMarkdown as parseMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import { visit } from "unist-util-visit";
import type { Content, Heading, Root, Text } from "mdast";

import { normalizeText } from "./text";

export type OutlineHeading = {
  title: string;
  level: number;
};

export type OutlineSection = {
  title: string;
  level: number;
  parentIndex?: number;
  sectionText: string;
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

export function extractOutlineSections(content: string): OutlineSection[] {
  const ast = parseMarkdownAst(content);
  const rootChildren = ast.children ?? [];
  const sections: OutlineSection[] = [];
  const stack: Array<{ index: number; level: number }> = [];
  const seen = new Set<string>();

  rootChildren.forEach((node, index) => {
    if (node.type !== "heading") {
      return;
    }

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

    while (stack.length > 0 && stack.at(-1)!.level >= heading.depth) {
      stack.pop();
    }

    const parentIndex = stack.at(-1)?.index;
    const sectionText = collectSectionText(rootChildren, index, heading.depth, title);
    const sectionIndex = sections.length;

    sections.push({
      title,
      level: heading.depth,
      parentIndex,
      sectionText
    });

    stack.push({ index: sectionIndex, level: heading.depth });
  });

  return sections;
}

function collectSectionText(
  nodes: Content[],
  headingNodeIndex: number,
  headingDepth: number,
  fallbackTitle: string
): string {
  const parts: string[] = [];

  for (let cursor = headingNodeIndex + 1; cursor < nodes.length; cursor += 1) {
    const node = nodes[cursor];
    if (!node) {
      continue;
    }

    if (node.type === "heading" && (node as Heading).depth <= headingDepth) {
      break;
    }

    const text = normalizeText(extractNodeText(node));
    if (text) {
      parts.push(text);
    }
  }

  return parts.join(" ").trim() || fallbackTitle;
}

function extractNodeText(node: Content): string {
  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }

  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map((child) => extractNodeText(child as Content)).join(" ");
  }

  return "";
}
