import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import { useThinkingStore } from "./useThinkingStore";
import type { ThinkingDocument } from "../models/document";

const documentFixture: ThinkingDocument = {
  conversation: {
    id: "conversation-1",
    sourceUrl: "https://chatgpt.com/c/conversation-1",
    updatedAt: "2026-05-10T00:00:00.000Z"
  },
  messages: [],
  nodes: [],
  edges: [],
  sources: [
    {
      id: "source-1",
      messageId: "assistant-1",
      status: "active",
      anchor: {
        selector: "[data-message]",
        role: "assistant",
        occurrenceIndex: 0,
        previewStart: "start",
        previewEnd: "end"
      }
    }
  ],
  settings: {
    panelMode: "layout",
    panelWidth: 480
  },
  updatedAt: "2026-05-10T00:01:00.000Z"
};

beforeEach(() => {
  useThinkingStore.setState({
    status: "idle",
    error: undefined,
    document: undefined
  });
});

test("setStatus updates the store status and error", () => {
  useThinkingStore.getState().setStatus("error", "load failed");

  const state = useThinkingStore.getState();
  assert.equal(state.status, "error");
  assert.equal(state.error, "load failed");
});

test("focusSource returns a source from the current document", () => {
  useThinkingStore.setState({ document: documentFixture });

  const source = useThinkingStore.getState().focusSource("source-1");

  assert.deepEqual(source, documentFixture.sources[0]);
  assert.deepEqual(useThinkingStore.getState().getDocument(), documentFixture);
});
