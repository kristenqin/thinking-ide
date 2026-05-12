import { create } from "zustand";
import { addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange } from "@xyflow/react";
import type { ThinkingDocument } from "../models/document";
import type { ConceptMapEdgeRecord, EdgeRelationType } from "../models/edge";
import type { ConceptMapNodeRecord, NodeRole } from "../models/node";
import type { LanguageSetting, UserSettings } from "../models/settings";
import type { SourceRef } from "../models/source";
import { deleteDocument, loadDocument, saveDocument } from "../services/repository";
import { createId } from "../utils/id";

type Status = "ready" | "waiting" | "generating" | "synced" | "failed";
type RecentAction =
  | {
      type: "remove_node";
      node: ConceptMapNodeRecord;
      relatedEdges: ConceptMapEdgeRecord[];
    }
  | {
      type: "remove_edge";
      edge: ConceptMapEdgeRecord;
    };

type ThinkingState = {
  document?: ThinkingDocument;
  status: Status;
  error?: string;
  notice?: string;
  recentAction?: RecentAction;
  hydrate: (conversationId: string) => Promise<void>;
  getDocument: () => ThinkingDocument | undefined;
  replaceDocument: (document: ThinkingDocument) => Promise<void>;
  setStatus: (status: Status, error?: string) => void;
  setNotice: (notice?: string) => void;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  setLanguage: (language: LanguageSetting) => Promise<void>;
  setAutoGenerate: (enabled: boolean) => Promise<void>;
  onNodesChange: (changes: NodeChange<ConceptMapNodeRecord>[]) => Promise<void>;
  onEdgesChange: (changes: EdgeChange<ConceptMapEdgeRecord>[]) => Promise<void>;
  renameNode: (nodeId: string, title: string) => Promise<void>;
  updateNodeRole: (nodeId: string, role: NodeRole) => Promise<void>;
  updateEdgeRelation: (edgeId: string, relation: EdgeRelationType) => Promise<void>;
  addConnection: (connection: Connection) => Promise<void>;
  focusSource: (sourceId: string) => SourceRef | undefined;
  markSourceLost: (sourceId: string) => Promise<void>;
  removeNode: (nodeId: string) => Promise<void>;
  removeEdge: (edgeId: string) => Promise<void>;
  undoLastRemoval: () => Promise<void>;
  clearCurrentMap: () => Promise<void>;
};

async function persist(document: ThinkingDocument | undefined): Promise<void> {
  if (typeof indexedDB === "undefined") {
    return;
  }

  if (document) {
    await saveDocument({ ...document, updatedAt: new Date().toISOString() });
  }
}

