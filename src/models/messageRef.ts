export type MessageRole = "user" | "assistant";

export type MessageRef = {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: string;
};
