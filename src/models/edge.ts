import type { Edge } from "@xyflow/react";

export type EdgeRelationType = "answers" | "contains" | "expands" | "mentions" | "relates";
export type EdgeStatus = "draft" | "confirmed" | "removed";

export type ConceptMapEdgeData = {
  relation: EdgeRelationType;
  status: EdgeStatus;
};

export type ConceptMapEdgeRecord = Edge<ConceptMapEdgeData>;
