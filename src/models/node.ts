import type { Node } from "@xyflow/react";

export type NodeRole = "question" | "answer" | "answer_outline" | "concept" | "claim";
export type NodeStatus = "draft" | "confirmed" | "removed";

export type ConceptMapNodeData = {
  title: string;
  summary?: string;
  role: NodeRole;
  status: NodeStatus;
  sourceId?: string;
};

export type ConceptMapNodeRecord = Node<ConceptMapNodeData, "concept">;
