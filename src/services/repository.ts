import type { ThinkingDocument } from "../models/document";
import { db } from "../db/database";

export async function loadDocument(conversationId: string): Promise<ThinkingDocument | undefined> {
  return db.documents.get(conversationId);
}

export async function saveDocument(document: ThinkingDocument): Promise<void> {
  await db.documents.put(document, document.conversation.id);
}

export async function deleteDocument(conversationId: string): Promise<void> {
  await db.documents.delete(conversationId);
}
