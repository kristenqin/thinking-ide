import assert from "node:assert/strict";
import test from "node:test";
import {
  assessHistoryAvailability,
  getAssistantCompletionState,
  getConversationRef,
  scanMessages
} from "./chatAdapter";

class FakeMessageElement {
  constructor(
    public readonly id: string,
    private readonly role: "user" | "assistant",
    public readonly textContent: string
  ) {}

  getAttribute(name: string): string | null {
    if (name === "data-message-author-role") {
      return this.role;
    }

    return null;
  }
}

function installEnvironment({
  pathname,
  href,
  title,
  elements,
  streamingSelectors = [],
  fetchImpl
}: {
  pathname: string;
  href: string;
  title: string;
  elements: FakeMessageElement[];
  streamingSelectors?: string[];
  fetchImpl?: typeof fetch;
}) {
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: {
      pathname,
      href,
      origin: new URL(href).origin
    }
  });

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      title,
      querySelectorAll(selector: string) {
        if (selector === '[data-message-author-role]') {
          return elements as unknown as NodeListOf<Element>;
        }

        return [] as unknown as NodeListOf<Element>;
      },
      querySelector(selector: string) {
        return streamingSelectors.includes(selector) ? ({} as Element) : null;
      }
    }
  });

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value:
      fetchImpl ??
      (async () => ({
        ok: false
      }))
  });
}

test("getConversationRef derives a stable conversationKey from a canonical chat path", () => {
  installEnvironment({
    pathname: "/c/abc123",
    href: "https://chatgpt.com/c/abc123",
    title: "Runtime spine - ChatGPT",
    elements: []
  });

  const conversation = getConversationRef();

  assert.equal(conversation.id, "/c/abc123");
  assert.equal(conversation.conversationKey, "/c/abc123");
  assert.equal(conversation.identitySource, "url-path");
  assert.equal(conversation.title, "Runtime spine");
});

test("scanMessages returns all visible messages with stable orderIndex and locator metadata", async () => {
  installEnvironment({
    pathname: "/c/history-1",
    href: "https://chatgpt.com/c/history-1",
    title: "History thread - ChatGPT",
    elements: [
      new FakeMessageElement("user-1", "user", "First user message"),
      new FakeMessageElement("assistant-1", "assistant", "First assistant answer"),
      new FakeMessageElement("user-2", "user", "Second user message"),
      new FakeMessageElement("assistant-2", "assistant", "Second assistant answer")
    ]
  });

  const { messages, sources, history } = await scanMessages();

  assert.equal(messages.length, 4);
  assert.deepEqual(
    messages.map((message) => ({
      id: message.id,
      role: message.role,
      orderIndex: message.orderIndex,
      conversationKey: message.conversationKey
    })),
    [
      { id: "user-1", role: "user", orderIndex: 0, conversationKey: "/c/history-1" },
      { id: "assistant-1", role: "assistant", orderIndex: 1, conversationKey: "/c/history-1" },
      { id: "user-2", role: "user", orderIndex: 2, conversationKey: "/c/history-1" },
      { id: "assistant-2", role: "assistant", orderIndex: 3, conversationKey: "/c/history-1" }
    ]
  );
  assert.ok(messages.every((message) => message.textHash.length === 8));
  assert.ok(messages.every((message) => message.textPreview.length > 0));
  assert.ok(messages.every((message) => message.schemaVersion === 1));
  assert.equal(sources.length, 4);
  assert.deepEqual(
    sources.map((source) => source.messageId),
    ["user-1", "assistant-1", "user-2", "assistant-2"]
  );
  assert.deepEqual(history, {
    coverage: "available",
    reason: null,
    visibleMessageCount: 4,
    matchedPersistedMessageCount: 0,
    missingPersistedMessageCount: 0
  });
});

test("getAssistantCompletionState reports the latest assistant completion key when the reply is settled", () => {
  installEnvironment({
    pathname: "/c/history-2",
    href: "https://chatgpt.com/c/history-2",
    title: "Settled reply - ChatGPT",
    elements: [
      new FakeMessageElement("user-1", "user", "Question"),
      new FakeMessageElement("assistant-1", "assistant", "Structured answer")
    ]
  });

  const state = getAssistantCompletionState();

  assert.equal(state.latestMessageRole, "assistant");
  assert.equal(state.isStreaming, false);
  assert.match(state.completionKey ?? "", /^assistant-1:/);
  assert.equal(state.latestAssistantMessage?.id, "assistant-1");
});

