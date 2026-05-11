import { create } from "zustand";
import { addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange } from "@xyflow/react";
import type { ThinkingDocument } from "../models/document";
import type { ConceptMapEdgeRecord } from "../models/edge";
import type { ConceptMapNodeRecord } from "../models/node";
import type { SourceRef } from "../models/source";
import { loadDocument, saveDocument } from "../services/repository";
import { createId } from "../utils/id";

type Status = "idle" | "scanning" | "ready" | "error";

type ThinkingState = {
  document?: ThinkingDocument;
  status: Status;
  error?: string;
  hydrate: (conversationId: string) => Promise<void>;
  replaceDocument: (document: ThinkingDocument) => Promise<void>;
  setStatus: (status: Status, error?: string) => void;
  onNodesChange: (changes: NodeChange<ConceptMapNodeRecord>[]) => Promise<void>;
  onEdgesChange: (changes: EdgeChange<ConceptMapEdgeRecord>[]) => Promise<void>;
  renameNode: (nodeId: string, title: string) => Promise<void>;
  addConnection: (connection: Connection) => Promise<void>;
  focusSource: (sourceId: string) => SourceRef | undefined;
};

async function persist(document: ThinkingDocument | undefined): Promise<void> {
  if (document) {
    await saveDocument({ ...document, updatedAt: new Date().toISOString() });
  }
}

export const useThinkingStore = create<ThinkingState>((set, get) => ({
  status: "idle",
  async hydrate(conversationId) {
    const existing = await loadDocument(conversationId);
    if (existing) {
      set({ document: existing, status: "ready", error: undefined });
    }
  },
  async replaceDocument(document) {
    set({ document, status: "ready", error: undefined });
    await persist(document);
  },
  setStatus(status, error) {
    set({ status, error });
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
  }
}));
