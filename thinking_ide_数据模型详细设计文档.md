# Thinking IDE 数据模型详细设计文档

## 1. 文档信息

| 字段 | 内容 |
|---|---|
| 产品名称 | Thinking IDE |
| 文档类型 | Data Model Spec / 数据模型详细设计文档 |
| 版本 | v0.1 |
| 阶段 | MVP |
| 产品形态 | 官方 AI Chat 页面右侧 Concept Map 插件 |
| 存储方案 | IndexedDB / Dexie |

## 2. 文档目标

本文档用于定义 Thinking IDE MVP 的核心数据模型、数据边界、实体结构、状态流转、持久化策略和刷新恢复规则。

本文档需要回答：

1. Thinking IDE 长期保存什么数据。
2. Thinking IDE 不长期保存什么数据。
3. 节点、关系、来源引用如何建模。
4. 页面刷新后如何恢复 Concept Map。
5. 重新解析时如何保护用户编辑结果。
6. IndexedDB 需要哪些表结构。
7. 删除、撤销、source_lost、重复节点如何处理。

## 3. 数据设计原则

### 3.1 不长期存储完整问答原文

Thinking IDE 不长期存储：

1. 用户完整提问。
2. AI 完整回答。
3. 官方 Chat 完整历史。

这些内容属于官方 Chat 页面原始数据。

Thinking IDE 可以在结构化生成时临时读取当前轮问答文本，但长期只保存索引、节点、关系和定位引用。

### 3.2 长期存储 Concept Map 数据

Thinking IDE 长期存储：

1. ConversationRef
2. MessageRef
3. SourceRef
4. ConceptMapNode
5. ConceptMapEdge
6. NodeLayout
7. UserSettings
8. 用户编辑结果
9. source_lost 状态

### 3.3 Node 统一抽象

问题、回答、回答结构项、概念、观点、结论、待办都统一抽象为 Node。

不拆分为：

```text
QuestionNode
AnswerNode
ConceptNode
OutlineNode
```

统一使用：

```text
ConceptMapNode
```

节点差异通过 roles 表达。

### 3.4 Edge 统一抽象

所有节点之间的关系统一抽象为 Edge。

包括：

1. question → answer
2. answer → answer_outline
3. question / answer → concept
4. question → next question
5. concept → concept

统一使用：

```text
ConceptMapEdge
```

### 3.5 用户编辑优先

用户编辑过的字段不被 AI 重新解析覆盖。

包括：

1. 节点标题。
2. 节点布局。
3. 节点角色。
4. 关系类型。
5. 关系名称。
6. 用户手动创建的节点和关系。

### 3.6 逻辑删除优先

删除节点或关系时，不做物理删除。

采用逻辑删除：

```text
status = removed
```

主视图默认过滤 removed 数据。

这样可以支持：

1. 撤销。
2. 避免重新解析后重复生成用户删除过的节点。
3. 后续版本的回收站或历史记录能力。

### 3.7 source 状态独立建模

节点的业务状态与原文定位状态分开。

例如一个节点可以同时是：

```text
status = edited
sourceStatus = lost
```

因此不使用单独的 source_lost 作为 node status，而是使用：

```text
sourceStatus: valid | lost | unknown
```

## 4. 数据边界

## 4.1 不长期存储的数据

| 数据 | 是否长期存储 | 原因 |
|---|---|---|
| 用户完整提问 | 否 | 属于官方 Chat 原始内容 |
| AI 完整回答 | 否 | 属于官方 Chat 原始内容 |
| 官方完整聊天历史 | 否 | 不重复造聊天数据系统 |
| 当前 hover 状态 | 否 | 运行时 UI 状态 |
| Floating Toolbar 显示状态 | 否 | 运行时 UI 状态 |
| Popover 打开状态 | 否 | 运行时 UI 状态 |
| Toast 消息 | 否 | 临时反馈 |
| 标题编辑过程中的输入值 | 否 | 局部组件状态 |
| 生成中 loading 状态 | 否 | 运行时状态 |

## 4.2 长期存储的数据

