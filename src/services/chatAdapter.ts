import type { ConversationRef } from "../models/conversation";
import type { MessageRef, MessageRole } from "../models/messageRef";
import type { SourceRef } from "../models/source";
import { createId } from "../utils/id";
import { clampText, normalizeText } from "../utils/text";

const ROLE_SELECTORS: Array<{ role: MessageRole; selector: string }> = [
  { role: "user", selector: '[data-message-author-role="user"]' },
  { role: "assistant", selector: '[data-message-author-role="assistant"]' }
];

function buildMessageRef(element: Element, role: MessageRole, index: number): MessageRef | null {
  const text = normalizeText(element.textContent ?? "");
  if (!text) {
    return null;
  }

  return {
    id: element.id || `${role}_${index}`,
    role,
    text,
    createdAt: new Date().toISOString()
  };
}

function buildSourceRef(message: MessageRef): SourceRef {
  return {
    id: createId("source"),
    messageId: message.id,
    status: "active",
    anchor: {
      selector: `[data-message-author-role="${message.role}"]`,
      previewText: clampText(message.text, 80)
    }
  };
}

export function getConversationRef(): ConversationRef {
  const title = document.title.replace(/\s+-\s+ChatGPT$/i, "").trim();

  return {
    id: location.pathname || "/",
    title,
    sourceUrl: location.href,
    updatedAt: new Date().toISOString()
  };
}

export function scanMessages(): { messages: MessageRef[]; sources: SourceRef[] } {
  const messages = ROLE_SELECTORS.flatMap(({ role, selector }) =>
    Array.from(document.querySelectorAll(selector))
      .map((element, index) => buildMessageRef(element, role, index))
      .filter((message): message is MessageRef => Boolean(message))
  ).sort((left, right) => left.id.localeCompare(right.id));

  return {
    messages,
    sources: messages.map(buildSourceRef)
  };
}
