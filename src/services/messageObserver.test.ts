import assert from "node:assert/strict";
import test from "node:test";
import { observeChatMutations, type ChatMutationEvent } from "./messageObserver";
import type { AssistantCompletionState } from "./chatAdapter";

class FakeElement {
  private readonly selectors = new Set<string>();

  constructor(selectors: string[] = []) {
    for (const selector of selectors) {
      this.selectors.add(selector);
    }
  }

  closest(selector: string): FakeElement | null {
    return this.selectors.has(selector) ? this : null;
  }

  matches(selector: string): boolean {
    return this.selectors.has(selector);
  }

  querySelector(selector: string): FakeElement | null {
    return this.selectors.has(selector) ? this : null;
  }
}

class FakeText {
  constructor(public readonly parentElement: FakeElement | null) {}
}

class FakeMutationObserver {
  static instance?: FakeMutationObserver;
  private readonly callback: MutationCallback;

  constructor(callback: MutationCallback) {
    this.callback = callback;
    FakeMutationObserver.instance = this;
  }

  observe(): void {}

  disconnect(): void {}

  emit(mutations: MutationRecord[]) {
    this.callback(mutations, this as unknown as MutationObserver);
  }
}

function flushTimers(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function installObserverEnvironment() {
  Object.defineProperty(globalThis, "HTMLElement", {
    configurable: true,
    value: FakeElement
  });
  Object.defineProperty(globalThis, "Text", {
    configurable: true,
    value: FakeText
  });
  Object.defineProperty(globalThis, "MutationObserver", {
    configurable: true,
    value: FakeMutationObserver
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      body: new FakeElement()
    }
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      setTimeout,
      clearTimeout
    }
  });
}

function createAddedNodeMutation() {
  return {
    type: "childList",
    target: new FakeElement(),
    addedNodes: [new FakeElement(['[data-message-author-role]'])],
    removedNodes: [],
    previousSibling: null,
    nextSibling: null
  } as unknown as MutationRecord;
}

test("observeChatMutations waits while assistant text is still streaming", async () => {
  installObserverEnvironment();
  const events: ChatMutationEvent[] = [];
  const handle = observeChatMutations((event) => events.push(event), {
    debounceMs: 0,
    settleMs: 5,
    getCompletionState: () =>
      ({
        latestMessageRole: "assistant",
        completionKey: "assistant-1:aaaa1111",
        isStreaming: true
      }) satisfies AssistantCompletionState
  });

  FakeMutationObserver.instance?.emit([createAddedNodeMutation()]);
  await flushTimers(10);
  handle.disconnect();

  assert.deepEqual(events, [{ phase: "streaming", completionKey: "assistant-1:aaaa1111" }]);
});

test("observeChatMutations emits a settled event after the assistant output stays stable", async () => {
  installObserverEnvironment();
  const events: ChatMutationEvent[] = [];
  const handle = observeChatMutations((event) => events.push(event), {
    debounceMs: 0,
    settleMs: 5,
    getCompletionState: () =>
      ({
        latestMessageRole: "assistant",
        completionKey: "assistant-2:bbbb2222",
        isStreaming: false
      }) satisfies AssistantCompletionState
  });

  FakeMutationObserver.instance?.emit([createAddedNodeMutation()]);
  await flushTimers(15);
  handle.disconnect();

  assert.deepEqual(events, [{ phase: "settled", completionKey: "assistant-2:bbbb2222" }]);
});

test("observeChatMutations suppresses duplicate settled events for the same completed assistant reply", async () => {
  installObserverEnvironment();
  const events: ChatMutationEvent[] = [];
  const handle = observeChatMutations((event) => events.push(event), {
    debounceMs: 0,
    settleMs: 5,
    getCompletionState: () =>
      ({
        latestMessageRole: "assistant",
        completionKey: "assistant-3:cccc3333",
        isStreaming: false
      }) satisfies AssistantCompletionState
  });

  FakeMutationObserver.instance?.emit([createAddedNodeMutation()]);
  await flushTimers(15);
  FakeMutationObserver.instance?.emit([createAddedNodeMutation()]);
  await flushTimers(15);
  handle.disconnect();

  assert.deepEqual(events, [{ phase: "settled", completionKey: "assistant-3:cccc3333" }]);
});

test("observeChatMutations can release a settled completion key so the same reply may trigger again later", async () => {
  installObserverEnvironment();
  const events: ChatMutationEvent[] = [];
  const handle = observeChatMutations((event) => events.push(event), {
    debounceMs: 0,
    settleMs: 5,
    getCompletionState: () =>
      ({
        latestMessageRole: "assistant",
        completionKey: "assistant-4:dddd4444",
        isStreaming: false
      }) satisfies AssistantCompletionState
  });

  FakeMutationObserver.instance?.emit([createAddedNodeMutation()]);
  await flushTimers(15);
  handle.resetCompletionDedup("assistant-4:dddd4444");
  FakeMutationObserver.instance?.emit([createAddedNodeMutation()]);
  await flushTimers(15);
  handle.disconnect();

  assert.deepEqual(events, [
    { phase: "settled", completionKey: "assistant-4:dddd4444" },
    { phase: "settled", completionKey: "assistant-4:dddd4444" }
  ]);
});
