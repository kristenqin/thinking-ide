import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import { useThinkingStore } from "./useThinkingStore";
import type { ThinkingDocument } from "../models/document";
import { createDefaultSettings } from "../models/settings";

const documentFixture: ThinkingDocument = {
  conversation: {
    id: "conversation-1",
    conversationKey: "conversation-1",
    identitySource: "url-path",
    sourceUrl: "https://chatgpt.com/c/conversation-1",
    updatedAt: "2026-05-10T00:00:00.000Z"
  },
  messages: [],
  nodes: [
    {
      id: "node-1",
      type: "concept",
      position: { x: 40, y: 60 },
      data: {
        title: "Question",
        role: "question",
        status: "confirmed",
        sourceId: "source-1"
      }
    }
  ],
  edges: [
    {
      id: "edge-1",
      source: "node-1",
      target: "node-2",
      label: "relates",
      data: {
        relation: "relates",
        status: "draft"
      }
    }
  ],
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
  settings: createDefaultSettings({
    panelWidth: 480,
    updatedAt: "2026-05-10T00:00:00.000Z"
  }),
  updatedAt: "2026-05-10T00:01:00.000Z"
};

beforeEach(() => {
  useThinkingStore.setState({
    status: "ready",
    error: undefined,
    notice: undefined,
    recentAction: undefined,
    document: undefined
  });
});

test("setStatus updates the store status and error", () => {
  useThinkingStore.getState().setStatus("failed", "load failed");

  const state = useThinkingStore.getState();
  assert.equal(state.status, "failed");
  assert.equal(state.error, "load failed");
});

test("focusSource returns a source from the current document", () => {
  useThinkingStore.setState({ document: documentFixture });

  const source = useThinkingStore.getState().focusSource("source-1");

  assert.deepEqual(source, documentFixture.sources[0]);
  assert.deepEqual(useThinkingStore.getState().getDocument(), documentFixture);
});

test("removeNode marks the node and related edges as removed and can undo once", async () => {
  useThinkingStore.setState({
    document: {
      ...documentFixture,
      nodes: [
        documentFixture.nodes[0],
        {
          id: "node-2",
          type: "concept",
          position: { x: 200, y: 60 },
          data: {
            title: "Concept",
            role: "concept",
            status: "confirmed",
            sourceId: "source-1"
          }
        }
      ]
    }
  });

  await useThinkingStore.getState().removeNode("node-1");

  let state = useThinkingStore.getState();
  assert.equal(state.document?.nodes[0]?.data.status, "removed");
  assert.equal(state.document?.edges[0]?.data?.status, "removed");
  assert.equal(state.notice, "Node deleted.");
  assert.equal(state.recentAction?.type, "remove_node");

  await useThinkingStore.getState().undoLastRemoval();
  state = useThinkingStore.getState();
  assert.equal(state.document?.nodes[0]?.data.status, "confirmed");
  assert.equal(state.document?.edges[0]?.data?.status, "draft");
  assert.equal(state.notice, "Deletion undone.");
  assert.equal(state.recentAction, undefined);
});

test("markSourceLost updates the source status and preserves the node", async () => {
  useThinkingStore.setState({ document: documentFixture });

  await useThinkingStore.getState().markSourceLost("source-1");

  const state = useThinkingStore.getState();
  assert.equal(state.document?.sources[0]?.status, "lost");
  assert.equal(state.document?.nodes[0]?.data.status, "confirmed");
  assert.equal(
    state.notice,
    "Original chat location is unavailable, but the node is still editable."
  );
});

test("updateEdgeRelation changes the relation label and keeps the edge editable", async () => {
  useThinkingStore.setState({ document: documentFixture });

  await useThinkingStore.getState().updateEdgeRelation("edge-1", "contains");

  const state = useThinkingStore.getState();
  assert.equal(state.document?.edges[0]?.label, "contains");
  assert.equal(state.document?.edges[0]?.data?.relation, "contains");
  assert.equal(state.document?.edges[0]?.data?.status, "draft");
});

test("updateNodeRole changes the node role", async () => {
  useThinkingStore.setState({ document: documentFixture });

  await useThinkingStore.getState().updateNodeRole("node-1", "answer_outline");

  const state = useThinkingStore.getState();
  assert.equal(state.document?.nodes[0]?.data.role, "answer_outline");
});

test("setAutoGenerate updates the stored setting", async () => {
  useThinkingStore.setState({ document: documentFixture });

  await useThinkingStore.getState().setAutoGenerate(false);

  const state = useThinkingStore.getState();
  assert.equal(state.document?.settings.autoGenerate, false);
});

test("clearCurrentMap clears the current conversation document", async () => {
  useThinkingStore.setState({ document: documentFixture, status: "synced" });

  await useThinkingStore.getState().clearCurrentMap();

  const state = useThinkingStore.getState();
  assert.equal(state.document, undefined);
  assert.equal(state.notice, "Current map cleared.");
  assert.equal(state.status, "ready");
});
