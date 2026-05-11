import assert from "node:assert/strict";
import test from "node:test";
import { buildThinkingDocument } from "./documentBuilder";
import type { ThinkingDocument } from "../models/document";
import type { ConceptMapEdgeRecord, EdgeRelationType } from "../models/edge";
import type { MessageRef } from "../models/messageRef";
import type { ConceptMapNodeRecord } from "../models/node";
import type { SourceRef } from "../models/source";
import type { UserSettings } from "../models/settings";

const conversation = {
  id: "conversation-1",
  title: "Runtime spine",
  sourceUrl: "https://chatgpt.com/c/conversation-1",
  updatedAt: "2026-05-10T00:00:00.000Z"
};

const messages: MessageRef[] = [
  {
    id: "user-1",
    role: "user",
    text: "How should the panel recover after refresh?",
    createdAt: "2026-05-10T00:00:00.000Z"
  },
  {
    id: "assistant-1",
    role: "assistant",
    text: "It should reload the saved document and keep manual edits.",
    createdAt: "2026-05-10T00:01:00.000Z"
  }
];

const sources: SourceRef[] = [
  {
    id: "source-1",
    messageId: "assistant-1",
    status: "active",
    anchor: {
      selector: "[data-message]",
      role: "assistant",
      occurrenceIndex: 0,
      previewStart: "It should reload",
      previewEnd: "manual edits."
    }
  }
];

const defaultSettings: UserSettings = {
  panelMode: "layout",
  panelWidth: 480
};

function createNode(
  id: string,
  role: ConceptMapNodeRecord["data"]["role"],
  title: string,
  sourceId?: string
): ConceptMapNodeRecord {
  return {
    id,
    type: "concept",
    position: { x: 100, y: 100 },
    data: {
      title,
      summary: title,
      role,
      status: "confirmed",
      sourceId
    }
  };
}

function createEdge(
  id: string,
  source: string,
  target: string,
  relation: EdgeRelationType
): ConceptMapEdgeRecord {
  return {
    id,
    source,
    target,
    label: relation,
    data: {
      relation,
      status: relation === "relates" ? "draft" : "confirmed"
    }
  };
}

