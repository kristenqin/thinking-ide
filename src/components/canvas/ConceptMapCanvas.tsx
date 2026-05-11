import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { useMemo, useState } from "react";
import type { ConceptMapEdgeRecord } from "../../models/edge";
import type { ConceptMapNodeRecord } from "../../models/node";
import { useThinkingStore } from "../../stores/useThinkingStore";
import { revealSource } from "../../services/sourceLocator";
import { Button } from "../ui/button";
import { ConceptNode } from "./ConceptNode";

const nodeTypes = {
  concept: ConceptNode
};

export function ConceptMapCanvas() {
  const { document, onNodesChange, onEdgesChange, addConnection, renameNode, focusSource } = useThinkingStore();
  const [editingNodeId, setEditingNodeId] = useState<string>();

  const nodes = useMemo<ConceptMapNodeRecord[]>(() => document?.nodes ?? [], [document?.nodes]);
  const edges = useMemo<ConceptMapEdgeRecord[]>(
    () =>
      (document?.edges ?? []).map((edge) => ({
        ...edge,
        animated: edge.data?.status === "draft"
      })),
    [document?.edges]
  );

  if (!document) {
    return <div className="ti-empty">No concept map yet.</div>;
  }

  const selectedNode = document.nodes.find((node) => node.id === editingNodeId);

  return (
    <div className="ti-canvas-shell">
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={addConnection}
        onNodeDoubleClick={(_, node) => setEditingNodeId(node.id)}
      >
        <MiniMap />
        <Controls />
        <Background gap={20} size={1} />
      </ReactFlow>

      {selectedNode ? (
        <div className="ti-floating-panel">
          <label className="ti-label">
            Title
            <input
              className="ti-input"
              defaultValue={selectedNode.data.title}
              onBlur={(event) => renameNode(selectedNode.id, event.currentTarget.value.trim() || selectedNode.data.title)}
            />
          </label>
          <Button
            variant="secondary"
            onClick={() => {
              revealSource(focusSource(selectedNode.data.sourceId ?? ""));
            }}
          >
            Jump to source
          </Button>
          <Button variant="ghost" onClick={() => setEditingNodeId(undefined)}>
            Close
          </Button>
        </div>
      ) : null}
    </div>
  );
}
