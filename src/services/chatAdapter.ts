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

function buildSourceRef(message: MessageRef, role: MessageRole, occurrenceIndex: number): SourceRef {
  const previewStart = clampText(message.text, 80);
  const previewEnd = clampText(message.text.slice(-80), 80);

  return {
    id: createId("source"),
    messageId: message.id,
    status: "active",
    anchor: {
      selector: `[data-message-author-role="${message.role}"]`,
      role,
      domId: message.id.startsWith(`${role}_`) ? undefined : message.id,
      occurrenceIndex,
      previewStart,
      previewEnd
    }
  };
}

function getMessageElements(): Array<{ element: Element; role: MessageRole }> {
  return Array.from(document.querySelectorAll('[data-message-author-role]'))
    .map((element) => {
      const role = element.getAttribute("data-message-author-role");
      if (role === "user" || role === "assistant") {
        return { element, role };
      }

      return null;
    })
    .filter((entry): entry is { element: Element; role: MessageRole } => Boolean(entry));
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
  const occurrenceCounts: Record<MessageRole, number> = {
    user: 0,
    assistant: 0
  };
  const entries = getMessageElements();
  const pairs = entries.flatMap(({ element, role }) => {
    const occurrenceIndex = occurrenceCounts[role];
    occurrenceCounts[role] += 1;

    const message = buildMessageRef(element, role, occurrenceIndex);
    if (!message) {
      return [];
    }

    return [
      {
        message,
        source: buildSourceRef(message, role, occurrenceIndex)
      }
    ];
  });
  const messages = pairs.map((pair) => pair.message);

  return {
    messages,
    sources: pairs.map((pair) => pair.source)
  };
}
