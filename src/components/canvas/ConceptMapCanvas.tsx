import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
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
  const {
    document,
    onNodesChange,
    onEdgesChange,
    addConnection,
    renameNode,
    focusSource,
    markSourceLost,
    removeNode,
    removeEdge
  } = useThinkingStore();
  const [editingNodeId, setEditingNodeId] = useState<string>();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>();

  const nodes = useMemo<ConceptMapNodeRecord[]>(
    () => (document?.nodes ?? []).filter((node) => node.data.status !== "removed"),
    [document?.nodes]
  );
  const edges = useMemo<ConceptMapEdgeRecord[]>(
    () =>
      (document?.edges ?? [])
        .filter((edge) => edge.data?.status !== "removed")
        .map((edge) => ({
          ...edge,
          animated: edge.data?.status === "draft"
        })),
    [document?.edges]
  );
  const selectedNode = document?.nodes.find((node) => node.id === editingNodeId);
  const selectedEdge = document?.edges.find(
    (edge) => edge.id === selectedEdgeId && edge.data?.status !== "removed"
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Delete" && event.key !== "Backspace") {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }

      if (editingNodeId) {
        event.preventDefault();
        void removeNode(editingNodeId);
        setEditingNodeId(undefined);
        return;
      }

      if (selectedEdgeId) {
        event.preventDefault();
        void removeEdge(selectedEdgeId);
        setSelectedEdgeId(undefined);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingNodeId, removeEdge, removeNode, selectedEdgeId]);

  if (!document) {
    return <div className="ti-empty">No concept map yet.</div>;
  }

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
        onNodeClick={(_, node) => {
          setEditingNodeId(node.id);
          setSelectedEdgeId(undefined);
        }}
        onPaneClick={() => {
          setEditingNodeId(undefined);
          setSelectedEdgeId(undefined);
        }}
        onEdgeClick={(_, edge) => {
          setSelectedEdgeId(edge.id);
          setEditingNodeId(undefined);
        }}
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
              const sourceId = selectedNode.data.sourceId;
              const source = focusSource(sourceId ?? "");
              const result = revealSource(source);
              if (result === "lost" && sourceId) {
                void markSourceLost(sourceId);
              }
            }}
          >
            Jump to source
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              void removeNode(selectedNode.id);
              setEditingNodeId(undefined);
            }}
          >
            Delete node
          </Button>
          <Button variant="ghost" onClick={() => setEditingNodeId(undefined)}>
            Close
          </Button>
        </div>
      ) : null}

      {selectedEdge ? (
        <div className="ti-floating-panel">
          <div className="ti-label">
            Edge
            <div className="ti-readonly">{selectedEdge.label ?? selectedEdge.data?.relation ?? "relation"}</div>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              void removeEdge(selectedEdge.id);
              setSelectedEdgeId(undefined);
            }}
          >
            Delete edge
          </Button>
          <Button variant="ghost" onClick={() => setSelectedEdgeId(undefined)}>
            Close
          </Button>
        </div>
      ) : null}
    </div>
  );
}
