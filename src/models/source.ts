export type SourceStatus = "active" | "lost";

export type SourceAnchor = {
  type: "message" | "heading";
  selector: string;
  role: "user" | "assistant";
  domId?: string;
  occurrenceIndex: number;
  previewStart: string;
  previewEnd: string;
  headingText?: string;
  headingLevel?: number;
};

export type SourceRef = {
  id: string;
  messageId: string;
  status: SourceStatus;
  anchor: SourceAnchor;
};
