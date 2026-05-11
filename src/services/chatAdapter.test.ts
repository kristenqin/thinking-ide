import assert from "node:assert/strict";
import test from "node:test";
import { getConversationRef, scanMessages } from "./chatAdapter";

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
  elements
}: {
  pathname: string;
  href: string;
  title: string;
  elements: FakeMessageElement[];
}) {
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: {
      pathname,
      href
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
      }
    }
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

test("scanMessages returns all visible messages with stable orderIndex and locator metadata", () => {
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

  const { messages, sources } = scanMessages();

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
});
