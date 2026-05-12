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
import { loadDocument } from "../services/repository";
import { clearDocumentStoreState, commitDocumentState, runDocumentStoreAction } from "./documentActionRunner";

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

export const useThinkingStore = create<ThinkingState>((set, get) => {
  const documentGet = getScopedGet(get);
  const documentSet = getScopedSet(set);

  return {
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
      await commitDocumentState(documentSet, document, { status: "synced", error: undefined });
    },
    setStatus(status, error) {
      set({ status, error });
    },
    setNotice(notice) {
      set({ notice });
    },
    async updateSettings(updates) {
      await runDocumentStoreAction(documentGet, documentSet, (_state, current) => ({
        document: updateDocumentSettings(current, updates)
      }));
    },
    async setLanguage(language) {
      await get().updateSettings({ language });
    },
    async setAutoGenerate(enabled) {
      await get().updateSettings({ autoGenerate: enabled });
    },
    async onNodesChange(changes) {
      await runDocumentStoreAction(documentGet, documentSet, (_state, current) => ({
        document: applyDocumentNodeChanges(current, changes)
      }));
    },
    async onEdgesChange(changes) {
      await runDocumentStoreAction(documentGet, documentSet, (_state, current) => ({
        document: applyDocumentEdgeChanges(current, changes)
      }));
    },
    async renameNode(nodeId, title) {
      await runDocumentStoreAction(documentGet, documentSet, (_state, current) => ({
        document: renameDocumentNode(current, nodeId, title)
      }));
    },
    async updateNodeRole(nodeId, role) {
      await runDocumentStoreAction(documentGet, documentSet, (_state, current) => ({
        document: updateDocumentNodeRole(current, nodeId, role)
      }));
    },
    async updateEdgeRelation(edgeId, relation) {
      await runDocumentStoreAction(documentGet, documentSet, (_state, current) => ({
        document: updateDocumentEdgeRelation(current, edgeId, relation)
      }));
    },
    async addConnection(connection) {
      if (!connection.source || !connection.target) {
        return;
      }

      await runDocumentStoreAction(documentGet, documentSet, (_state, current) => ({
        document: addDocumentConnection(current, connection)
      }));
    },
    focusSource(sourceId) {
      return get().document?.sources.find((source) => source.id === sourceId);
    },
    async markSourceLost(sourceId) {
      await runDocumentStoreAction(documentGet, documentSet, (_state, current) => ({
        document: markDocumentSourceLost(current, sourceId),
        patch: {
          notice: "Original chat location is unavailable, but the node is still editable."
        }
      }));
    },
    async removeNode(nodeId) {
      await runDocumentStoreAction(documentGet, documentSet, (_state, current) => {
        const removal = softRemoveDocumentNode(current, nodeId);
        if (!removal) {
          return undefined;
        }

        return {
          document: removal.updated,
          patch: {
            notice: "Node deleted.",
            recentAction: removal.recentAction
          }
        };
      });
    },
    async removeEdge(edgeId) {
      await runDocumentStoreAction(documentGet, documentSet, (_state, current) => {
        const removal = softRemoveDocumentEdge(current, edgeId);
        if (!removal) {
          return undefined;
        }

        return {
          document: removal.updated,
          patch: {
            notice: "Edge deleted.",
            recentAction: removal.recentAction
          }
        };
      });
    },
    async undoLastRemoval() {
      await runDocumentStoreAction(documentGet, documentSet, (state, current) => {
        const recentAction = state.recentAction;
        if (!recentAction) {
          return undefined;
        }

        return {
          document: restoreDocumentRemoval(current, recentAction),
          patch: {
            notice: "Deletion undone.",
            recentAction: undefined
          }
        };
      });
    },
    async clearCurrentMap() {
      await clearDocumentStoreState(documentGet, documentSet, {
        notice: "Current map cleared.",
        recentAction: undefined,
        status: "ready",
        error: undefined
      });
    }
  };
});

type ThinkingStoreSlice = Pick<
  ThinkingState,
  "document" | "notice" | "recentAction" | "status" | "error"
>;

function getScopedGet(get: () => ThinkingState): () => ThinkingStoreSlice {
  return get;
}

function getScopedSet(
  set: (partial: Partial<ThinkingState>) => void
): (partial: Partial<ThinkingStoreSlice>) => void {
  return set;
}