export const useThinkingStore = create<ThinkingState>((set, get) => ({
  status: "ready",
  async hydrate(conversationId) {
    const existing = await loadDocument(conversationId);
    if (existing) {
      set({ document: existing, status: "synced", error: undefined });
      return;
    }

    set({ document: undefined, status: "ready", error: undefined, notice: undefined, recentAction: undefined });
  },
  getDocument() {
    return get().document;
  },
  async replaceDocument(document) {
    set({ document, status: "synced", error: undefined });
    await persist(document);
  },
  setStatus(status, error) {
    set({ status, error });
  },
  setNotice(notice) {
    set({ notice });
  },
  async updateSettings(updates) {
    const current = get().document;
    if (!current) {
      return;
    }

    const settings = {
      ...current.settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    const updated = { ...current, settings, updatedAt: new Date().toISOString() };
    set({ document: updated });
    await persist(updated);
  },
  async setLanguage(language) {
    await get().updateSettings({ language });
  },
  async setAutoGenerate(enabled) {
    await get().updateSettings({ autoGenerate: enabled });
  },
  async onNodesChange(changes) {
    const current = get().document;
    if (!current) {
      return;
    }

    const nodes = applyNodeChanges(changes, current.nodes);
    const updated = { ...current, nodes, updatedAt: new Date().toISOString() };
    set({ document: updated });
    await persist(updated);
  },
  async onEdgesChange(changes) {
    const current = get().document;
    if (!current) {
      return;
    }

    const edges = applyEdgeChanges(changes, current.edges);
    const updated = { ...current, edges, updatedAt: new Date().toISOString() };
    set({ document: updated });
    await persist(updated);
  },
  async renameNode(nodeId, title) {
    const current = get().document;
    if (!current) {
      return;
    }

    const nodes = current.nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, title } } : node
    );
    const updated = { ...current, nodes, updatedAt: new Date().toISOString() };
    set({ document: updated });
    await persist(updated);
  },
  async updateNodeRole(nodeId, role) {
    const current = get().document;
    if (!current) {
      return;
    }

    const nodes = current.nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, role } } : node
    );
    const updated = { ...current, nodes, updatedAt: new Date().toISOString() };
    set({ document: updated });
    await persist(updated);
  },
  async updateEdgeRelation(edgeId, relation) {
    const current = get().document;
    if (!current) {
      return;
    }

    const edges = current.edges.map((edge) =>
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
    );
    const updated = { ...current, edges, updatedAt: new Date().toISOString() };
    set({ document: updated });
    await persist(updated);
  },
  async addConnection(connection) {
    const current = get().document;
    if (!current || !connection.source || !connection.target) {
      return;
    }

    const edges = addEdge(
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
      current.edges
    );
    const updated = { ...current, edges, updatedAt: new Date().toISOString() };
    set({ document: updated });
    await persist(updated);
  },
  focusSource(sourceId) {
    return get().document?.sources.find((source) => source.id === sourceId);
  },
  async markSourceLost(sourceId) {
    const current = get().document;
    if (!current) {
      return;
    }

    const sources = current.sources.map((source) =>
      source.id === sourceId ? { ...source, status: "lost" as const } : source
    );
    const updated = { ...current, sources, updatedAt: new Date().toISOString() };
    set({
      document: updated,
      notice: "Original chat location is unavailable, but the node is still editable."
    });
    await persist(updated);
  },
  async removeNode(nodeId) {
    const current = get().document;
    if (!current) {
      return;
    }

    const node = current.nodes.find((entry) => entry.id === nodeId);
    if (!node || node.data.status === "removed") {
      return;
    }

    const relatedEdges = current.edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );
    const nodes = current.nodes.map((entry) =>
      entry.id === nodeId ? { ...entry, data: { ...entry.data, status: "removed" as const } } : entry
    );
    const edges = current.edges.map((edge) =>
      edge.source === nodeId || edge.target === nodeId
        ? {
            ...edge,
            data: {
              relation: edge.data?.relation ?? "relates",
              status: "removed" as const
            }
          }
        : edge
    );
    const updated = { ...current, nodes, edges, updatedAt: new Date().toISOString() };
    set({
      document: updated,
      notice: "Node deleted.",
      recentAction: {
        type: "remove_node",
        node,
        relatedEdges
      }
    });
    await persist(updated);
  },
  async removeEdge(edgeId) {
    const current = get().document;
    if (!current) {
      return;
    }

    const edge = current.edges.find((entry) => entry.id === edgeId);
    if (!edge || edge.data?.status === "removed") {
      return;
    }

    const edges = current.edges.map((entry) =>
      entry.id === edgeId
        ? {
            ...entry,
            data: {
              relation: entry.data?.relation ?? "relates",
              status: "removed" as const
            }
          }
        : entry
    );
    const updated = { ...current, edges, updatedAt: new Date().toISOString() };
    set({
      document: updated,
      notice: "Edge deleted.",
      recentAction: {
        type: "remove_edge",
        edge
      }
    });
    await persist(updated);
  },
  async undoLastRemoval() {
    const current = get().document;
    const recentAction = get().recentAction;
    if (!current || !recentAction) {
      return;
    }

    let nodes = current.nodes;
    let edges = current.edges;

    if (recentAction.type === "remove_node") {
      nodes = current.nodes.map((entry) =>
        entry.id === recentAction.node.id ? recentAction.node : entry
      );
      const relatedEdgeIds = new Set(recentAction.relatedEdges.map((edge) => edge.id));
      edges = current.edges.map((entry) =>
        relatedEdgeIds.has(entry.id)
          ? recentAction.relatedEdges.find((edge) => edge.id === entry.id) ?? entry
          : entry
      );
    } else {
      edges = current.edges.map((entry) =>
        entry.id === recentAction.edge.id ? recentAction.edge : entry
      );
    }

    const updated = { ...current, nodes, edges, updatedAt: new Date().toISOString() };
    set({
      document: updated,
      notice: "Deletion undone.",
      recentAction: undefined
    });
    await persist(updated);
  },
  async clearCurrentMap() {
    const current = get().document;
    if (!current) {
      return;
    }

    if (typeof indexedDB !== "undefined") {
      await deleteDocument(current.conversation.id);
    }
    set({
      document: undefined,
      notice: "Current map cleared.",
      recentAction: undefined,
      status: "ready",
      error: undefined
    });
  }
}));
