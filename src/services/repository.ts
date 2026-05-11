import { db } from "../db/database";
import type { ThinkingDocument } from "../models/document";

export async function loadDocument(conversationId: string): Promise<ThinkingDocument | undefined> {
  return db.documents.get(conversationId);
}

export async function saveDocument(document: ThinkingDocument): Promise<void> {
  await db.documents.put(document, document.conversation.id);
}