test("getAssistantCompletionState prefers host-native generation signals when they are present", () => {
  installEnvironment({
    pathname: "/c/history-3",
    href: "https://chatgpt.com/c/history-3",
    title: "Streaming reply - ChatGPT",
    elements: [
      new FakeMessageElement("user-1", "user", "Question"),
      new FakeMessageElement("assistant-1", "assistant", "Still streaming")
    ],
    streamingSelectors: ['[data-testid="stop-button"]']
  });

  const state = getAssistantCompletionState();

  assert.equal(state.latestMessageRole, "assistant");
  assert.equal(state.isStreaming, true);
  assert.match(state.completionKey ?? "", /^assistant-1:/);
});

test("assessHistoryAvailability marks restoration as partial when persisted messages are missing from the visible host window", () => {
  const previousMessages = [
    {
      id: "user-1",
      conversationKey: "/c/history-restore",
      role: "user" as const,
      orderIndex: 0,
      text: "First question",
      textHash: "1111aaaa",
      textPreview: "First question",
      schemaVersion: 1,
      createdAt: "2026-05-12T00:00:00.000Z"
    },
    {
      id: "assistant-1",
      conversationKey: "/c/history-restore",
      role: "assistant" as const,
      orderIndex: 1,
      text: "First answer",
      textHash: "2222bbbb",
      textPreview: "First answer",
      schemaVersion: 1,
      createdAt: "2026-05-12T00:00:00.000Z"
    }
  ];
  const visibleMessages = [previousMessages[1]];

  const history = assessHistoryAvailability(visibleMessages, previousMessages);

  assert.deepEqual(history, {
    coverage: "partial",
    reason: "restored-gap",
    visibleMessageCount: 1,
    matchedPersistedMessageCount: 1,
    missingPersistedMessageCount: 1
  });
});

test("scanMessages reports available restoration coverage when all persisted messages are still visible", async () => {
  installEnvironment({
    pathname: "/c/history-full",
    href: "https://chatgpt.com/c/history-full",
    title: "Full history - ChatGPT",
    elements: [
      new FakeMessageElement("user-1", "user", "First question"),
      new FakeMessageElement("assistant-1", "assistant", "First answer")
    ]
  });

  const previousMessages = (await scanMessages()).messages;

  const { history } = await scanMessages(previousMessages);

  assert.deepEqual(history, {
    coverage: "available",
    reason: null,
    visibleMessageCount: 2,
    matchedPersistedMessageCount: 2,
    missingPersistedMessageCount: 0
  });
});

test("scanMessages prefers the conversation payload and returns the full active branch history", async () => {
  installEnvironment({
    pathname: "/c/full-history",
    href: "https://chatgpt.com/c/full-history",
    title: "Full history - ChatGPT",
    elements: [new FakeMessageElement("assistant-visible", "assistant", "Visible tail only")],
    fetchImpl: async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/auth/session")) {
        return {
          ok: true,
          json: async () => ({ accessToken: "token-123" })
        } as Response;
      }

      if (url.endsWith("/backend-api/conversation/full-history")) {
        return {
          ok: true,
          json: async () => ({
            current_node: "assistant-2",
            mapping: {
              root: { id: "root", children: ["user-1"] },
              "user-1": {
                id: "user-1",
                parent: "root",
                children: ["assistant-1"],
                message: {
                  id: "user-1",
                  author: { role: "user" },
                  content: { content_type: "text", parts: ["First question"] },
                  recipient: "all",
                  create_time: 1715510000
                }
              },
              "assistant-1": {
                id: "assistant-1",
                parent: "user-1",
                children: ["user-2"],
                message: {
                  id: "assistant-1",
                  author: { role: "assistant" },
                  content: { content_type: "text", parts: ["First answer"] },
                  recipient: "all",
                  create_time: 1715510010
                }
              },
              "user-2": {
                id: "user-2",
                parent: "assistant-1",
                children: ["assistant-2"],
                message: {
                  id: "user-2",
                  author: { role: "user" },
                  content: { content_type: "text", parts: ["Second question"] },
                  recipient: "all",
                  create_time: 1715510020
                }
              },
              "assistant-2": {
                id: "assistant-2",
                parent: "user-2",
                children: [],
                message: {
                  id: "assistant-2",
                  author: { role: "assistant" },
                  content: { content_type: "text", parts: ["Second answer"] },
                  recipient: "all",
                  create_time: 1715510030
                }
              }
            }
          })
        } as Response;
      }

      throw new Error(`Unexpected fetch url: ${url}`);
    }
  });

  const { messages } = await scanMessages();

  assert.deepEqual(
    messages.map((message) => [message.id, message.role, message.orderIndex, message.text]),
    [
      ["user-1", "user", 0, "First question"],
      ["assistant-1", "assistant", 1, "First answer"],
      ["user-2", "user", 2, "Second question"],
      ["assistant-2", "assistant", 3, "Second answer"]
    ]
  );
});
