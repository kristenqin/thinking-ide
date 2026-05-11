import type { ThinkingDocument } from "../models/document";
import type { ConversationRef } from "../models/conversation";
import type { ConceptMapEdgeRecord } from "../models/edge";
import type { MessageRef } from "../models/messageRef";
import type { ConceptMapNodeRecord } from "../models/node";
import type { SourceRef } from "../models/source";
import type { UserSettings } from "../models/settings";
import { normalizeText } from "../utils/text";
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

function buildNodeIdentityKey(node: ConceptMapNodeRecord): string {
  return [buildNodeGroupKey(node), normalizeText(node.data.summary ?? node.data.title)].join("::");
}

function buildEdgeKey(edge: ConceptMapEdgeRecord): string {
  return [edge.source, edge.target, edge.label ?? "", edge.data?.relation ?? "unknown"].join("::");
}

function buildEdgePairKey(edge: ConceptMapEdgeRecord): string {
  return [edge.source, edge.target].join("::");
}

function mergeNodes(
  previousNodes: ConceptMapNodeRecord[],
  generatedNodes: ConceptMapNodeRecord[]
): ConceptMapNodeRecord[] {
  const previousGroups = new Map<string, ConceptMapNodeRecord[]>();
  const previousByIdentity = new Map<string, ConceptMapNodeRecord[]>();
  const removedIdentityKeys = new Set<string>();

  previousNodes.forEach((node) => {
    const key = buildNodeGroupKey(node);
    if (node.data.status === "removed") {
      removedIdentityKeys.add(buildNodeIdentityKey(node));
      return;
    }
    const group = previousGroups.get(key) ?? [];
    group.push(node);
    previousGroups.set(key, group);
    const identity = buildNodeIdentityKey(node);
    const matches = previousByIdentity.get(identity) ?? [];
    matches.push(node);
    previousByIdentity.set(identity, matches);
  });

  return generatedNodes.flatMap((node) => {
    const groupKey = buildNodeGroupKey(node);
    const identityKey = buildNodeIdentityKey(node);
    if (removedIdentityKeys.has(identityKey)) {
      return [];
    }

    const exactMatches = previousByIdentity.get(identityKey) ?? [];
    const matchedPrevious = exactMatches.shift();
    if (exactMatches.length === 0) {
      previousByIdentity.delete(identityKey);
    } else {
      previousByIdentity.set(identityKey, exactMatches);
    }
    const group = previousGroups.get(groupKey) ?? [];
    const previous =
      matchedPrevious ??
      group.shift();

    if (matchedPrevious) {
      const groupIndex = group.findIndex((entry) => entry.id === matchedPrevious.id);
      if (groupIndex >= 0) {
        group.splice(groupIndex, 1);
      }
    }

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
    .filter((edge) => edge.data?.status === "draft")
    .filter((edge) =>
      mergedNodes.some((node) => node.id === edge.source) && mergedNodes.some((node) => node.id === edge.target)
    );
  const preservedManualEdgePairs = new Set(
    preservedManualEdges.map((edge) => buildEdgePairKey(edge))
  );
  const filteredGeneratedEdges = rewrittenGeneratedEdges.filter(
    (edge) => !preservedManualEdgePairs.has(buildEdgePairKey(edge))
  );

  const deduped = new Map<string, ConceptMapEdgeRecord>();
  filteredGeneratedEdges.concat(preservedManualEdges).forEach((edge) => {
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
