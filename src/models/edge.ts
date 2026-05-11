import type { Edge } from "@xyflow/react";

export type EdgeRelationType = "answers" | "expands" | "relates";
export type EdgeStatus = "draft" | "confirmed";

export type ConceptMapEdgeData = {
  relation: EdgeRelationType;
  status: EdgeStatus;
};

export type ConceptMapEdgeRecord = Edge<ConceptMapEdgeData>;
