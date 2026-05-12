import assert from "node:assert/strict";
import test from "node:test";
import type { ConversationRef } from "../models/conversation";
import type { ThinkingDocument } from "../models/document";
import { createDefaultSettings } from "../models/settings";
import type { MessageRef } from "../models/messageRef";
import type { ScanMessagesResult } from "./chatAdapter";
import { createSidepanelSessionController } from "./sidepanelSessionController";

function flushMicrotasks() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function installWindowTimers() {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      setTimeout,
      clearTimeout
    }
  });
}

function createConversation(id: string): ConversationRef {
  return {
    id,
    conversationKey: id,
    identitySource: "url-path",
    title: "Recovered chat",
    sourceUrl: `https://chatgpt.com${id}`,
    updatedAt: "2026-05-12T00:00:00.000Z"
  };
}

function createDocument(conversation: ConversationRef): ThinkingDocument {
  return {
    conversation,
    messages: [],
    nodes: [],
    edges: [],
    sources: [],
    settings: createDefaultSettings(),
    updatedAt: "2026-05-12T00:00:00.000Z"
  };
}

function createMessage(id: string, role: "user" | "assistant", text: string, orderIndex: number): MessageRef {
  return {
    id,
    conversationKey: "/c/test",
    role,
    orderIndex,
    text,
    textHash: `${id}-hash`,
    textPreview: text.slice(0, 80),
    schemaVersion: 1,
    createdAt: "2026-05-12T00:00:00.000Z"
  };
}

function createScanResult(history: ScanMessagesResult["history"]): ScanMessagesResult {
  const user = createMessage("user-1", "user", "Question", 0);
  const assistant = createMessage("assistant-1", "assistant", "Answer", 1);

  return {
    messages: [user, assistant],
    sources: [],
    history
  };
}

test("controller surfaces a restored idle notice after hydrating a saved conversation", async () => {
  installWindowTimers();
  const conversation = createConversation("/c/restored");
  const restored = createDocument(conversation);
  const notices: Array<string | undefined> = [];
  const statuses: string[] = [];
  let currentDocument: ThinkingDocument | undefined;

  const controller = createSidepanelSessionController({
    autoGenerate: false,
    store: {
      async hydrate() {
        currentDocument = restored;
      },
      getDocument() {
        return currentDocument;
      },
      async replaceDocument(document) {
        currentDocument = document;
      },
      setNotice(notice) {
        notices.push(notice);
      },
      setStatus(status) {
        statuses.push(status);
      }
    },
    runtime: {
      async closeSidePanel() {},
      async fetchActiveChatContext() {
        return {
          conversation,
          completion: {
            latestMessageRole: null,
            completionKey: null,
            isStreaming: false
          }
        };
      },
      async scanActiveChat() {
        throw new Error("scanActiveChat should not run in this test");
      },
      subscribeToActiveHostChanges() {
        return () => undefined;
      },
      subscribeToSettledMessages() {
        return () => undefined;
      }
    }
  });

  controller.start();
  await flushMicrotasks();
  controller.dispose();

  assert.equal(notices.at(-1), "Restored saved map for this conversation. Refresh after more history loads if source links still need recovery.");
  assert.equal(statuses.at(-1), "synced");
});

test("controller preserves a restored document and reports partial-history recovery honestly", async () => {
  installWindowTimers();
  const conversation = createConversation("/c/partial");
  const restored = createDocument(conversation);
  const notices: Array<string | undefined> = [];
  const statuses: string[] = [];
  let currentDocument: ThinkingDocument | undefined = restored;
  let replaceCalls = 0;

  const controller = createSidepanelSessionController({
    autoGenerate: false,
    store: {
      async hydrate() {},
      getDocument() {
        return currentDocument;
      },
      async replaceDocument(document) {
        replaceCalls += 1;
        currentDocument = document;
      },
      setNotice(notice) {
        notices.push(notice);
      },
      setStatus(status) {
        statuses.push(status);
      }
    },
    runtime: {
      async closeSidePanel() {},
      async fetchActiveChatContext() {
        return {
          conversation,
          completion: {
            latestMessageRole: null,
            completionKey: null,
            isStreaming: false
          }
        };
      },
      async scanActiveChat() {
        return createScanResult({
          coverage: "partial",
          reason: "restored-gap",
          visibleMessageCount: 2,
          matchedPersistedMessageCount: 1,
          missingPersistedMessageCount: 1
        });
      },
      subscribeToActiveHostChanges() {
        return () => undefined;
      },
      subscribeToSettledMessages() {
        return () => undefined;
      }
    }
  });

  controller.start();
  await flushMicrotasks();
  await controller.regenerate("manual");
  controller.dispose();

  assert.equal(replaceCalls, 0);
  assert.equal(currentDocument, restored);
  assert.equal(statuses.at(-1), "synced");
  assert.equal(
    notices.at(-1),
    "Refresh skipped because only part of this conversation is visible right now. The saved map remains unchanged."
  );
});

test("controller distinguishes a successful rebound from a partial-history restore hold", async () => {
  installWindowTimers();
  const conversation = createConversation("/c/rebound");
  const restored = createDocument(conversation);
  const notices: Array<string | undefined> = [];
  let currentDocument: ThinkingDocument | undefined = restored;

  const controller = createSidepanelSessionController({
    autoGenerate: false,
    store: {
      async hydrate() {},
      getDocument() {
        return currentDocument;
      },
      async replaceDocument(document) {
        currentDocument = document;
      },
      setNotice(notice) {
        notices.push(notice);
      },
      setStatus() {}
    },
    runtime: {
      async closeSidePanel() {},
      async fetchActiveChatContext() {
        return {
          conversation,
          completion: {
            latestMessageRole: null,
            completionKey: null,
            isStreaming: false
          }
        };
      },
      async scanActiveChat() {
        return createScanResult({
          coverage: "available",
          reason: null,
          visibleMessageCount: 2,
          matchedPersistedMessageCount: 2,
          missingPersistedMessageCount: 0
        });
      },
      subscribeToActiveHostChanges() {
        return () => undefined;
      },
      subscribeToSettledMessages() {
        return () => undefined;
      }
    }
  });

  controller.start();
  await flushMicrotasks();
  await controller.regenerate("manual");
  controller.dispose();

  assert.ok(currentDocument);
  assert.notEqual(currentDocument, restored);
  assert.equal(notices.at(-1), "Restored map rebound against the currently visible conversation window.");
});
