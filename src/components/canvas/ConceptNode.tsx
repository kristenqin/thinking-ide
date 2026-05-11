import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ConceptMapNodeRecord } from "../../models/node";

export function ConceptNode({ data, selected }: NodeProps<ConceptMapNodeRecord>) {
  return (
    <div className={`ti-node ${selected ? "is-selected" : ""}`} title={data.title}>
      <Handle type="target" position={Position.Left} />
      <div className="ti-node__frame">
        <div className="ti-node__title">{data.title}</div>
        {data.status === "draft" ? <span className="ti-node__draft-dot" aria-hidden="true" /> : null}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
