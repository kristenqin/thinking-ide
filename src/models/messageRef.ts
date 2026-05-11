export type MessageRole = "user" | "assistant";

export type MessageRef = {
  id: string;
  conversationKey: string;
  role: MessageRole;
  orderIndex: number;
  text: string;
  textHash: string;
  textPreview: string;
  domSelector?: string;
  domId?: string;
  schemaVersion: number;
  createdAt: string;
};
