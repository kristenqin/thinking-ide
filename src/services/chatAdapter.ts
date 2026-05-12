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

type ApiConversationMessage = {
  id: string;
  author?: {
    role?: string;
  };
  content?: {
    content_type?: string;
    parts?: unknown[];
  };
  metadata?: {
    is_visually_hidden_from_conversation?: boolean;
  };
  recipient?: string;
  create_time?: number;
};

type ApiConversationNode = {
  id: string;
  parent?: string;
  children?: string[];
  message?: ApiConversationMessage;
};

type ApiConversation = {
  current_node?: string;
  mapping: Record<string, ApiConversationNode>;
};

type SessionResponse = {
  accessToken?: string;
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
      type: "message",
      selector: message.domSelector ?? `[data-message-author-role="${message.role}"]`,
      role: message.role,
      domId: message.domId,
      occurrenceIndex,
      previewStart,
      previewEnd
    }
  };
}

function buildHeadingSourceRef(
  message: MessageRef,
  occurrenceIndex: number,
  headingText: string,
  headingLevel: number,
  domId?: string
): SourceRef {
  return {
    id: createId("source"),
    messageId: message.id,
    status: "active",
    anchor: {
      type: "heading",
      selector: message.domSelector ?? `[data-message-author-role="${message.role}"]`,
      role: message.role,
      domId,
      occurrenceIndex,
      previewStart: clampText(message.text, 80),
      previewEnd: clampText(message.text.slice(-80), 80),
      headingText,
      headingLevel
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

function extractHeadingSources(
  message: MessageRef,
  element: Element,
  occurrenceIndex: number
): SourceRef[] {
  const headingCandidates = Array.from(
    element.querySelectorAll('h1, [role="heading"][aria-level="1"]')
  );

  const seen = new Set<string>();

  return headingCandidates.flatMap((heading) => {
    const headingText = normalizeText(heading.textContent ?? "");
    if (!headingText || seen.has(headingText)) {
      return [];
    }

    seen.add(headingText);
    const headingDomId =
      typeof heading.getAttribute === "function" ? heading.getAttribute("id") ?? undefined : undefined;
    return [buildHeadingSourceRef(message, occurrenceIndex, headingText, 1, headingDomId)];
  });
}

function getCurrentChatIdFromPath(): string | null {
  const match = location.pathname.match(/^\/(?:c|g\/[a-z0-9-]+\/c)\/([a-z0-9-]+)/i);
  return match?.[1] ?? null;
}

function isSupportedConversationRole(role: string | undefined): role is MessageRole {
  return role === "user" || role === "assistant";
}

function shouldSkipConversationMessage(message: ApiConversationMessage | undefined): boolean {
  if (!message) {
    return true;
  }

  if (!isSupportedConversationRole(message.author?.role)) {
    return true;
  }

  if (message.recipient && message.recipient !== "all") {
    return true;
  }

  const contentType = message.content?.content_type;
  if (
    contentType === "thoughts" ||
    contentType === "reasoning_recap" ||
    contentType === "model_editable_context" ||
    contentType === "user_editable_context"
  ) {
    return true;
  }

  if (message.metadata?.is_visually_hidden_from_conversation) {
    return true;
  }

  return false;
}

function extractConversationText(message: ApiConversationMessage): string {
  const contentType = message.content?.content_type;
  if (contentType === "text" || contentType === "multimodal_text") {
    const parts = Array.isArray(message.content?.parts) ? message.content.parts : [];
    return normalizeText(
      parts
        .filter((part): part is string => typeof part === "string")
        .join("\n\n")
    );
  }

  return "";
}

function normalizeConversationMessages(conversation: ApiConversation, conversationKey: string): MessageRef[] {
  const mapping = conversation.mapping ?? {};
  const startNodeId =
    conversation.current_node ||
    Object.values(mapping).find((node) => !node.children || node.children.length === 0)?.id;
  if (!startNodeId) {
    return [];
  }

  const orderedNodes: ApiConversationNode[] = [];
  let currentNodeId: string | undefined = startNodeId;

  while (currentNodeId) {
    const node: ApiConversationNode | undefined = mapping[currentNodeId];
    if (!node) {
      break;
    }

    if (node.parent === undefined) {
      break;
    }

    if (!shouldSkipConversationMessage(node.message)) {
      orderedNodes.unshift(node);
    }

    currentNodeId = node.parent;
  }

  const merged: Array<{ role: MessageRole; text: string; id: string; createdAt: string }> = [];

  orderedNodes.forEach((node) => {
    const message = node.message;
    if (!message || !isSupportedConversationRole(message.author?.role)) {
      return;
    }

    const text = extractConversationText(message);
    if (!text) {
      return;
    }

    const role = message.author.role;
    const createdAt =
      typeof message.create_time === "number"
        ? new Date(message.create_time * 1000).toISOString()
        : new Date().toISOString();
    const previous = merged.at(-1);
    if (previous && previous.role === "assistant" && role === "assistant") {
      previous.text = `${previous.text}\n\n${text}`;
      previous.createdAt = createdAt;
      return;
    }

    merged.push({
      role,
      text,
      id: message.id || `${conversationKey}:${role}:${merged.length}`,
      createdAt
    });
  });

  return merged.map(({ role, text, id, createdAt }, orderIndex) => {
    const textHash = hashText(text);
    return {
      id,
      conversationKey,
      role,
      orderIndex,
      text,
      textHash,
      textPreview: clampText(text, 80),
      domSelector: `[data-message-author-role="${role}"]`,
      schemaVersion: MESSAGE_REF_SCHEMA_VERSION,
      createdAt
    };
  });
}

async function fetchSessionAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(new URL("/api/auth/session", location.origin).toString(), {
      credentials: "include"
    });
    if (!response.ok) {
      return null;
    }

    const session = (await response.json()) as SessionResponse;
    return typeof session.accessToken === "string" ? session.accessToken : null;
  } catch {
    return null;
  }
}

async function fetchConversationPayload(chatId: string): Promise<ApiConversation | null> {
  const accessToken = await fetchSessionAccessToken();
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(new URL(`/backend-api/conversation/${chatId}`, location.origin).toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Authorization": `Bearer ${accessToken}`
      },
      credentials: "include"
    });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ApiConversation;
  } catch {
    return null;
  }
}

