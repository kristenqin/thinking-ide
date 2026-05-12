import { addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange } from "@xyflow/react";
import type { ThinkingDocument } from "../models/document";
import type { ConceptMapEdgeRecord, EdgeRelationType } from "../models/edge";
import type { ConceptMapNodeRecord, NodeRole } from "../models/node";
import type { UserSettings } from "../models/settings";
import { createId } from "../utils/id";

export type DocumentRecentAction =
  | {
      type: "remove_node";
      node: ConceptMapNodeRecord;
      relatedEdges: ConceptMapEdgeRecord[];
    }
  | {
      type: "remove_edge";
      edge: ConceptMapEdgeRecord;
    };

export function updateDocumentSettings(
  document: ThinkingDocument,
  updates: Partial<UserSettings>
): ThinkingDocument {
  const updatedAt = new Date().toISOString();
  return {
    ...document,
    settings: {
      ...document.settings,
      ...updates,
      updatedAt
    },
    updatedAt
  };
}

export function applyDocumentNodeChanges(
  document: ThinkingDocument,
  changes: NodeChange<ConceptMapNodeRecord>[]
): ThinkingDocument {
  return {
    ...document,
    nodes: applyNodeChanges(changes, document.nodes),
    updatedAt: new Date().toISOString()
  };
}

export function applyDocumentEdgeChanges(
  document: ThinkingDocument,
  changes: EdgeChange<ConceptMapEdgeRecord>[]
): ThinkingDocument {
  return {
    ...document,
    edges: applyEdgeChanges(changes, document.edges),
    updatedAt: new Date().toISOString()
  };
}

export function renameDocumentNode(
  document: ThinkingDocument,
  nodeId: string,
  title: string
): ThinkingDocument {
  return {
    ...document,
    nodes: document.nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, title } } : node
    ),
    updatedAt: new Date().toISOString()
  };
}

export function updateDocumentNodeRole(
  document: ThinkingDocument,
  nodeId: string,
  role: NodeRole
): ThinkingDocument {
  return {
    ...document,
    nodes: document.nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, role } } : node
    ),
    updatedAt: new Date().toISOString()
  };
}

export function updateDocumentEdgeRelation(
  document: ThinkingDocument,
  edgeId: string,
  relation: EdgeRelationType
): ThinkingDocument {
  return {
    ...document,
    edges: document.edges.map((edge) =>
      edge.id === edgeId
        ? {
            ...edge,
            label: relation,
            data: {
              relation,
              status: "draft" as const
            }
          }
        : edge
    ),
    updatedAt: new Date().toISOString()
  };
}

export function addDocumentConnection(
  document: ThinkingDocument,
  connection: Connection
): ThinkingDocument {
  if (!connection.source || !connection.target) {
    return document;
  }

  return {
    ...document,
    edges: addEdge(
      {
        id: createId("edge"),
        source: connection.source,
        target: connection.target,
        label: "relates",
        data: {
          relation: "relates",
          status: "draft"
        }
      },
      document.edges
    ),
    updatedAt: new Date().toISOString()
  };
}

export function markDocumentSourceLost(
  document: ThinkingDocument,
  sourceId: string
): ThinkingDocument {
  return {
    ...document,
    sources: document.sources.map((source) =>
      source.id === sourceId ? { ...source, status: "lost" as const } : source
    ),
    updatedAt: new Date().toISOString()
  };
}

export function softRemoveDocumentNode(
  document: ThinkingDocument,
  nodeId: string
): { updated: ThinkingDocument; recentAction: DocumentRecentAction } | undefined {
  const node = document.nodes.find((entry) => entry.id === nodeId);
  if (!node || node.data.status === "removed") {
    return undefined;
  }

  const relatedEdges = document.edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
  return {
    updated: {
      ...document,
      nodes: document.nodes.map((entry) =>
        entry.id === nodeId ? { ...entry, data: { ...entry.data, status: "removed" as const } } : entry
      ),
      edges: document.edges.map((edge) =>
        edge.source === nodeId || edge.target === nodeId
          ? {
              ...edge,
              data: {
                relation: edge.data?.relation ?? "relates",
                status: "removed" as const
              }
            }
          : edge
      ),
      updatedAt: new Date().toISOString()
    },
    recentAction: {
      type: "remove_node",
      node,
      relatedEdges
    }
  };
}

export function softRemoveDocumentEdge(
  document: ThinkingDocument,
  edgeId: string
): { updated: ThinkingDocument; recentAction: DocumentRecentAction } | undefined {
  const edge = document.edges.find((entry) => entry.id === edgeId);
  if (!edge || edge.data?.status === "removed") {
    return undefined;
  }

  return {
    updated: {
      ...document,
      edges: document.edges.map((entry) =>
        entry.id === edgeId
          ? {
              ...entry,
              data: {
                relation: entry.data?.relation ?? "relates",
                status: "removed" as const
              }
            }
          : entry
      ),
      updatedAt: new Date().toISOString()
    },
    recentAction: {
      type: "remove_edge",
      edge
    }
  };
}

export function restoreDocumentRemoval(
  document: ThinkingDocument,
  recentAction: DocumentRecentAction
): ThinkingDocument {
  let nodes = document.nodes;
  let edges = document.edges;

  if (recentAction.type === "remove_node") {
    nodes = document.nodes.map((entry) => (entry.id === recentAction.node.id ? recentAction.node : entry));
    const relatedEdgeIds = new Set(recentAction.relatedEdges.map((edge) => edge.id));
    edges = document.edges.map((entry) =>
      relatedEdgeIds.has(entry.id)
        ? recentAction.relatedEdges.find((edge) => edge.id === entry.id) ?? entry
        : entry
    );
  } else {
    edges = document.edges.map((entry) => (entry.id === recentAction.edge.id ? recentAction.edge : entry));
  }

  return {
    ...document,
    nodes,
    edges,
    updatedAt: new Date().toISOString()
  };
}