| 数据 | 是否长期存储 | 用途 |
|---|---|---|
| ConversationRef | 是 | 标识官方 Chat 会话 |
| MessageRef | 是 | 定位官方 Chat 原始消息 |
| SourceRef | 是 | 记录节点来源 |
| ConceptMapNode | 是 | Concept Map 节点 |
| ConceptMapEdge | 是 | Concept Map 关系 |
| NodeLayout | 是 | 保留用户布局 |
| UserSettings | 是 | 保存语言、自动生成等设置 |
| removed 节点和关系 | 是 | 支持撤销和避免重复生成 |
| sourceStatus | 是 | 标记原文定位是否有效 |
| schemaVersion | 是 | 支持后续数据迁移 |

## 5. 实体关系总览

```text
ConversationRef
├── MessageRef[]
├── ConceptMapNode[]
│   └── SourceRef[]
│       └── SourceAnchor?
└── ConceptMapEdge[]

UserSettings
└── 全局插件设置
```

关系说明：

1. 一个 ConversationRef 对应一个官方 Chat 会话。
2. 一个 ConversationRef 包含多个 MessageRef。
3. 一个 ConversationRef 包含多个 ConceptMapNode。
4. 一个 ConversationRef 包含多个 ConceptMapEdge。
5. 一个 ConceptMapNode 可以有多个 SourceRef。
6. 一个 ConceptMapEdge 连接两个 ConceptMapNode。

## 6. ConversationRef

## 6.1 作用

ConversationRef 用于标识当前官方 Chat 会话。

Thinking IDE 使用 conversationKey 将本地 Concept Map 数据与官方 Chat 会话关联。

## 6.2 类型定义

```ts
type ConversationSource = 'url' | 'dom' | 'generated'

type ConversationRef = {
  conversationKey: string
  source: ConversationSource
  url?: string
  title?: string
  schemaVersion: number
  createdAt: string
  updatedAt: string
}
```

## 6.3 字段说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| conversationKey | string | 是 | 本地会话唯一标识 |
| source | ConversationSource | 是 | conversationKey 来源 |
| url | string | 否 | 当前 Chat 页面 URL |
| title | string | 否 | 会话标题，若可读取 |
| schemaVersion | number | 是 | 数据结构版本 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

## 6.4 conversationKey 生成优先级

```text
官方 URL conversation id
↓
页面可识别会话 id
↓
URL + title hash
↓
local generated session id
```

## 6.5 示例

```json
{
  "conversationKey": "chatgpt_conv_abc123",
  "source": "url",
  "url": "https://chatgpt.com/c/abc123",
  "title": "Thinking IDE 产品设计",
  "schemaVersion": 1,
  "createdAt": "2026-05-11T10:00:00.000Z",
  "updatedAt": "2026-05-11T10:30:00.000Z"
}
```

## 7. MessageRef

## 7.1 作用

MessageRef 用于定位官方 Chat 页面中的原始用户消息或 AI 消息。

它不是消息副本，而是原文定位索引。

## 7.2 类型定义

```ts
type MessageRole = 'user' | 'assistant'

type MessageRef = {
  id: string
  conversationKey: string
  role: MessageRole
  orderIndex: number
  textHash?: string
  textPreview?: string
  domPath?: string
  domSelector?: string
  createdAt: string
  updatedAt: string
  schemaVersion: number
}
```

## 7.3 字段说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 本地生成的消息引用 ID |
| conversationKey | string | 是 | 所属会话 |
| role | MessageRole | 是 | 用户消息或 AI 消息 |
| orderIndex | number | 是 | 当前会话内消息顺序 |
| textHash | string | 否 | 消息文本 hash，用于恢复匹配 |
| textPreview | string | 否 | 短文本预览，用于辅助定位，不保存完整原文 |
| domPath | string | 否 | DOM 路径，快速定位用 |
| domSelector | string | 否 | DOM 选择器，快速定位用 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |
| schemaVersion | number | 是 | 数据结构版本 |

## 7.4 匹配策略

页面刷新后，通过以下方式恢复定位：

```text
domSelector / domPath 快速定位
↓
conversationKey + role + orderIndex 匹配
↓
textHash 辅助校验
↓
textPreview 辅助模糊匹配
```

## 7.5 示例

