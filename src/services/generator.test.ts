import assert from "node:assert/strict";
import test from "node:test";
import { generateDraftMap } from "./generator";
import type { MessageRef } from "../models/messageRef";
import type { SourceAnchor, SourceRef } from "../models/source";

function createMessage(id: string, role: MessageRef["role"], text: string): MessageRef {
  return {
    id,
    conversationKey: "conversation-1",
    role,
    orderIndex: Number(id.replace(/\D+/g, "")) || 0,
    text,
    textHash: `${id}-hash`,
    textPreview: text.slice(0, 40),
    domSelector: `[data-message-author-role="${role}"]`,
    domId: id,
    schemaVersion: 1,
    createdAt: "2026-05-11T00:00:00.000Z"
  };
}

function createSource(id: string, messageId: string, anchorOverrides: Partial<SourceAnchor> = {}): SourceRef {
  return {
    id,
    messageId,
    status: "active",
    anchor: {
      type: "message",
      selector: "[data-message]",
      role: messageId.startsWith("u") ? "user" : "assistant",
      occurrenceIndex: 0,
      previewStart: "preview start",
      previewEnd: "preview end",
      ...anchorOverrides
    }
  };
}

test("generateDraftMap returns an empty graph for an empty message list", () => {
  const draft = generateDraftMap([], []);

  assert.deepEqual(draft, {
    nodes: [],
    edges: []
  });
});

test("generateDraftMap builds multi-turn question, answer, and answer-outline nodes while keeping concept extraction on the latest exchange", () => {
  const messages = [
    createMessage("u1", "user", "Old question that should now be preserved"),
    createMessage(
      "a1",
      "assistant",
      "# Earlier answer heading\nOld answer that should now be preserved.\n\n1. First earlier outline item"
    ),
    createMessage("u2", "user", "How does the runtime spine work in practice?"),
    createMessage(
      "a2",
      "assistant",
      "# Runtime spine\nFirst concept explains the scan loop clearly.\n\n2. Second concept covers local persistence safely."
    )
  ];
  const sources = [
    createSource("source-question", "u2"),
    createSource("source-answer", "a2"),
    createSource("source-answer-heading", "a2", {
      type: "heading",
      headingText: "Runtime spine",
      headingLevel: 1
    })
  ];

  const draft = generateDraftMap(messages, sources);
  const questionNodes = draft.nodes.filter((node) => node.data.role === "question");
  const answerNodes = draft.nodes.filter((node) => node.data.role === "answer");
  const outlineNodes = draft.nodes.filter((node) => node.data.role === "answer_outline");
  const conceptNodes = draft.nodes.filter((node) => node.data.role === "concept");

  assert.equal(draft.nodes.length, 8);
  assert.equal(draft.edges.length, 7);
  assert.equal(questionNodes.length, 2);
  assert.equal(answerNodes.length, 2);
  assert.equal(outlineNodes.length, 2);
  assert.equal(conceptNodes.length, 2);
  assert.equal(questionNodes[0].data.title, "Old question that should now be preserved");
  assert.ok(questionNodes[1].data.title.startsWith("How does the runtime spine work in pract"));
  assert.equal(questionNodes[1].data.sourceId, "source-question");
  assert.equal(answerNodes[1].data.sourceId, "source-answer");
  assert.deepEqual(
    outlineNodes.map((node) => ({
      title: node.data.title,
      sourceId: node.data.sourceId,
      status: node.data.status
    })),
    [
      {
        title: "Earlier answer heading",
        sourceId: undefined,
        status: "draft"
      },
      {
        title: "Runtime spine",
        sourceId: "source-answer-heading",
        status: "draft"
      }
    ]
  );
  assert.deepEqual(
    conceptNodes.map((node) => ({
      title: node.data.title,
      sourceId: node.data.sourceId,
      status: node.data.status
    })),
    [
      {
        title: "the scan loop",
        sourceId: "source-answer",
        status: "draft"
      },
      {
        title: "local persistence",
        sourceId: "source-answer",
        status: "draft"
      }
    ]
  );
  assert.equal(
    draft.edges.filter((edge) => edge.data?.relation === "answers").length,
    2
  );
  assert.equal(
    draft.edges.filter((edge) => edge.data?.relation === "contains").length,
    2
  );
  assert.equal(
    draft.edges.filter((edge) => edge.data?.relation === "expands").length,
    2
  );
  assert.equal(
    draft.edges.filter((edge) => edge.data?.relation === "relates" && edge.label === "next").length,
    1
  );
});
