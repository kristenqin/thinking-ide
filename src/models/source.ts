export type SourceStatus = "active" | "missing";

export type SourceAnchor = {
  selector: string;
  role: "user" | "assistant";
  domId?: string;
  occurrenceIndex: number;
  previewStart: string;
  previewEnd: string;
};

export type SourceRef = {
  id: string;
  messageId: string;
  status: SourceStatus;
  anchor: SourceAnchor;
};