```json
{
  "id": "msgref_user_001",
  "conversationKey": "chatgpt_conv_abc123",
  "role": "user",
  "orderIndex": 3,
  "textHash": "hash_8f2a9c",
  "textPreview": "我想做一个类似 Concept Map 的 AI Chat 右侧工具……",
  "domPath": "main > div:nth-child(3)",
  "schemaVersion": 1,
  "createdAt": "2026-05-11T10:02:00.000Z",
  "updatedAt": "2026-05-11T10:02:00.000Z"
}
```

## 8. SourceRef 与 SourceAnchor

## 8.1 作用

SourceRef 用于描述节点来源。

节点可能来自：

1. 用户消息整体。
2. AI 回复整体。
3. AI 回复中的某个段落。
4. 用户手动创建。
5. 多个节点抽象派生。

## 8.2 SourceRef 类型定义

```ts
type SourceType =
  | 'user_message'
  | 'assistant_message'
  | 'message_block'
  | 'manual'
  | 'derived'

type SourceRef = {
  id: string
  sourceType: SourceType
  messageRefId?: string
  anchor?: SourceAnchor
  derivedFromNodeIds?: string[]
  createdAt: string
}
```

## 8.3 SourceAnchor 类型定义

```ts
type SourceAnchor = {
  type: 'message' | 'heading' | 'block' | 'offset' | 'text_quote'
  blockId?: string
  headingText?: string
  start?: number
  end?: number
  textHash?: string
  textQuote?: string
}
```

## 8.4 Anchor 定位优先级

```text
blockId
↓
headingText
↓
textHash / textQuote
↓
offset
```

## 8.5 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | source 本地 ID |
| sourceType | SourceType | 来源类型 |
| messageRefId | string | 关联消息引用 |
| anchor | SourceAnchor | 段落级定位信息 |
| derivedFromNodeIds | string[] | 派生来源节点 |
| textQuote | string | 短文本片段，只用于辅助定位 |

## 8.6 多来源规则

Concept node 可以有多个来源。

因此 ConceptMapNode 使用：

```ts
sources: SourceRef[]
```

而不是：

```ts
source: SourceRef
```

## 8.7 示例

### user_message 来源

```json
{
  "id": "source_001",
  "sourceType": "user_message",
  "messageRefId": "msgref_user_001",
  "createdAt": "2026-05-11T10:02:00.000Z"
}
```

### message_block 来源

```json
{
  "id": "source_002",
  "sourceType": "message_block",
  "messageRefId": "msgref_ai_001",
  "anchor": {
    "type": "heading",
    "headingText": "AI 生成草稿，用户完成建模"
  },
  "createdAt": "2026-05-11T10:03:00.000Z"
}
```

### derived 来源

```json
{
  "id": "source_003",
  "sourceType": "derived",
  "derivedFromNodeIds": ["node_001", "node_002"],
  "createdAt": "2026-05-11T10:04:00.000Z"
}
```

## 9. ConceptMapNode

## 9.1 作用

ConceptMapNode 是 Thinking IDE 的核心节点模型。

它统一表示：

1. 用户问题。
2. AI 回答。
3. 回答结构项。
4. 概念。
5. 观点。
6. 结论。
7. 用户手动创建的想法。

## 9.2 类型定义

```ts
type NodeRole =
  | 'question'
  | 'answer'
  | 'answer_outline'
  | 'concept'
  | 'claim'
  | 'insight'
  | 'decision'
  | 'todo'
  | 'model'

type NodeStatus = 'candidate' | 'edited' | 'removed'

type SourceStatus = 'valid' | 'lost' | 'unknown'

type NodeLayout = {
  x: number
  y: number
  width?: number
  height?: number
  locked?: boolean
}

type NodeMetadata = {
  generatedTitle?: string
  generatedSummary?: string
  fingerprint?: string
}

type ConceptMapNode = {
  id: string
  conversationKey: string

  title: string
  summary?: string

  roles: NodeRole[]
  primaryRole?: NodeRole

  status: NodeStatus
  sourceStatus: SourceStatus
  sources: SourceRef[]

  layout: NodeLayout

  createdBy: 'system' | 'user'
  updatedBy?: 'system' | 'user'

  metadata?: NodeMetadata

  schemaVersion: number
  createdAt: string
  updatedAt: string
}
```

