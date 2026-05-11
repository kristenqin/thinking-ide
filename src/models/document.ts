import type { ConversationRef } from "./conversation";
import type { ConceptMapEdgeRecord } from "./edge";
import type { MessageRef } from "./messageRef";
import type { ConceptMapNodeRecord } from "./node";
import type { SourceRef } from "./source";
import type { UserSettings } from "./settings";

export type ThinkingDocument = {
  conversation: ConversationRef;
  messages: MessageRef[];
  nodes: ConceptMapNodeRecord[];
  edges: ConceptMapEdgeRecord[];
  sources: SourceRef[];
  settings: UserSettings;
  updatedAt: string;
};
