import type { ThinkingDocument } from "../models/document";
import { db } from "../db/database";

function canUseIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

export async function loadDocument(conversationId: string): Promise<ThinkingDocument | undefined> {
  return db.documents.get(conversationId);
}

export async function saveDocument(document: ThinkingDocument): Promise<void> {
  await db.documents.put(document, document.conversation.id);
}

export async function deleteDocument(conversationId: string): Promise<void> {
  await db.documents.delete(conversationId);
}

export async function persistDocument(document: ThinkingDocument | undefined): Promise<void> {
  if (!document || !canUseIndexedDb()) {
    return;
  }

  await saveDocument(document);
}

export async function clearPersistedDocument(conversationId: string): Promise<void> {
  if (!canUseIndexedDb()) {
    return;
  }

  await deleteDocument(conversationId);
}
