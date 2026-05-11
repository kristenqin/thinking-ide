import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ConceptMapNodeRecord } from "../../models/node";

export function ConceptNode({ data, selected }: NodeProps<ConceptMapNodeRecord>) {
  return (
    <div className={`ti-node ${selected ? "is-selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="ti-node__role">{data.role}</div>
      <div className="ti-node__title">{data.title}</div>
      {data.summary ? <div className="ti-node__summary">{data.summary}</div> : null}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
