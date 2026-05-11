import { AlertTriangle } from "lucide-react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { ConceptMapNodeRecord } from "../../models/node";

type ConceptNodeUIData = ConceptMapNodeRecord["data"] & {
  sourceLost?: boolean;
};

type ConceptNodeUIRecord = Node<ConceptNodeUIData, "concept">;

export function ConceptNode({ data, selected }: NodeProps<ConceptNodeUIRecord>) {
  return (
    <div className={`ti-node ${selected ? "is-selected" : ""}`} title={data.title}>
      <Handle type="target" position={Position.Left} />
      <div className="ti-node__frame">
        <div className="ti-node__title">{data.title}</div>
        <div className="ti-node__meta">
          {data.sourceLost ? (
            <span
              className="ti-node__source-lost"
              title="Original source could not be located. The node is still editable."
              aria-label="Original source could not be located. The node is still editable."
            >
              <AlertTriangle size={12} />
            </span>
          ) : null}
          {data.status === "draft" ? <span className="ti-node__draft-dot" aria-hidden="true" /> : null}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