function buildScanResult(messages: MessageRef[], previousMessages: MessageRef[]): ScanMessagesResult {
  const occurrenceCounts: Record<MessageRole, number> = {
    user: 0,
    assistant: 0
  };
  const visibleEntries = getMessageElements();
  const visibleAssistantElements = visibleEntries.filter((entry) => entry.role === "assistant").map((entry) => entry.element);
  const assistantMessageQueue = [...messages.filter((message) => message.role === "assistant")];
  const matchedAssistantElements = new Map<string, Element>();

  visibleAssistantElements.forEach((element) => {
    const elementText = normalizeText(element.textContent ?? "");
    if (!elementText) {
      return;
    }

    const exactIndex = assistantMessageQueue.findIndex((message) => message.text === elementText);
    const candidateIndex =
      exactIndex >= 0
        ? exactIndex
        : assistantMessageQueue.findIndex((message) => message.textHash === hashText(elementText));
    if (candidateIndex < 0) {
      return;
    }

    const [matchedMessage] = assistantMessageQueue.splice(candidateIndex, 1);
    if (matchedMessage) {
      matchedAssistantElements.set(matchedMessage.id, element);
    }
  });

  const sources = messages.flatMap((message) => {
    const occurrenceIndex = occurrenceCounts[message.role];
    occurrenceCounts[message.role] += 1;
    const baseSource = buildSourceRef(message, occurrenceIndex);
    if (message.role !== "assistant") {
      return [baseSource];
    }

    const matchedElement = matchedAssistantElements.get(message.id);
    if (!matchedElement) {
      return [baseSource];
    }

    return [baseSource, ...extractHeadingSources(message, matchedElement, occurrenceIndex)];
  });

  return {
    messages,
    sources,
    history: assessHistoryAvailability(messages, previousMessages)
  };
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

function scanVisibleMessages(previousMessages: MessageRef[] = []): ScanMessagesResult {
  const { conversationKey } = deriveConversationIdentity();
  const entries = getMessageElements();
  const messages = entries.flatMap(({ element, role }, orderIndex) => {
    const message = buildMessageRef(element, role, orderIndex, conversationKey);
    if (!message) {
      return [];
    }

    return [message];
  });

  return buildScanResult(messages, previousMessages);
}

export async function scanMessages(previousMessages: MessageRef[] = []): Promise<ScanMessagesResult> {
  const { conversationKey } = deriveConversationIdentity();
  const chatId = getCurrentChatIdFromPath();
  if (chatId) {
    const conversation = await fetchConversationPayload(chatId);
    if (conversation?.mapping) {
      const messages = normalizeConversationMessages(conversation, conversationKey);
      if (messages.length > 0) {
        return buildScanResult(messages, previousMessages);
      }
    }
  }

  return scanVisibleMessages(previousMessages);
}
