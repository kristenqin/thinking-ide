import type { Node } from "@xyflow/react";

export type NodeRole = "question" | "answer" | "concept";
export type NodeStatus = "draft" | "confirmed";

export type ConceptMapNodeData = {
  title: string;
  summary?: string;
  role: NodeRole;
  status: NodeStatus;
  sourceId?: string;
};

export type ConceptMapNodeRecord = Node<ConceptMapNodeData, "concept">;