test("buildThinkingDocument keeps generated data unchanged when there is no previous document", () => {
  const generatedNodes = [
    createNode("node-question", "question", "Refresh behavior"),
    createNode("node-answer", "answer", "Restore from storage", "source-1")
  ];
  const generatedEdges = [createEdge("edge-1", "node-question", "node-answer", "answers")];

  const document = buildThinkingDocument({
    conversation,
    messages,
    sources,
    generatedNodes,
    generatedEdges,
    settings: defaultSettings
  });

  assert.deepEqual(document.nodes, generatedNodes);
  assert.deepEqual(document.edges, generatedEdges);
  assert.deepEqual(document.settings, defaultSettings);
  assert.deepEqual(document.messages, messages);
  assert.deepEqual(document.sources, sources);
  assert.match(document.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.match(document.conversation.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("buildThinkingDocument preserves manual node edits, settings, and manual relates edges", () => {
  const generatedNodes = [
    createNode("generated-question", "question", "Refresh behavior"),
    createNode("generated-answer", "answer", "Restore from storage", "source-1"),
    createNode("generated-concept", "concept", "Keep manual positions", "source-1")
  ];
  const generatedEdges = [
    createEdge("generated-answers", "generated-question", "generated-answer", "answers"),
    createEdge("generated-expands", "generated-answer", "generated-concept", "expands")
  ];
  const previous: ThinkingDocument = {
    conversation,
    messages,
    sources,
    nodes: [
      {
        ...createNode("manual-question", "question", "Refresh behavior"),
        position: { x: 48, y: 80 }
      },
      {
        ...createNode("manual-answer", "answer", "Restore from storage", "source-1"),
        position: { x: 320, y: 80 }
      },
      {
        ...createNode("manual-concept", "concept", "Keep manual positions", "source-1"),
        position: { x: 640, y: 160 },
        data: {
          ...createNode("manual-concept", "concept", "Keep manual positions", "source-1").data,
          title: "Keep manual positions",
          status: "confirmed"
        }
      }
    ],
    edges: [
      createEdge("manual-relates", "manual-question", "manual-concept", "relates")
    ],
    settings: {
      panelMode: "overlay",
      panelWidth: 420
    },
    updatedAt: "2026-05-10T00:02:00.000Z"
  };

  const document = buildThinkingDocument({
    conversation,
    messages,
    sources,
    generatedNodes,
    generatedEdges,
    settings: defaultSettings,
    previous
  });

  assert.deepEqual(
    document.nodes.map((node) => ({
      id: node.id,
      title: node.data.title,
      status: node.data.status,
      position: node.position
    })),
    [
      {
        id: "manual-question",
        title: "Refresh behavior",
        status: "confirmed",
        position: { x: 48, y: 80 }
      },
      {
        id: "manual-answer",
        title: "Restore from storage",
        status: "confirmed",
        position: { x: 320, y: 80 }
      },
      {
        id: "manual-concept",
        title: "Keep manual positions",
        status: "confirmed",
        position: { x: 640, y: 160 }
      }
    ]
  );
  assert.deepEqual(document.settings, previous.settings);
  assert.equal(
    document.edges.some(
      (edge) =>
        edge.data?.relation === "relates" &&
        edge.source === "manual-question" &&
        edge.target === "manual-concept"
    ),
    true
  );
  assert.equal(
    document.edges.some(
      (edge) =>
        edge.data?.relation === "answers" &&
        edge.source === "manual-question" &&
        edge.target === "manual-answer"
    ),
    true
  );
  assert.equal(
    document.edges.some(
      (edge) =>
        edge.data?.relation === "expands" &&
        edge.source === "manual-answer" &&
        edge.target === "manual-concept"
    ),
    true
  );
});

test("buildThinkingDocument preserves user-edited draft edges even when the relation changed", () => {
  const generatedNodes = [
    createNode("generated-question", "question", "Refresh behavior"),
    createNode("generated-answer", "answer", "Restore from storage", "source-1")
  ];
  const generatedEdges = [createEdge("generated-answers", "generated-question", "generated-answer", "answers")];
  const previous: ThinkingDocument = {
    conversation,
    messages,
    sources,
    nodes: [
      {
        ...createNode("manual-question", "question", "Refresh behavior"),
        position: { x: 48, y: 80 }
      },
      {
        ...createNode("manual-answer", "answer", "Restore from storage", "source-1"),
        position: { x: 320, y: 80 }
      }
    ],
    edges: [
      {
        ...createEdge("manual-edge", "manual-question", "manual-answer", "answers"),
        label: "expands",
        data: {
          relation: "expands",
          status: "draft"
        }
      }
    ],
    settings: defaultSettings,
    updatedAt: "2026-05-10T00:02:00.000Z"
  };

  const document = buildThinkingDocument({
    conversation,
    messages,
    sources,
    generatedNodes,
    generatedEdges,
    settings: defaultSettings,
    previous
  });

  assert.equal(
    document.edges.some(
      (edge) =>
        edge.source === "manual-question" &&
        edge.target === "manual-answer" &&
        edge.data?.relation === "expands" &&
        edge.data?.status === "draft"
    ),
    true
  );
  assert.equal(
    document.edges.some(
      (edge) =>
        edge.source === "manual-question" &&
        edge.target === "manual-answer" &&
        edge.data?.relation === "answers"
    ),
    false
  );
});

test("buildThinkingDocument does not revive previously removed generated nodes", () => {
  const previous: ThinkingDocument = {
    conversation,
    messages,
    sources,
    nodes: [
      {
        ...createNode("removed-concept", "concept", "Discarded concept", "source-1"),
        data: {
          ...createNode("removed-concept", "concept", "Discarded concept", "source-1").data,
          status: "removed"
        }
      }
    ],
    edges: [],
    settings: defaultSettings,
    updatedAt: "2026-05-10T00:02:00.000Z"
  };

  const document = buildThinkingDocument({
    conversation,
    messages,
    sources,
    generatedNodes: [createNode("generated-concept", "concept", "Discarded concept", "source-1")],
    generatedEdges: [],
    settings: defaultSettings,
    previous
  });

  assert.deepEqual(document.nodes, []);
});

test("buildThinkingDocument does not suppress sibling concepts when only one matching concept was removed", () => {
  const previous: ThinkingDocument = {
    conversation,
    messages,
    sources,
    nodes: [
      {
        ...createNode("removed-concept", "concept", "Discarded concept", "source-1"),
        data: {
          ...createNode("removed-concept", "concept", "Discarded concept", "source-1").data,
          status: "removed"
        }
      }
    ],
    edges: [],
    settings: defaultSettings,
    updatedAt: "2026-05-10T00:02:00.000Z"
  };

  const document = buildThinkingDocument({
    conversation,
    messages,
    sources,
    generatedNodes: [
      createNode("generated-removed", "concept", "Discarded concept", "source-1"),
      createNode("generated-keep", "concept", "Preserved concept", "source-1")
    ],
    generatedEdges: [],
    settings: defaultSettings,
    previous
  });

  assert.deepEqual(
    document.nodes.map((node) => node.data.title),
    ["Preserved concept"]
  );
});

test("buildThinkingDocument preserves concept identity by title when same-source concepts reorder", () => {
  const previous: ThinkingDocument = {
    conversation,
    messages,
    sources,
    nodes: [
      {
        ...createNode("concept-alpha", "concept", "Alpha concept", "source-1"),
        position: { x: 640, y: 120 }
      },
      {
        ...createNode("concept-beta", "concept", "Beta concept", "source-1"),
        position: { x: 640, y: 260 }
      }
    ],
    edges: [],
    settings: defaultSettings,
    updatedAt: "2026-05-10T00:02:00.000Z"
  };

  const document = buildThinkingDocument({
    conversation,
    messages,
    sources,
    generatedNodes: [
      createNode("generated-beta", "concept", "Beta concept", "source-1"),
      createNode("generated-alpha", "concept", "Alpha concept", "source-1")
    ],
    generatedEdges: [],
    settings: defaultSettings,
    previous
  });

  assert.deepEqual(
    document.nodes.map((node) => ({
      id: node.id,
      title: node.data.title,
      position: node.position
    })),
    [
      {
        id: "concept-beta",
        title: "Beta concept",
        position: { x: 640, y: 260 }
      },
      {
        id: "concept-alpha",
        title: "Alpha concept",
        position: { x: 640, y: 120 }
      }
    ]
  );
});

test("buildThinkingDocument preserves manual role edits during regeneration", () => {
  const previous: ThinkingDocument = {
    conversation,
    messages,
    sources,
    nodes: [
      {
        ...createNode("concept-alpha", "concept", "Alpha concept", "source-1"),
        data: {
          ...createNode("concept-alpha", "concept", "Alpha concept", "source-1").data,
          role: "claim"
        }
      }
    ],
    edges: [],
    settings: defaultSettings,
    updatedAt: "2026-05-10T00:02:00.000Z"
  };

  const document = buildThinkingDocument({
    conversation,
    messages,
    sources,
    generatedNodes: [createNode("generated-alpha", "concept", "Alpha concept", "source-1")],
    generatedEdges: [],
    settings: defaultSettings,
    previous
  });

  assert.equal(document.nodes[0]?.data.role, "claim");
});