## 9.3 字段说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 节点唯一 ID |
| conversationKey | string | 是 | 所属会话 |
| title | string | 是 | 节点显示标题 |
| summary | string | 否 | 节点摘要，不默认展示 |
| roles | NodeRole[] | 是 | 节点角色，可多个 |
| primaryRole | NodeRole | 否 | 主角色 |
| status | NodeStatus | 是 | 节点业务状态 |
| sourceStatus | SourceStatus | 是 | 原文定位状态 |
| sources | SourceRef[] | 是 | 节点来源，可多个 |
| layout | NodeLayout | 是 | 节点布局 |
| createdBy | system / user | 是 | 创建来源 |
| updatedBy | system / user | 否 | 最近更新来源 |
| metadata | NodeMetadata | 否 | 生成元数据 |
| schemaVersion | number | 是 | 数据版本 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

## 9.4 状态说明

### NodeStatus

| 状态 | 含义 |
|---|---|
| candidate | AI 生成，用户尚未主动编辑 |
| edited | 用户编辑过标题、角色、布局或其他属性 |
| removed | 用户从主视图删除 |

### SourceStatus

| 状态 | 含义 |
|---|---|
| valid | 原文定位有效 |
| lost | 原文定位失效 |
| unknown | 尚未验证来源是否有效 |

## 9.5 示例

```json
{
  "id": "node_001",
  "conversationKey": "chatgpt_conv_abc123",
  "title": "Concept Map 工作台",
  "summary": "AI Chat 右侧用于同步整理认知结构的工作区。",
  "roles": ["concept", "model"],
  "primaryRole": "concept",
  "status": "candidate",
  "sourceStatus": "valid",
  "sources": [
    {
      "id": "source_001",
      "sourceType": "derived",
      "derivedFromNodeIds": ["node_question_001", "node_answer_001"],
      "createdAt": "2026-05-11T10:05:00.000Z"
    }
  ],
  "layout": {
    "x": 420,
    "y": 240
  },
  "createdBy": "system",
  "metadata": {
    "generatedTitle": "Concept Map 工作台",
    "generatedSummary": "AI Chat 右侧用于同步整理认知结构的工作区。",
    "fingerprint": "fp_node_001"
  },
  "schemaVersion": 1,
  "createdAt": "2026-05-11T10:05:00.000Z",
  "updatedAt": "2026-05-11T10:05:00.000Z"
}
```

## 10. ConceptMapEdge

## 10.1 作用

ConceptMapEdge 表示两个节点之间的关系。

## 10.2 类型定义

```ts
type EdgeRelationType =
  | 'answered_by'
  | 'contains'
  | 'mentions'
  | 'explains'
  | 'derived_from'
  | 'follow_up'
  | 'refines'
  | 'expands'
  | 'relates_to'
  | 'supports'
  | 'contrasts'

type EdgeStatus = 'candidate' | 'edited' | 'removed'

type EdgeMetadata = {
  generatedLabel?: string
  fingerprint?: string
}

type ConceptMapEdge = {
  id: string
  conversationKey: string

  sourceNodeId: string
  targetNodeId: string

  relationType: EdgeRelationType
  label?: string

  status: EdgeStatus

  createdBy: 'system' | 'user'
  updatedBy?: 'system' | 'user'

  metadata?: EdgeMetadata

  schemaVersion: number
  createdAt: string
  updatedAt: string
}
```

## 10.3 字段说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 关系唯一 ID |
| conversationKey | string | 是 | 所属会话 |
| sourceNodeId | string | 是 | 起点节点 |
| targetNodeId | string | 是 | 终点节点 |
| relationType | EdgeRelationType | 是 | 关系类型 |
| label | string | 否 | 用户可见关系名称 |
| status | EdgeStatus | 是 | 关系状态 |
| createdBy | system / user | 是 | 创建来源 |
| updatedBy | system / user | 否 | 最近更新来源 |
| metadata | EdgeMetadata | 否 | 生成元数据 |
| schemaVersion | number | 是 | 数据版本 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

