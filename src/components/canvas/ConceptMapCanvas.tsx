import {
  Background,
  Controls,
  MiniMap,
  NodeToolbar,
  Position,
  ReactFlow,
  type ReactFlowInstance
} from "@xyflow/react";
import { AlertTriangle, Ellipsis, FileText, Link2, PencilLine, RefreshCcw, Shapes, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ConceptMapEdgeRecord, EdgeRelationType } from "../../models/edge";
import type { ConceptMapNodeRecord, NodeRole } from "../../models/node";
import { useThinkingStore } from "../../stores/useThinkingStore";
import { revealSourceInActiveChat } from "../../services/activeChatRuntime";
import { Button } from "../ui/button";
import { ConceptNode } from "./ConceptNode";

const nodeTypes = {
  concept: ConceptNode
};

const relationOptions: EdgeRelationType[] = ["relates", "answers", "contains", "expands", "mentions"];

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
    updateNodeRole,
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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showPropertiesForNodeId, setShowPropertiesForNodeId] = useState<string>();
  const renameCardRef = useRef<HTMLDivElement>(null);
  const reactFlowRef = useRef<ReactFlowInstance<ConceptMapNodeRecord, ConceptMapEdgeRecord> | null>(null);
  const autoFramedConversationIdRef = useRef<string | undefined>(undefined);
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
  const propertiesNode = document?.nodes.find(
    (node) => node.id === showPropertiesForNodeId && node.data.status !== "removed"
  );

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
        setIsMoreMenuOpen(false);
        setShowPropertiesForNodeId(undefined);
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

  function fitCanvasToContent(duration = 220) {
    const instance = reactFlowRef.current;
    if (!instance || nodes.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void instance.fitView({
          padding: 0.18,
          duration,
          minZoom: 0.55,
          maxZoom: 1.15
        });
      });
    });
  }

  useEffect(() => {
    if (!document || nodes.length === 0) {
      return;
    }

    if (autoFramedConversationIdRef.current === document.conversation.id) {
      return;
    }

    autoFramedConversationIdRef.current = document.conversation.id;
    fitCanvasToContent(0);
  }, [document, nodes.length]);

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
      ? "Relation selected"
      : selectedNodeSourceLost
        ? "Source needs review"
        : undefined;
  const workspaceDetail = selectedNode
    ? selectedNodeSourceLost
      ? "This node still edits normally, but its original source needs review."
      : "Use the floating toolbar to rename, connect, jump to source, or remove this node."
    : selectedEdge
      ? "Adjust the relation meaning here without leaving the canvas."
      : selectedNodeSourceLost
        ? sourceLostTooltip()
        : undefined;
  const showCanvasChrome = Boolean(workspaceHeadline && workspaceDetail);

  return (
    <div className="ti-canvas-shell">
      {showCanvasChrome ? (
        <div className="ti-canvas-chrome">
          <div className="ti-canvas-chrome__copy">
            <div className="ti-canvas-chrome__eyebrow">
              {selectedNode ? "Selected node" : selectedEdge ? "Selected relation" : "Source review"}
            </div>
            <h3>{workspaceHeadline}</h3>
            <p>{workspaceDetail}</p>
          </div>
        </div>
      ) : null}
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          reactFlowRef.current = instance;
          if (document && nodes.length > 0) {
            fitCanvasToContent(0);
          }
        }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={addConnection}
        onNodeDoubleClick={(_, node) => {
          setSelectedNodeId(node.id);
          setSelectedEdgeId(undefined);
          setRenamingNodeId(node.id);
          setIsMoreMenuOpen(false);
        }}
        onNodeClick={(_, node) => {
          setSelectedNodeId(node.id);
          setSelectedEdgeId(undefined);
          setIsMoreMenuOpen(false);
        }}
        onPaneClick={() => {
          setSelectedNodeId(undefined);
          setRenamingNodeId(undefined);
          setSelectedEdgeId(undefined);
          setIsMoreMenuOpen(false);
          setShowPropertiesForNodeId(undefined);
        }}
        onEdgeClick={(_, edge) => {
          setSelectedEdgeId(edge.id);
          setSelectedNodeId(undefined);
          setRenamingNodeId(undefined);
          setIsMoreMenuOpen(false);
          setShowPropertiesForNodeId(undefined);
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
                  onClick={async () => {
                    const sourceId = selectedNode.data.sourceId;
                    const source = focusSource(sourceId ?? "");
                    const result = await revealSourceInActiveChat(source);
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
                    setIsMoreMenuOpen(false);
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  className="ti-node-toolbar__button"
                  onClick={() => setIsMoreMenuOpen((open) => !open)}
                >
                  <Ellipsis size={14} />
                  More
                </Button>
              </div>
              {isMoreMenuOpen ? (
                <div className="ti-node-toolbar__menu" role="menu" aria-label="Node actions">
                  {selectedNode.data.role !== "concept" ? (
                    <Button
                      variant="ghost"
                      className="ti-node-toolbar__menu-item"
                      onClick={() => {
                        void updateNodeRole(selectedNode.id, "concept");
                        setIsMoreMenuOpen(false);
                      }}
                    >
                      <Shapes size={14} />
                      Convert to Concept
                    </Button>
                  ) : null}
                  {selectedNode.data.role !== "claim" ? (
                    <Button
                      variant="ghost"
                      className="ti-node-toolbar__menu-item"
                      onClick={() => {
                        void updateNodeRole(selectedNode.id, "claim");
                        setIsMoreMenuOpen(false);
                      }}
                    >
                      <Shapes size={14} />
                      Convert to Claim
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    className="ti-node-toolbar__menu-item"
                    onClick={() => {
                      setShowPropertiesForNodeId(selectedNode.id);
                      setIsMoreMenuOpen(false);
                    }}
                  >
                    <FileText size={14} />
                    View properties
                  </Button>
                  <Button
                    variant="ghost"
                    className="ti-node-toolbar__menu-item ti-node-toolbar__menu-item--danger"
                    onClick={() => {
                      void removeNode(selectedNode.id);
                      setSelectedNodeId(undefined);
                      setShowPropertiesForNodeId(undefined);
                      setIsMoreMenuOpen(false);
                    }}
                  >
                    <Trash2 size={14} />
                    Delete node
                  </Button>
                </div>
              ) : null}
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

      <div className="ti-canvas-utility">
        <Button
          variant="ghost"
          className="ti-canvas-utility__button"
          onClick={() => fitCanvasToContent()}
        >
          <RefreshCcw size={14} />
          Reset view
        </Button>
      </div>

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

      {propertiesNode ? (
        <div className="ti-floating-card ti-floating-card--properties">
          <div className="ti-floating-card__eyebrow">Node properties</div>
          <div className="ti-property-list">
            <div className="ti-property-list__row">
              <span>Title</span>
              <strong>{propertiesNode.data.title}</strong>
            </div>
            <div className="ti-property-list__row">
              <span>Role</span>
              <strong>{formatNodeRole(propertiesNode.data.role)}</strong>
            </div>
            <div className="ti-property-list__row">
              <span>Status</span>
              <strong>{propertiesNode.data.status}</strong>
            </div>
            <div className="ti-property-list__row">
              <span>Source</span>
              <strong>{propertiesNode.data.sourceId ? (sourceStatusById.get(propertiesNode.data.sourceId) === "lost" ? "Needs review" : "Linked") : "None"}</strong>
            </div>
          </div>
          <div className="ti-floating-card__meta">Low-frequency node details stay out of the primary canvas view.</div>
          <div className="ti-floating-card__actions">
            <Button variant="ghost" onClick={() => setShowPropertiesForNodeId(undefined)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatNodeRole(role: NodeRole): string {
  if (role === "claim") {
    return "Claim";
  }

  if (role === "question") {
    return "Question";
  }

  if (role === "answer") {
    return "Answer";
  }

  if (role === "answer_outline") {
    return "Answer outline";
  }

  return "Concept";
}
