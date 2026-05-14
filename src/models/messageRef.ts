export type MessageRole = "user" | "assistant";

export type MessageRef = {
  id: string;
  conversationKey: string;
  role: MessageRole;
  orderIndex: number;
  text: string;
  markdownText?: string;
  textHash: string;
  textPreview: string;
  domSelector?: string;
  domId?: string;
  schemaVersion: number;
  createdAt: string;
};

export function buildMessageRestoreKey(
  message: Pick<MessageRef, "conversationKey" | "role" | "orderIndex" | "textHash">
): string {
  return [message.conversationKey, message.role, message.orderIndex, message.textHash].join("::");
}
