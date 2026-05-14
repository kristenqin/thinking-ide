import type { ConceptMapEdgeRecord } from "../models/edge";
import type { MessageRef } from "../models/messageRef";
import type { ConceptMapNodeRecord } from "../models/node";
import type { SourceRef } from "../models/source";
import { createId } from "../utils/id";
import { extractOutlineSections } from "../utils/markdown";
import { clampText, normalizeText, splitIntoConcepts } from "../utils/text";

function resolveSourceId(messageId: string, sources: SourceRef[]): string | undefined {
  return sources.find((source) => source.messageId === messageId && source.anchor.type === "message")?.id;
}

function resolveOutlineSourceId(
  messageId: string,
  outline: string,
  headingLevel: number,
  sources: SourceRef[]
): string | undefined {
  const normalizedOutline = normalizeText(outline).toLowerCase();
  const headingSource = sources.find(
    (source) =>
      source.messageId === messageId &&
      source.anchor.type === "heading" &&
      source.anchor.headingText?.toLowerCase() === normalizedOutline &&
      source.anchor.headingLevel === headingLevel
  );
  if (headingSource) {
    return headingSource.id;
  }

  return resolveSourceId(messageId, sources);
}

type Exchange = {
  question: MessageRef;
  answer?: MessageRef;
};

function buildExchanges(messages: MessageRef[]): Exchange[] {
  const exchanges: Exchange[] = [];
  let pendingQuestion: MessageRef | undefined;

  messages.forEach((message) => {
    if (message.role === "user") {
      pendingQuestion = message;
      exchanges.push({ question: message });
      return;
    }

    if (!pendingQuestion) {
      return;
    }

    const exchange = exchanges.at(-1);
    if (exchange && exchange.question.id === pendingQuestion.id && !exchange.answer) {
      exchange.answer = message;
      pendingQuestion = undefined;
    }
  });

  return exchanges;
}

export function generateDraftMap(
  messages: MessageRef[],
  sources: SourceRef[]
): { nodes: ConceptMapNodeRecord[]; edges: ConceptMapEdgeRecord[] } {
  if (messages.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes: ConceptMapNodeRecord[] = [];
  const edges: ConceptMapEdgeRecord[] = [];

  const exchanges = buildExchanges(messages);
  if (exchanges.length === 0) {
    return { nodes: [], edges: [] };
  }

  let previousQuestionNodeId: string | undefined;

  exchanges.forEach((exchange, exchangeIndex) => {
    const baseY = 80 + exchangeIndex * 220;
    const questionNodeId = createId("node");
    nodes.push({
      id: questionNodeId,
      type: "concept",
      position: { x: 48, y: baseY },
      data: {
        title: clampText(exchange.question.text, 42),
        summary: clampText(exchange.question.text, 120),
        role: "question",
        status: "confirmed",
        sourceId: resolveSourceId(exchange.question.id, sources)
      }
    });

    if (previousQuestionNodeId) {
      edges.push({
        id: createId("edge"),
        source: previousQuestionNodeId,
        target: questionNodeId,
        data: {
          relation: "relates",
          status: "draft"
        },
        label: "next"
      });
    }

    previousQuestionNodeId = questionNodeId;

    if (!exchange.answer) {
      return;
    }

    const answer = exchange.answer;
    const answerNodeId = createId("node");
    nodes.push({
      id: answerNodeId,
      type: "concept",
      position: { x: 340, y: baseY },
      data: {
        title: clampText(answer.text, 42),
        summary: clampText(answer.text, 120),
        role: "answer",
        status: "confirmed",
        sourceId: resolveSourceId(answer.id, sources)
      }
    });

    edges.push({
      id: createId("edge"),
      source: questionNodeId,
      target: answerNodeId,
      data: {
        relation: "answers",
        status: "confirmed"
      },
      label: "answers"
    });

    const outlineSections = extractOutlineSections(answer.markdownText ?? answer.text);
    const outlineNodeIds: string[] = [];

    outlineSections.forEach((outline, index) => {
      const outlineNodeId = createId("node");
      outlineNodeIds.push(outlineNodeId);
      nodes.push({
        id: outlineNodeId,
        type: "concept",
        position: {
          x: 340 + Math.max(0, outline.level - 1) * 36,
          y: baseY + 96 + index * 96
        },
        data: {
          title: clampText(outline.title, 34),
          summary: clampText(outline.sectionText, 100),
          role: "answer_outline",
          status: "draft",
          sourceId: resolveOutlineSourceId(answer.id, outline.title, outline.level, sources)
        }
      });

      edges.push({
        id: createId("edge"),
        source:
          outline.parentIndex !== undefined
            ? (outlineNodeIds[outline.parentIndex] ?? answerNodeId)
            : answerNodeId,
        target: outlineNodeId,
        data: {
          relation: "contains",
          status: "draft"
        },
        label: "contains"
      });
    });
  });

  const latestAnswer = [...exchanges].reverse().find((exchange) => exchange.answer)?.answer;
  if (!latestAnswer) {
    return { nodes, edges };
  }

  const latestAnswerNode = [...nodes]
    .reverse()
    .find((node) => node.data.role === "answer" && node.data.sourceId === resolveSourceId(latestAnswer.id, sources));
  if (!latestAnswerNode) {
    return { nodes, edges };
  }

  splitIntoConcepts(latestAnswer.text).forEach((concept, index) => {
    const conceptNodeId = createId("node");
    nodes.push({
      id: conceptNodeId,
      type: "concept",
      position: {
        x: 680,
        y: (latestAnswerNode.position.y ?? 80) + index * 120
      },
      data: {
        title: clampText(concept.title, 32),
        summary: clampText(concept.summary, 100),
        role: "concept",
        status: "draft",
        sourceId: resolveSourceId(latestAnswer.id, sources)
      }
    });

    edges.push({
      id: createId("edge"),
      source: latestAnswerNode.id,
      target: conceptNodeId,
      data: {
        relation: "expands",
        status: "draft"
      },
      label: "expands"
    });
  });

  return { nodes, edges };
}
