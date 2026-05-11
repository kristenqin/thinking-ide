export type ConversationIdentitySource = "url-path" | "url-plus-title-hash" | "generated-session";

export type ConversationRef = {
  id: string;
  conversationKey: string;
  identitySource: ConversationIdentitySource;
  title?: string;
  sourceUrl: string;
  updatedAt: string;
};
