export type SourceStatus = "active" | "missing";

export type SourceAnchor = {
  selector: string;
  previewText: string;
};

export type SourceRef = {
  id: string;
  messageId: string;
  status: SourceStatus;
  anchor: SourceAnchor;
};