## 10.4 关系类型说明

| 类型 | 含义 |
|---|---|
| answered_by | 问题由回答回应 |
| contains | 节点包含子结构 |
| mentions | 节点提到某概念 |
| explains | 节点解释某概念 |
| derived_from | 节点从其他节点派生 |
| follow_up | 后一问题延续前一问题 |
| refines | 细化 |
| expands | 展开 |
| relates_to | 一般关联 |
| supports | 支撑 |
| contrasts | 对比 |

## 10.5 示例

```json
{
  "id": "edge_001",
  "conversationKey": "chatgpt_conv_abc123",
  "sourceNodeId": "node_question_001",
  "targetNodeId": "node_answer_001",
  "relationType": "answered_by",
  "label": "回应",
  "status": "candidate",
  "createdBy": "system",
  "metadata": {
    "generatedLabel": "回应",
    "fingerprint": "fp_edge_001"
  },
  "schemaVersion": 1,
  "createdAt": "2026-05-11T10:05:00.000Z",
  "updatedAt": "2026-05-11T10:05:00.000Z"
}
```

## 11. UserSettings

## 11.1 作用

UserSettings 保存插件级用户设置。

## 11.2 类型定义

```ts
type UserSettings = {
  id: 'global'
  language: 'zh' | 'en' | 'auto'
  autoGenerate: boolean
  panelCollapsed: boolean
  schemaVersion: number
  updatedAt: string
}
```

## 11.3 默认值

```json
{
  "id": "global",
  "language": "auto",
  "autoGenerate": true,
  "panelCollapsed": false,
  "schemaVersion": 1,
  "updatedAt": "2026-05-11T10:00:00.000Z"
}
```

## 12. RuntimeState

## 12.1 作用

RuntimeState 是运行时 UI 状态，不长期持久化。

## 12.2 示例

```ts
type RuntimeState = {
  selectedNodeId: string | null
  selectedEdgeId: string | null
  editingNodeId: string | null
  hoverNodeId: string | null
  toolbarVisible: boolean
  popoverOpen: boolean
  generationLoading: boolean
  toastMessage: string | null
}
```

这些状态放在 Zustand 或组件局部 state 中，不写入 IndexedDB。

## 13. IndexedDB 表结构

## 13.1 表列表

使用 Dexie 管理 IndexedDB。

```text
conversations
messageRefs
nodes
edges
settings
```

## 13.2 Dexie Schema 建议

```ts
const db = new Dexie('thinking_ide')

db.version(1).stores({
  conversations: 'conversationKey, updatedAt',
  messageRefs: 'id, conversationKey, role, orderIndex, textHash',
  nodes: 'id, conversationKey, status, sourceStatus, updatedAt, *roles',
  edges: 'id, conversationKey, sourceNodeId, targetNodeId, status, relationType, updatedAt',
  settings: 'id'
})
```

## 13.3 查询规则

### 获取当前会话 Map

```text
conversationKey
↓
query nodes where conversationKey and status != removed
↓
query edges where conversationKey and status != removed
```

### 获取 messageRefs

```text
query messageRefs where conversationKey
```

### 获取 removed 数据

默认不进入主视图，但保留用于撤销、去重和后续清理。

## 14. 状态流转规则

## 14.1 Node 状态流转

```text
candidate
├─ 用户重命名 → edited
├─ 用户拖拽 → candidate / edited，更新 layout
├─ 用户转换角色 → edited
├─ 用户删除 → removed
└─ 重新解析匹配到 → 不覆盖 edited / user-created
```

说明：

1. 用户拖拽只更新 layout，不一定改变 status。
2. 用户修改 title / role / source 等语义字段时，status = edited。
3. 用户创建节点时，createdBy = user，status = edited。

## 14.2 Edge 状态流转

```text
candidate
├─ 用户修改 label / relationType → edited
├─ 用户删除 → removed
└─ 用户创建 → edited
```

## 14.3 SourceStatus 流转

```text
unknown
├─ 定位成功 → valid
└─ 定位失败 → lost

valid
└─ 后续定位失败 → lost

lost
└─ 后续重新匹配成功 → valid
```

