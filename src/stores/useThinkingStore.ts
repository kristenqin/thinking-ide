import { create } from "zustand";
import type { Connection, EdgeChange, NodeChange } from "@xyflow/react";
import type { ThinkingDocument } from "../models/document";
import type { ConceptMapEdgeRecord, EdgeRelationType } from "../models/edge";
import type { ConceptMapNodeRecord, NodeRole } from "../models/node";
import type { LanguageSetting, UserSettings } from "../models/settings";
import type { SourceRef } from "../models/source";
import {
  addDocumentConnection,
  applyDocumentEdgeChanges,
  applyDocumentNodeChanges,
  markDocumentSourceLost,
  type DocumentRecentAction,
  renameDocumentNode,
  restoreDocumentRemoval,
  softRemoveDocumentEdge,
  softRemoveDocumentNode,
  updateDocumentEdgeRelation,
  updateDocumentNodeRole,
  updateDocumentSettings
} from "../services/documentMutations";
import { clearPersistedDocument, loadDocument, persistDocument } from "../services/repository";

type Status = "ready" | "waiting" | "generating" | "synced" | "failed";

type ThinkingState = {
  document?: ThinkingDocument;
  status: Status;
  error?: string;
  notice?: string;
  recentAction?: DocumentRecentAction;
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

async function commitDocument(
  set: (partial: Partial<ThinkingState>) => void,
  document: ThinkingDocument,
  patch: Partial<ThinkingState> = {}
): Promise<void> {
  set({ document, ...patch });
  await persistDocument(document);
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
    await commitDocument(set, document, { status: "synced", error: undefined });
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

    await commitDocument(set, updateDocumentSettings(current, updates));
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

    await commitDocument(set, applyDocumentNodeChanges(current, changes));
  },
  async onEdgesChange(changes) {
    const current = get().document;
    if (!current) {
      return;
    }

    await commitDocument(set, applyDocumentEdgeChanges(current, changes));
  },
  async renameNode(nodeId, title) {
    const current = get().document;
    if (!current) {
      return;
    }

    await commitDocument(set, renameDocumentNode(current, nodeId, title));
  },
  async updateNodeRole(nodeId, role) {
    const current = get().document;
    if (!current) {
      return;
    }

    await commitDocument(set, updateDocumentNodeRole(current, nodeId, role));
  },
  async updateEdgeRelation(edgeId, relation) {
    const current = get().document;
    if (!current) {
      return;
    }

    await commitDocument(set, updateDocumentEdgeRelation(current, edgeId, relation));
  },
  async addConnection(connection) {
    const current = get().document;
    if (!current || !connection.source || !connection.target) {
      return;
    }

    await commitDocument(set, addDocumentConnection(current, connection));
  },
  focusSource(sourceId) {
    return get().document?.sources.find((source) => source.id === sourceId);
  },
  async markSourceLost(sourceId) {
    const current = get().document;
    if (!current) {
      return;
    }

    await commitDocument(set, markDocumentSourceLost(current, sourceId), {
      notice: "Original chat location is unavailable, but the node is still editable."
    });
  },
  async removeNode(nodeId) {
    const current = get().document;
    if (!current) {
      return;
    }

    const removal = softRemoveDocumentNode(current, nodeId);
    if (!removal) {
      return;
    }

    await commitDocument(set, removal.updated, {
      notice: "Node deleted.",
      recentAction: removal.recentAction
    });
  },
  async removeEdge(edgeId) {
    const current = get().document;
    if (!current) {
      return;
    }

    const removal = softRemoveDocumentEdge(current, edgeId);
    if (!removal) {
      return;
    }

    await commitDocument(set, removal.updated, {
      notice: "Edge deleted.",
      recentAction: removal.recentAction
    });
  },
  async undoLastRemoval() {
    const current = get().document;
    const recentAction = get().recentAction;
    if (!current || !recentAction) {
      return;
    }

    await commitDocument(set, restoreDocumentRemoval(current, recentAction), {
      notice: "Deletion undone.",
      recentAction: undefined
    });
  },
  async clearCurrentMap() {
    const current = get().document;
    if (!current) {
      return;
    }

    await clearPersistedDocument(current.conversation.id);
    set({
      document: undefined,
      notice: "Current map cleared.",
      recentAction: undefined,
      status: "ready",
      error: undefined
    });
  }
}));
