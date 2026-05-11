import Dexie, { type Table } from "dexie";
import type { ThinkingDocument } from "../models/document";

export class ThinkingIdeDatabase extends Dexie {
  documents!: Table<ThinkingDocument, string>;

  constructor() {
    super("thinking-ide");
    this.version(1).stores({
      documents: "conversation.id, updatedAt"
    });
  }
}

export const db = new ThinkingIdeDatabase();
