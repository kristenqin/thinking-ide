import type { ConceptMapEdgeRecord } from "../models/edge";
import type { MessageRef } from "../models/messageRef";
import type { ConceptMapNodeRecord } from "../models/node";
import type { SourceRef } from "../models/source";
import { createId } from "../utils/id";
import { clampText, splitIntoConcepts } from "../utils/text";

function resolveSourceId(messageId: string, sources: SourceRef[]): string | undefined {
  return sources.find((source) => source.messageId === messageId)?.id;
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

  const userMessages = messages.filter((message) => message.role === "user");
  const assistantMessages = messages.filter((message) => message.role === "assistant");
  const seedQuestion = userMessages.at(-1) ?? messages[0];
  const seedAnswer = assistantMessages.at(-1) ?? messages.at(-1) ?? messages[0];

  const questionNodeId = createId("node");
  nodes.push({
    id: questionNodeId,
    type: "concept",
    position: { x: 48, y: 80 },
    data: {
      title: clampText(seedQuestion.text, 42),
      summary: clampText(seedQuestion.text, 120),
      role: "question",
      status: "confirmed",
      sourceId: resolveSourceId(seedQuestion.id, sources)
    }
  });

  const answerNodeId = createId("node");
  nodes.push({
    id: answerNodeId,
    type: "concept",
    position: { x: 340, y: 80 },
    data: {
      title: clampText(seedAnswer.text, 42),
      summary: clampText(seedAnswer.text, 120),
      role: "answer",
      status: "confirmed",
      sourceId: resolveSourceId(seedAnswer.id, sources)
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

  splitIntoConcepts(seedAnswer.text).forEach((concept, index) => {
    const conceptNodeId = createId("node");
    nodes.push({
      id: conceptNodeId,
      type: "concept",
      position: { x: 680, y: 48 + index * 120 },
      data: {
        title: clampText(concept, 32),
        summary: clampText(concept, 100),
        role: "concept",
        status: "draft",
        sourceId: resolveSourceId(seedAnswer.id, sources)
      }
    });

    edges.push({
      id: createId("edge"),
      source: answerNodeId,
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