## 15. 删除与撤销规则

## 15.1 删除节点

删除节点时：

```text
node.status = removed
relatedEdges.status = removed
```

主视图过滤 removed 节点和关系。

## 15.2 删除关系

删除关系时：

```text
edge.status = removed
```

## 15.3 撤销

MVP 支持最近一次删除撤销。

运行时记录：

```ts
type RecentAction = {
  type: 'remove_node' | 'remove_edge'
  payload: unknown
  createdAt: string
}
```

恢复规则：

1. remove_node 撤销：恢复节点和相关边。
2. remove_edge 撤销：恢复关系。
3. MVP 可只保留运行时撤销，不持久化 RecentAction。

## 16. 重新解析与去重规则

## 16.1 重新解析原则

重新解析不会覆盖：

1. status = edited 的节点。
2. createdBy = user 的节点。
3. 用户调整过的 layout。
4. status = edited 的关系。
5. createdBy = user 的关系。

## 16.2 新增规则

重新解析结果作为新节点 / 新关系草稿加入。

如果检测到相似节点，则跳过或标记为可能重复。

## 16.3 fingerprint 规则

建议为节点和关系生成 fingerprint。

### Node fingerprint

```text
hash(conversationKey + primaryRole + normalizedTitle + sourceRef)
```

### Edge fingerprint

```text
hash(conversationKey + sourceNodeId + targetNodeId + relationType + normalizedLabel)
```

## 16.4 去重判断

MVP 简单去重规则：

```text
同 conversationKey
同 primaryRole
同 normalizedTitle
同 source messageRefId
```

如果匹配到 removed 节点：

```text
不自动恢复
不再次生成到主图
```

## 17. 刷新恢复规则

## 17.1 恢复流程

```text
用户打开官方 Chat 页面
↓
ChatAdapter 获取 conversationKey
↓
ConceptMapRepository 查询本地数据
↓
恢复 nodes / edges / messageRefs
↓
ChatAdapter 扫描当前页面 DOM
↓
尝试恢复 MessageRef 定位
↓
更新 sourceStatus
↓
渲染 Concept Map
```

## 17.2 MessageRef 恢复策略

优先级：

```text
domSelector / domPath
↓
conversationKey + role + orderIndex
↓
textHash
↓
textPreview
```

## 17.3 恢复结果

### 定位成功

```text
sourceStatus = valid
```

节点可继续跳转原文。

### 定位失败

```text
sourceStatus = lost
```

节点保留，可继续编辑，但点击原文时提示无法定位。

## 18. 数据迁移与版本

## 18.1 schemaVersion

所有持久化实体需要包含：

```text
schemaVersion
```

包括：

1. ConversationRef
2. MessageRef
3. ConceptMapNode
4. ConceptMapEdge
5. UserSettings

## 18.2 迁移原则

1. IndexedDB 使用 Dexie version 管理迁移。
2. 新增字段应提供默认值。
3. 破坏性变更需要写 migration。
4. MVP 阶段 schemaVersion = 1。

## 19. 数据安全与隐私

## 19.1 原文存储原则

Thinking IDE 不长期存储完整用户提问和 AI 回答。

只保存：

1. textHash
2. textPreview
3. textQuote 短片段
4. DOM 定位引用
5. 节点和关系抽象结果

## 19.2 用户清除数据

Settings 中提供：

```text
Clear current map
```

后续版本可增加：

```text
Clear all local data
```

## 20. MVP 数据闭环

```text
ChatAdapter 识别会话和消息
↓
生成 ConversationRef / MessageRef
↓
AI Structuring Service 生成 Node / Edge 草稿
↓
ConceptMapStore 写入内存状态
↓
ConceptMapRepository 持久化到 IndexedDB
↓
用户编辑 Node / Edge / Layout
↓
Repository 保存用户编辑结果
↓
页面刷新后按 conversationKey 恢复 Concept Map
↓
按 MessageRef / SourceRef 尝试恢复原文定位
```

该数据闭环成立后，Thinking IDE 可以在不复制官方 Chat 完整内容的前提下，保存用户自己的 Concept Map 和认知建模结果。

