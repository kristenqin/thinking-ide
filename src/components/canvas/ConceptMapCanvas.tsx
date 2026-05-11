import { Background, Controls, MiniMap, NodeToolbar, Position, ReactFlow } from "@xyflow/react";
import { AlertTriangle, Link2, PencilLine, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ConceptMapEdgeRecord, EdgeRelationType } from "../../models/edge";
import type { ConceptMapNodeRecord } from "../../models/node";
import { useThinkingStore } from "../../stores/useThinkingStore";
import { revealSource } from "../../services/sourceLocator";
import { Button } from "../ui/button";
import { ConceptNode } from "./ConceptNode";

const nodeTypes = {
  concept: ConceptNode
};

const relationOptions: EdgeRelationType[] = ["relates", "answers", "expands"];

function sourceLostTooltip(copy?: string) {
  return copy ?? "Original source could not be located. The node is still editable.";
}

export function ConceptMapCanvas() {
  const {
    document,
    onNodesChange,
    onEdgesChange,
    addConnection,
    renameNode,
    updateEdgeRelation,
    focusSource,
    markSourceLost,
    removeNode,
    removeEdge
  } = useThinkingStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [renamingNodeId, setRenamingNodeId] = useState<string>();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>();
  const [draftTitle, setDraftTitle] = useState("");
  const [canvasHint, setCanvasHint] = useState<string>();
  const renameCardRef = useRef<HTMLDivElement>(null);
  const sourceStatusById = useMemo(
    () => new Map((document?.sources ?? []).map((source) => [source.id, source.status])),
    [document?.sources]
  );

  const nodes = useMemo<ConceptMapNodeRecord[]>(
    () =>
      (document?.nodes ?? [])
        .filter((node) => node.data.status !== "removed")
        .map((node) => ({
          ...node,
          data: {
            ...node.data,
            sourceLost: node.data.sourceId ? sourceStatusById.get(node.data.sourceId) === "lost" : false
          }
        })),
    [document?.nodes, sourceStatusById]
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
  const activeNodeCount = nodes.length;
  const activeEdgeCount = edges.length;
  const selectedNode = document?.nodes.find(
    (node) => node.id === selectedNodeId && node.data.status !== "removed"
  );
  const selectedNodeSourceLost = selectedNode?.data.sourceId
    ? sourceStatusById.get(selectedNode.data.sourceId) === "lost"
    : false;
  const selectedEdge = document?.edges.find(
    (edge) => edge.id === selectedEdgeId && edge.data?.status !== "removed"
  );
  const isRenaming = Boolean(renamingNodeId && selectedNode?.id === renamingNodeId);

  useEffect(() => {
    if (selectedNode) {
      setDraftTitle(selectedNode.data.title);
      return;
    }

    setDraftTitle("");
    setRenamingNodeId(undefined);
  }, [selectedNode?.data.title, selectedNode?.id]);

  async function commitRename() {
    if (!selectedNode || !isRenaming) {
      return;
    }

    const nextTitle = draftTitle.trim();
    if (!nextTitle) {
      return;
    }

    if (nextTitle !== selectedNode.data.title) {
      await renameNode(selectedNode.id, nextTitle);
    }

    setRenamingNodeId(undefined);
  }

  function cancelRename() {
    setDraftTitle(selectedNode?.data.title ?? "");
    setRenamingNodeId(undefined);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isRenaming) {
        event.preventDefault();
        cancelRename();
        return;
      }

      if (event.key === "Enter" && isRenaming) {
        event.preventDefault();
        void commitRename();
        return;
      }

      if (event.key !== "Delete" && event.key !== "Backspace") {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }

      if (selectedNodeId) {
        event.preventDefault();
        void removeNode(selectedNodeId);
        setSelectedNodeId(undefined);
        setRenamingNodeId(undefined);
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
  }, [commitRename, isRenaming, removeEdge, removeNode, selectedEdgeId, selectedNodeId]);

  useEffect(() => {
    if (!isRenaming) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (renameCardRef.current?.contains(target)) {
        return;
      }

      void commitRename();
    }

    window.addEventListener("pointerdown", handlePointerDown, true);
    return () => window.removeEventListener("pointerdown", handlePointerDown, true);
  }, [commitRename, isRenaming]);

  useEffect(() => {
    if (!canvasHint) {
      return;
    }

    const timeout = window.setTimeout(() => setCanvasHint(undefined), 2600);
    return () => window.clearTimeout(timeout);
  }, [canvasHint]);

  if (!document) {
    return (
      <div className="ti-empty-state">
        <div className="ti-empty-state__eyebrow">Workspace ready</div>
        <h2>Start a chat to grow the map.</h2>
        <p>Once the conversation begins, Thinking IDE will draft a concept map here for you to refine.</p>
        <ul className="ti-empty-state__list">
          <li>Review AI-generated concepts and connections.</li>
          <li>Drag, rename, connect, and remove nodes directly on the canvas.</li>
          <li>Jump back to source messages only when you need the original context.</li>
        </ul>
      </div>
    );
  }

  const workspaceHeadline = selectedNode
    ? selectedNode.data.title
    : selectedEdge
      ? selectedEdge.data?.relation ?? "Relation"
      : "Concept map draft";
  const workspaceDetail = selectedNode
    ? selectedNodeSourceLost
      ? "This node still edits normally, but its original source needs review."
      : "Selected node. Use the floating toolbar for rename, source jump, connect, or delete."
    : selectedEdge
      ? "Selected relation. Adjust its meaning here without leaving the canvas."
      : "Directly arrange concepts on the canvas, then jump back to source only when you need context.";

  return (
    <div className="ti-canvas-shell">
      <div className="ti-canvas-chrome">
        <div className="ti-canvas-chrome__copy">
          <div className="ti-canvas-chrome__eyebrow">Concept map canvas</div>
          <h3>{workspaceHeadline}</h3>
          <p>{workspaceDetail}</p>
        </div>
        <div className="ti-canvas-chrome__meta">
          <div className="ti-canvas-chip">{activeNodeCount} concepts</div>
          <div className="ti-canvas-chip">{activeEdgeCount} links</div>
          {selectedNodeSourceLost ? <div className="ti-canvas-chip ti-canvas-chip--warning">Source needs review</div> : null}
        </div>
      </div>
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={addConnection}
        onNodeDoubleClick={(_, node) => {
          setSelectedNodeId(node.id);
          setSelectedEdgeId(undefined);
          setRenamingNodeId(node.id);
        }}
        onNodeClick={(_, node) => {
          setSelectedNodeId(node.id);
          setSelectedEdgeId(undefined);
        }}
        onPaneClick={() => {
          setSelectedNodeId(undefined);
          setRenamingNodeId(undefined);
          setSelectedEdgeId(undefined);
        }}
        onEdgeClick={(_, edge) => {
          setSelectedEdgeId(edge.id);
          setSelectedNodeId(undefined);
          setRenamingNodeId(undefined);
        }}
        minZoom={0.5}
        maxZoom={1.6}
      >
        {selectedNode ? (
          <NodeToolbar
            nodeId={selectedNode.id}
            isVisible={!isRenaming}
            offset={14}
            position={selectedNode.position.y < 120 ? Position.Bottom : Position.Top}
          >
            <div className="ti-node-toolbar">
              <div className="ti-node-toolbar__actions">
                <Button
                  variant="ghost"
                  className="ti-node-toolbar__button"
                  onClick={() => setRenamingNodeId(selectedNode.id)}
                >
                  <PencilLine size={14} />
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  className={`ti-node-toolbar__button ${selectedNodeSourceLost ? "ti-node-toolbar__button--warning" : ""}`}
                  title={selectedNodeSourceLost ? sourceLostTooltip() : undefined}
                  onClick={() => {
                    const sourceId = selectedNode.data.sourceId;
                    const source = focusSource(sourceId ?? "");
                    const result = revealSource(source);
                    if (result === "lost" && sourceId) {
                      void markSourceLost(sourceId);
                    }
                  }}
                >
                  {selectedNodeSourceLost ? <AlertTriangle size={14} /> : <RefreshCcw size={14} />}
                  Source
                </Button>
                <Button
                  variant="ghost"
                  className="ti-node-toolbar__button"
                  onClick={() => setCanvasHint("Drag from a node handle to create a new connection.")}
                >
                  <Link2 size={14} />
                  Connect
                </Button>
                <Button
                  variant="ghost"
                  className="ti-node-toolbar__button ti-node-toolbar__button--danger"
                  onClick={() => {
                    void removeNode(selectedNode.id);
                    setSelectedNodeId(undefined);
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
              {selectedNodeSourceLost ? (
                <div className="ti-node-toolbar__hint" role="note">
                  <AlertTriangle size={12} />
                  <span>{sourceLostTooltip()}</span>
                </div>
              ) : null}
            </div>
          </NodeToolbar>
        ) : null}
        <MiniMap pannable zoomable />
        <Controls />
        <Background gap={20} size={1} />
      </ReactFlow>

      {canvasHint ? <div className="ti-canvas-hint">{canvasHint}</div> : null}

      {selectedNode && isRenaming ? (
        <div className="ti-floating-card ti-floating-card--editor" ref={renameCardRef}>
          <div className="ti-floating-card__eyebrow">Rename node</div>
          <label className="ti-label" htmlFor="ti-node-title-input">
            Title
            <input
              id="ti-node-title-input"
              className="ti-input"
              autoFocus
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.currentTarget.value)}
            />
          </label>
          <div className="ti-floating-card__meta">Press Enter to save or Esc to cancel.</div>
          <div className="ti-floating-card__actions">
            <Button variant="secondary" onClick={() => void commitRename()} disabled={!draftTitle.trim()}>
              Save
            </Button>
            <Button variant="ghost" onClick={cancelRename}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {selectedEdge ? (
        <div className="ti-floating-card ti-floating-card--edge">
          <div className="ti-floating-card__eyebrow">Edge selected</div>
          <label className="ti-label" htmlFor="ti-edge-relation">
            Relation
            <select
              id="ti-edge-relation"
              className="ti-input"
              value={selectedEdge.data?.relation ?? "relates"}
              onChange={(event) => {
                void updateEdgeRelation(
                  selectedEdge.id,
                  event.currentTarget.value as EdgeRelationType
                );
              }}
            >
              {relationOptions.map((relation) => (
                <option key={relation} value={relation}>
                  {relation}
                </option>
              ))}
            </select>
          </label>
          <div className="ti-floating-card__meta">Refine the meaning here, or press Delete to remove the connection.</div>
          <div className="ti-floating-card__actions">
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
        </div>
      ) : null}
    </div>
  );
}
