import type { ThinkingDocument } from "../models/document";
import type { ConversationRef } from "../models/conversation";
import type { ConceptMapEdgeRecord } from "../models/edge";
import type { MessageRef } from "../models/messageRef";
import type { ConceptMapNodeRecord } from "../models/node";
import type { SourceRef } from "../models/source";
import type { UserSettings } from "../models/settings";
type BuildDocumentParams = {
  conversation: ConversationRef;
  messages: MessageRef[];
  sources: SourceRef[];
  generatedNodes: ConceptMapNodeRecord[];
  generatedEdges: ConceptMapEdgeRecord[];
  settings: UserSettings;
  previous?: ThinkingDocument;
};

function buildNodeGroupKey(node: ConceptMapNodeRecord): string {
  return [node.data.role, node.data.sourceId ?? "none"].join("::");
}

function buildEdgeKey(edge: ConceptMapEdgeRecord): string {
  return [edge.source, edge.target, edge.label ?? "", edge.data?.relation ?? "unknown"].join("::");
}

function mergeNodes(
  previousNodes: ConceptMapNodeRecord[],
  generatedNodes: ConceptMapNodeRecord[]
): ConceptMapNodeRecord[] {
  const previousGroups = new Map<string, ConceptMapNodeRecord[]>();
  const removedKeys = new Set<string>();

  previousNodes.forEach((node) => {
    const key = buildNodeGroupKey(node);
    if (node.data.status === "removed") {
      removedKeys.add(key);
      return;
    }
    const group = previousGroups.get(key) ?? [];
    group.push(node);
    previousGroups.set(key, group);
  });

  const groupIndexes = new Map<string, number>();

  return generatedNodes.flatMap((node) => {
    const key = buildNodeGroupKey(node);
    if (removedKeys.has(key)) {
      return [];
    }

    const group = previousGroups.get(key) ?? [];
    const index = groupIndexes.get(key) ?? 0;
    const previous = group[index];
    groupIndexes.set(key, index + 1);

    if (!previous) {
      return [node];
    }

    return [
      {
        ...node,
        id: previous.id,
        position: previous.position,
        data: {
          ...node.data,
          title: previous.data.title,
          status: previous.data.status
        }
      }
    ];
  });
}

function mergeEdges(
  previousEdges: ConceptMapEdgeRecord[],
  generatedEdges: ConceptMapEdgeRecord[],
  generatedNodes: ConceptMapNodeRecord[],
  mergedNodes: ConceptMapNodeRecord[]
): ConceptMapEdgeRecord[] {
  const previousNodeIdToMergedId = new Map<string, string>();

  generatedNodes.forEach((node, index) => {
    previousNodeIdToMergedId.set(node.id, mergedNodes[index]?.id ?? node.id);
  });

  const rewrittenGeneratedEdges = generatedEdges.map((edge) => ({
    ...edge,
    source: previousNodeIdToMergedId.get(edge.source) ?? edge.source,
    target: previousNodeIdToMergedId.get(edge.target) ?? edge.target
  }));

  const preservedManualEdges = previousEdges
    .filter((edge) => edge.data?.status !== "removed")
    .filter((edge) => edge.data?.relation === "relates")
    .filter((edge) =>
      mergedNodes.some((node) => node.id === edge.source) && mergedNodes.some((node) => node.id === edge.target)
    );

  const deduped = new Map<string, ConceptMapEdgeRecord>();
  rewrittenGeneratedEdges.concat(preservedManualEdges).forEach((edge) => {
    deduped.set(buildEdgeKey(edge), edge);
  });

  return Array.from(deduped.values());
}

export function buildThinkingDocument({
  conversation,
  messages,
  sources,
  generatedNodes,
  generatedEdges,
  settings,
  previous
}: BuildDocumentParams): ThinkingDocument {
  const mergedNodes = previous ? mergeNodes(previous.nodes, generatedNodes) : generatedNodes;
  const mergedEdges = previous
    ? mergeEdges(previous.edges, generatedEdges, generatedNodes, mergedNodes)
    : generatedEdges;

  return {
    conversation: {
      ...conversation,
      updatedAt: new Date().toISOString()
    },
    messages,
    sources,
    nodes: mergedNodes,
    edges: mergedEdges,
    settings: previous?.settings ?? settings,
    updatedAt: new Date().toISOString()
  };
}
