import type { ConversationIdentitySource, ConversationRef } from "../models/conversation";
import { buildMessageRestoreKey, type MessageRef, type MessageRole } from "../models/messageRef";
import type { SourceRef } from "../models/source";
import { createId } from "../utils/id";
import { clampText, normalizeText } from "../utils/text";

const MESSAGE_REF_SCHEMA_VERSION = 1;
const STREAMING_SIGNAL_SELECTORS = [
  '[data-testid="stop-button"]',
  'button[aria-label="Stop generating"]',
  'button[aria-label="停止生成"]',
  '[class*="result-streaming"]',
  '[data-status="in_progress"]'
];

export type AssistantCompletionState = {
  latestMessageRole: MessageRole | null;
  completionKey: string | null;
  latestAssistantMessage?: MessageRef;
  isStreaming: boolean;
};

export type HistoryAvailability = {
  coverage: "available" | "partial";
  reason: "restored-gap" | null;
  visibleMessageCount: number;
  matchedPersistedMessageCount: number;
  missingPersistedMessageCount: number;
};

export type ScanMessagesResult = {
  messages: MessageRef[];
  sources: SourceRef[];
  history: HistoryAvailability;
};

function hashText(value: string): string {
  let hash = 5381;

  for (const character of value) {
    hash = (hash * 33) ^ character.charCodeAt(0);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function deriveConversationIdentity(): {
  conversationKey: string;
  identitySource: ConversationIdentitySource;
} {
  const normalizedPath = location.pathname.replace(/\/+$/, "") || "/";
  if (/\/c\/[^/]+$/i.test(normalizedPath)) {
    return {
      conversationKey: normalizedPath,
      identitySource: "url-path"
    };
  }

  const normalizedTitle = document.title.replace(/\s+-\s+ChatGPT$/i, "").trim();
  if (normalizedPath !== "/" && normalizedTitle) {
    return {
      conversationKey: `${normalizedPath}#${hashText(normalizedTitle)}`,
      identitySource: "url-plus-title-hash"
    };
  }

  return {
    conversationKey: `session:${hashText(`${location.href}|${normalizedTitle || "untitled"}`)}`,
    identitySource: "generated-session"
  };
}

function buildMessageRef(
  element: Element,
  role: MessageRole,
  orderIndex: number,
  conversationKey: string
): MessageRef | null {
  const text = normalizeText(element.textContent ?? "");
  if (!text) {
    return null;
  }

  const textHash = hashText(text);
  const domId = element.id || undefined;

  return {
    id: domId ?? `${conversationKey}:${role}:${orderIndex}:${textHash.slice(0, 8)}`,
    conversationKey,
    role,
    orderIndex,
    text,
    textHash,
    textPreview: clampText(text, 80),
    domSelector: `[data-message-author-role="${role}"]`,
    domId,
    schemaVersion: MESSAGE_REF_SCHEMA_VERSION,
    createdAt: new Date().toISOString()
  };
}

function buildSourceRef(message: MessageRef, occurrenceIndex: number): SourceRef {
  const previewStart = clampText(message.text, 80);
  const previewEnd = clampText(message.text.slice(-80), 80);

  return {
    id: createId("source"),
    messageId: message.id,
    status: "active",
    anchor: {
      selector: message.domSelector ?? `[data-message-author-role="${message.role}"]`,
      role: message.role,
      domId: message.domId,
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

function isHostGenerationInProgress(): boolean {
  return STREAMING_SIGNAL_SELECTORS.some((selector) => Boolean(document.querySelector(selector)));
}

export function assessHistoryAvailability(
  messages: MessageRef[],
  previousMessages: MessageRef[] = []
): HistoryAvailability {
  if (previousMessages.length === 0) {
    return {
      coverage: "available",
      reason: null,
      visibleMessageCount: messages.length,
      matchedPersistedMessageCount: 0,
      missingPersistedMessageCount: 0
    };
  }

  const visibleRestoreKeys = new Set(messages.map((message) => buildMessageRestoreKey(message)));
  let matchedPersistedMessageCount = 0;

  previousMessages.forEach((message) => {
    if (visibleRestoreKeys.has(buildMessageRestoreKey(message))) {
      matchedPersistedMessageCount += 1;
    }
  });

  const missingPersistedMessageCount = Math.max(previousMessages.length - matchedPersistedMessageCount, 0);

  return {
    coverage: missingPersistedMessageCount > 0 ? "partial" : "available",
    reason: missingPersistedMessageCount > 0 ? "restored-gap" : null,
    visibleMessageCount: messages.length,
    matchedPersistedMessageCount,
    missingPersistedMessageCount
  };
}

export function getConversationRef(): ConversationRef {
  const { conversationKey, identitySource } = deriveConversationIdentity();
  const title = document.title.replace(/\s+-\s+ChatGPT$/i, "").trim();

  return {
    id: conversationKey,
    conversationKey,
    identitySource,
    title,
    sourceUrl: location.href,
    updatedAt: new Date().toISOString()
  };
}

export function getAssistantCompletionState(): AssistantCompletionState {
  const { conversationKey } = deriveConversationIdentity();
  const entries = getMessageElements();
  const latestEntry = entries.at(-1);

  if (!latestEntry) {
    return {
      latestMessageRole: null,
      completionKey: null,
      isStreaming: isHostGenerationInProgress()
    };
  }

  if (latestEntry.role !== "assistant") {
    return {
      latestMessageRole: latestEntry.role,
      completionKey: null,
      isStreaming: isHostGenerationInProgress()
    };
  }

  const message = buildMessageRef(latestEntry.element, "assistant", entries.length - 1, conversationKey);

  return {
    latestMessageRole: "assistant",
    completionKey: message ? `${message.id}:${message.textHash}` : null,
    latestAssistantMessage: message ?? undefined,
    isStreaming: isHostGenerationInProgress()
  };
}

export function scanMessages(previousMessages: MessageRef[] = []): ScanMessagesResult {
  const { conversationKey } = deriveConversationIdentity();
  const occurrenceCounts: Record<MessageRole, number> = {
    user: 0,
    assistant: 0
  };
  const entries = getMessageElements();
  const pairs = entries.flatMap(({ element, role }, orderIndex) => {
    const occurrenceIndex = occurrenceCounts[role];
    occurrenceCounts[role] += 1;

    const message = buildMessageRef(element, role, orderIndex, conversationKey);
    if (!message) {
      return [];
    }

    return [
      {
        message,
        source: buildSourceRef(message, occurrenceIndex)
      }
    ];
  });
  const messages = pairs.map((pair) => pair.message);

  return {
    messages,
    sources: pairs.map((pair) => pair.source),
    history: assessHistoryAvailability(messages, previousMessages)
  };
}
