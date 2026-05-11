# Thinking IDE 组件设计文档

## 1. 文档信息

| 字段 | 内容 |
|---|---|
| 产品名称 | Thinking IDE |
| 文档类型 | Component Spec / 组件设计文档 |
| 版本 | v0.1 |
| 阶段 | MVP |
| 技术约束 | React + TypeScript + React Flow + shadcn/ui + Radix UI + Zustand + Dexie / IndexedDB |
| 产品形态 | 官方 AI Chat 页面右侧 Concept Map 插件 |

## 2. 文档目标

本文档用于定义 Thinking IDE MVP 的前端组件结构、组件职责、组件边界、组件通信方式和状态管理方式。

本文档主要服务：

1. 前端开发
2. 交互设计落地
3. 后续技术方案拆解
4. 测试用例设计

组件设计目标：

```text
将 Thinking IDE 拆成清晰的 React 组件、状态模块和业务服务，避免 UI 组件、画布逻辑、Chat DOM 适配、本地存储和 AI 结构化服务互相耦合。
```

## 3. 组件设计原则

### 3.1 展示组件与业务逻辑分离

展示组件只负责 UI 展示和局部交互。

业务逻辑放在 store、service、controller 或 hook 中。

### 3.2 React Flow 承担画布基础能力

React Flow 负责：

1. 节点渲染。
2. 边渲染。
3. 节点拖拽。
4. 节点连接。
5. 画布平移与缩放。
6. 节点和边的 selected 状态事件。

Thinking IDE 自研部分只负责业务语义和交互联动。

### 3.3 shadcn/ui 与 Radix UI 承担通用 UI

以下通用 UI 不自研：

1. Button
2. Input
3. Select
4. DropdownMenu
5. ContextMenu
6. Popover
7. Tooltip
8. Toast
9. Alert
10. Dialog
11. Badge
12. ScrollArea
13. Separator

### 3.4 Floating Toolbar 采用 Canvas Overlay 方案

Floating Toolbar 不放在节点内部，而作为 ConceptMapCanvas 的 overlay 子组件。

采用方案 B：

```text
ConceptMapCanvas
├── ReactFlow
│   └── ConceptMapNode
└── NodeFloatingToolbar
```

原因：

1. 更容易控制 z-index。
2. 更容易处理节点靠近边缘时的避让。
3. 不容易受到 React Flow 节点内部布局限制。
4. 后续可以扩展为更专业的画布工具条。

### 3.5 UI 组件不直接操作官方 Chat DOM

UI 组件不直接读取或操作官方 Chat 页面 DOM。

原文跳转统一通过 SourceLocator / ChatAdapter 完成。

### 3.6 组件不直接访问 IndexedDB

组件只调用 store actions。

IndexedDB 读写通过 Repository 层完成。

### 3.7 所有 UI 文案支持 i18n

组件内不直接写死长期文案。

UI 文案通过 i18n key 获取。

已生成节点标题不随 UI 语言切换自动改变。

## 4. 总体架构

## 4.1 分层结构

```text
Extension Runtime
├── ExtensionRoot
│   ├── Shadow DOM Mount
│   ├── ChatAdapter 初始化
│   ├── Store 初始化
│   └── ThinkingPanel
│
├── UI Layer
│   ├── ThinkingPanel
│   ├── PanelHeader
│   ├── StatusBar
│   ├── ConceptMapCanvas
│   ├── BottomLog
│   └── StateViews
│
├── Canvas Layer
│   ├── ReactFlow
│   ├── ConceptMapNode
│   ├── ConceptMapEdge
│   ├── NodeFloatingToolbar
│   ├── EdgeEditPopover
│   └── SourceListPopover
│
├── State Layer
│   ├── ConceptMapStore
│   ├── PanelStore
│   └── AdapterStore
│
├── Service Layer
│   ├── ChatAdapter
│   ├── MessageObserver
│   ├── SourceLocator
│   ├── AIStucturingService
│   ├── GenerationController
│   └── ConceptMapRepository
│
└── Persistence Layer
    └── IndexedDB / Dexie
```

## 4.2 核心组件树

```text
ExtensionRoot
└── ThinkingPanel
    ├── PanelHeader
    │   └── SettingsMenu
    │
    ├── StatusBar
    │
    ├── ConceptMapCanvas
    │   ├── ReactFlow
    │   │   ├── ConceptMapNode
    │   │   └── ConceptMapEdge
    │   │
    │   ├── NodeFloatingToolbar
    │   ├── EdgeEditPopover
    │   └── SourceListPopover
    │
    ├── BottomLog
    │
    └── StateViews
        ├── EmptyState
        ├── GeneratingState
        ├── GenerationErrorState
        └── AdapterErrorState
```

## 5. 核心 UI 组件设计

## 5.1 ExtensionRoot

### 职责

ExtensionRoot 是插件运行的根容器。

负责：

1. 创建 Shadow DOM 挂载点。
2. 初始化 ChatAdapter。
3. 初始化 Zustand store。
4. 初始化 i18n。
5. 渲染 ThinkingPanel。
6. 处理插件级错误兜底。

### 不负责

1. 不负责节点渲染。
2. 不负责 Concept Map 业务逻辑。
3. 不直接处理节点交互。

### 伪代码

```tsx
type ExtensionRootProps = {
  mountElement: HTMLElement
}

function ExtensionRoot(props: ExtensionRootProps) {
  return <ThinkingPanel />
}
```

## 5.2 ThinkingPanel

### 职责

ThinkingPanel 是右侧主面板容器。

负责：

1. 组织 Header、StatusBar、Canvas、BottomLog 和状态页面。
2. 根据 panelStatus 决定显示 ConceptMapCanvas 或 StateView。
3. 管理面板展开 / 收起状态。
4. 控制 4:6 布局下的右侧面板宽度。

### 布局

```text
ThinkingPanel
├── PanelHeader
├── StatusBar
├── MainContent
│   ├── ConceptMapCanvas
│   └── StateViews
└── BottomLog
```

### Props

```ts
type ThinkingPanelProps = {}
```

大部分数据从 store 中读取。

### Store 依赖

```text
PanelStore
ConceptMapStore
AdapterStore
```

### 状态分支

| panelStatus | 显示内容 |
|---|---|
| ready | ConceptMapCanvas 或 EmptyState |
| waiting | ConceptMapCanvas + StatusBar |
| generating | ConceptMapCanvas + StatusBar |
| failed | GenerationErrorState |
| adapter_error | AdapterErrorState |

## 5.3 PanelHeader

### 职责

PanelHeader 展示面板标题、当前状态、重新解析入口、设置入口和收起入口。

### Wireframe

```text
Thinking IDE        Synced      ↻   ⚙   ⟩
```

### Props

```ts
type PanelHeaderProps = {
  status: 'ready' | 'waiting' | 'generating' | 'synced' | 'failed'
  onRegenerate: () => void
  onCollapse: () => void
}
```

### 组件依赖

```text
Button
Badge
DropdownMenu
Tooltip
SettingsMenu
```

### 交互

| 操作 | 行为 |
|---|---|
| 点击 ↻ | 触发重新解析 |
| 点击 ⚙ | 打开 SettingsMenu |
| 点击 ⟩ | 收起 Thinking Panel |

## 5.4 SettingsMenu

### 职责

SettingsMenu 承载低频全局设置。

### 菜单结构

```text
Settings
├── Language
│   ├── 中文
│   └── English
├── Auto-generate
├── Clear current map
└── About
```

### Props

```ts
type SettingsMenuProps = {
  language: 'zh' | 'en'
  autoGenerate: boolean
  onChangeLanguage: (language: 'zh' | 'en') => void
  onToggleAutoGenerate: (enabled: boolean) => void
  onClearCurrentMap: () => void
}
```

### 交互规则

1. Language 切换后 UI 文案立即生效。
2. Auto-generate 控制是否自动解析新回答。
3. Clear current map 需要 Dialog 二次确认。

## 5.5 StatusBar

### 职责

StatusBar 用于展示当前系统状态。

状态包括：

1. 等待 AI 回复完成。
2. 正在生成节点和关系。
3. 已同步。
4. 生成失败。
5. 原文定位失败。

### Props

```ts
type StatusBarProps = {
  status: PanelStatus
  message?: string
}
```

### 展示规则

1. 不遮挡 Concept Map。
2. 不展示节点数量统计。
3. 节点数量统计放入 BottomLog。
4. 状态变化尽量弱提示。

## 5.6 BottomLog

### 职责

BottomLog 展示低优先级系统反馈。

例如：

```text
Generated 8 nodes · 4 relations
Restored current map
Added 5 nodes · Your edits were preserved
Source location failed
```

### Props

```ts
type BottomLogProps = {
  message?: string
}
```

### 规则

1. 位于 Thinking Panel 底部。
2. 不抢占主视觉。
3. 可被新日志覆盖。
4. 不用于高风险错误提示。

## 6. Canvas 相关组件设计

## 6.1 ConceptMapCanvas

### 职责

ConceptMapCanvas 封装 React Flow，并承载画布级 overlay 组件。

负责：

1. 将 ConceptMapStore 中的 nodes / edges 转换为 React Flow nodes / edges。
2. 注册 nodeTypes 和 edgeTypes。
3. 处理 React Flow 事件。
4. 分发节点拖拽、节点连接、关系点击等事件。
5. 渲染 NodeFloatingToolbar。
6. 渲染 EdgeEditPopover。
7. 渲染 SourceListPopover。

### 组件结构

```text
ConceptMapCanvas
├── ReactFlow
│   ├── ConceptMapNode
│   └── ConceptMapEdge
├── NodeFloatingToolbar
├── EdgeEditPopover
└── SourceListPopover
```

### Props

```ts
type ConceptMapCanvasProps = {
  nodes: ConceptMapNode[]
  edges: ConceptMapEdge[]
}
```

实际实现中可直接从 ConceptMapStore 读取。

### React Flow 事件

| React Flow 事件 | Store Action |
|---|---|
| onNodeClick | selectNode(nodeId) |
| onPaneClick | clearSelection() |
| onNodeDragStop | moveNode(nodeId, position) |
| onConnect | start / create edge flow |
| onEdgeClick | selectEdge(edgeId) |
| onEdgesDelete | removeEdge(edgeId) |
| onNodesDelete | removeNode(nodeId) |

### 注意

节点点击只选中，不直接跳转原文。

原文跳转由 NodeFloatingToolbar 的“原文”按钮触发。

## 6.2 ConceptMapNode

### 职责

ConceptMapNode 是 React Flow 的自定义节点组件。

负责：

1. 展示节点标题。
2. 展示 selected 样式。
3. 展示 source_lost 图标。
4. 提供连接 Handle。
5. 支持双击标题进入编辑。
6. 处理标题编辑态。

### 不负责

1. 不直接操作 Chat DOM。
2. 不直接访问 IndexedDB。
3. 不直接调用 AI 服务。
4. 不渲染 Floating Toolbar。

### Props

```ts
type ConceptMapNodeData = {
  id: string
  title: string
  roles: NodeRole[]
  status: NodeStatus
  isSourceLost: boolean
}

type ConceptMapNodeProps = NodeProps<ConceptMapNodeData>
```

### 默认态

```text
┌────────────────────┐
│ Concept Map        │
└────────────────────┘
```

### source_lost 态

```text
┌────────────────────┐
│ Concept Map      ⚠ │
└────────────────────┘
```

### 标题编辑态

```text
┌────────────────────────┐
│ [ Concept Map 工作台 ]  │
│ Esc 取消     Enter 保存 │
└────────────────────────┘
```

### 事件

| 事件 | 行为 |
|---|---|
| double click title | 进入标题编辑 |
| Enter | 保存标题 |
| Esc | 取消编辑 |
| blur | 默认保存 |
| empty title | 不保存，显示提示 |

## 6.3 ConceptMapEdge

### 职责

ConceptMapEdge 是 React Flow 的自定义边组件。

负责：

1. 展示关系线。
2. 展示关系 label。
3. 展示 selected 样式。
4. 支持点击选中。

### Props

```ts
type ConceptMapEdgeData = {
  id: string
  relationType: EdgeRelationType
  label?: string
  status: EdgeStatus
}

type ConceptMapEdgeProps = EdgeProps<ConceptMapEdgeData>
```

### 展示规则

1. AI 生成关系可用弱虚线或弱线条。
2. 用户编辑关系使用普通实线。
3. 不强展示 candidate 文案。
4. label 显示 relation label。

## 6.4 NodeFloatingToolbar

### 职责

NodeFloatingToolbar 是 Canvas overlay 组件，用于承载节点高频操作。

采用方案 B：不放在节点内部，而放在 ConceptMapCanvas overlay 层。

### 显示条件

```text
selectedNodeId 存在
且节点不处于标题编辑态
```

### 隐藏条件

1. 点击空白画布。
2. 选择其他节点。
3. 节点进入标题编辑态。
4. 节点被删除。
5. 拖拽节点开始时隐藏或跟随节点。
6. 打开其他强交互浮层时可隐藏。

### Props

```ts
type NodeFloatingToolbarProps = {
  nodeId: string
  position: { x: number; y: number }
  onRename: (nodeId: string) => void
  onOpenSource: (nodeId: string) => void
  onStartConnect: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onOpenMore: (nodeId: string) => void
}
```

### Toolbar 内容

```text
重命名  原文  连接  删除  ⋯
```

### 定位规则

1. 默认显示在节点上方。
2. 节点靠近顶部时显示在下方。
3. 靠近左右边缘时向内避让。
4. 不遮挡标题编辑输入框。

## 6.5 EdgeEditPopover

### 职责

EdgeEditPopover 用于编辑选中关系。

作为 ConceptMapCanvas overlay 组件存在。

### 显示条件

```text
selectedEdgeId 存在
```

### Props

```ts
type EdgeEditPopoverProps = {
  edgeId: string
  position: { x: number; y: number }
  relationType: EdgeRelationType
  label?: string
  onSave: (edgeId: string, patch: Partial<ConceptMapEdge>) => void
  onDelete: (edgeId: string) => void
  onCancel: () => void
}
```

### UI

```text
┌──────────────────────────────┐
│ 编辑关系                       │
│                              │
│ 类型： [ relates_to    v ]    │
│ 名称： [ 关联            ]    │
│                              │
│ 删除关系        取消    保存   │
└──────────────────────────────┘
```

### 规则

1. 保存后 edge status = edited。
2. 取消不保存修改。
3. 删除后 edge status = removed / rejected。
4. 点击空白画布关闭 Popover，默认不保存。

## 6.6 SourceListPopover

### 职责

SourceListPopover 用于处理 concept node 多来源跳转。

### 显示条件

```text
用户点击 Toolbar 的“原文”
且该节点存在多个 source
```

### Props

```ts
type SourceListPopoverProps = {
  nodeId: string
  sources: SourceRef[]
  position: { x: number; y: number }
  onSelectSource: (source: SourceRef) => void
  onClose: () => void
}
```

### UI

```text
┌──────────────────────────────┐
│ Concept: Concept Map          │
├──────────────────────────────┤
│ 选择来源：                    │
│ 1. 用户问题：Thinking IDE 定位 │
│ 2. AI 回答：Concept Map 区别   │
│ 3. Outline：用户完成建模       │
└──────────────────────────────┘
```

## 7. 状态组件设计

## 7.1 EmptyState

### 职责

当前会话无可解析内容时展示引导。

### 文案

```text
开始一段对话后，Thinking IDE 会在这里生成 Concept Map 草稿。

你可以：
· 查看 AI 生成的节点草稿
· 点击节点回到原文
· 拖拽、重命名、连接和删除节点
```

## 7.2 GeneratingState

### 职责

展示结构化生成中的状态。

### 规则

1. 不遮挡旧图谱。
2. 用户仍可编辑已有节点。
3. 作为 StatusBar 文案显示即可。

## 7.3 GenerationErrorState

### 职责

展示生成失败状态。

### 操作

1. 重试
2. 忽略本轮

## 7.4 AdapterErrorState

### 职责

展示 Chat DOM 识别失败。

### 文案

```text
当前页面结构暂时无法识别，Thinking IDE 需要更新适配规则。
```

## 8. Store 设计

## 8.1 ConceptMapStore

### 职责

管理 Concept Map 核心状态。

### 状态

```ts
type ConceptMapStoreState = {
  conversationKey: string | null
  nodes: ConceptMapNode[]
  edges: ConceptMapEdge[]
  selectedNodeId: string | null
  selectedEdgeId: string | null
  editingNodeId: string | null
}
```

### Actions

```ts
type ConceptMapActions = {
  setConversationKey: (key: string) => void
  addGeneratedDraft: (nodes: ConceptMapNode[], edges: ConceptMapEdge[]) => void
  selectNode: (nodeId: string) => void
  selectEdge: (edgeId: string) => void
  clearSelection: () => void
  updateNodeTitle: (nodeId: string, title: string) => void
  moveNode: (nodeId: string, position: { x: number; y: number }) => void
  removeNode: (nodeId: string) => void
  restoreNode: (nodeId: string) => void
  connectNodes: (sourceId: string, targetId: string, relationType?: EdgeRelationType, label?: string) => void
  updateEdge: (edgeId: string, patch: Partial<ConceptMapEdge>) => void
  removeEdge: (edgeId: string) => void
  markSourceLost: (nodeId: string) => void
  restoreConversation: (conversationKey: string) => Promise<void>
}
```

## 8.2 PanelStore

### 职责

管理 Thinking Panel UI 状态。

### 状态

```ts
type PanelStoreState = {
  isCollapsed: boolean
  panelStatus: 'ready' | 'waiting' | 'generating' | 'synced' | 'failed' | 'adapter_error'
  bottomLog: string | null
  language: 'zh' | 'en'
  autoGenerate: boolean
}
```

### Actions

```ts
type PanelActions = {
  collapsePanel: () => void
  expandPanel: () => void
  setPanelStatus: (status: PanelStoreState['panelStatus']) => void
  setBottomLog: (message: string | null) => void
  setLanguage: (language: 'zh' | 'en') => void
  setAutoGenerate: (enabled: boolean) => void
}
```

## 8.3 AdapterStore

### 职责

管理 Chat Adapter 状态。

### 状态

```ts
type AdapterStoreState = {
  adapterReady: boolean
  adapterError: string | null
  observedMessagesCount: number
}
```

## 9. Service 设计

## 9.1 ChatAdapter

### 职责

负责识别和操作官方 Chat 页面。

```ts
type ChatAdapter = {
  getConversationKey: () => string
  getMessages: () => NormalizedMessage[]
  observeMessageChanges: (callback: (messages: NormalizedMessage[]) => void) => void
  getMessageText: (messageRefId: string) => string
  scrollToMessage: (messageRefId: string) => Promise<boolean>
  scrollToAnchor: (messageRefId: string, anchor: SourceRef['anchor']) => Promise<boolean>
}
```

## 9.2 SourceLocator

### 职责

统一处理节点到原文的定位逻辑。

```ts
type SourceLocator = {
  locateNodeSource: (node: ConceptMapNode) => Promise<LocateResult>
  locateSource: (source: SourceRef) => Promise<LocateResult>
}

type LocateResult =
  | { ok: true }
  | { ok: false; reason: 'source_lost' | 'anchor_lost' | 'no_source' }
```

### 规则

1. question node 定位到用户消息。
2. answer node 定位到 AI 回复。
3. answer_outline node 定位到 AI 回复段落。
4. concept node 多来源时交给 SourceListPopover。

## 9.3 AIStucturingService

### 职责

负责把一轮问答转成节点和关系草稿。

```ts
type AIStucturingService = {
  structureTurn: (input: StructureTurnInput) => Promise<StructureTurnOutput>
}
```

## 9.4 GenerationController

### 职责

负责控制结构化生成流程。

包括：

1. 判断 AI 回复完成。
2. 调用 AIStucturingService。
3. 将结果写入 ConceptMapStore。
4. 写入 BottomLog。
5. 处理生成失败。

```ts
type GenerationController = {
  generateForLatestTurn: () => Promise<void>
  regenerateForSource: (source: SourceRef) => Promise<void>
}
```

## 9.5 ConceptMapRepository

### 职责

负责 IndexedDB 读写。

```ts
type ConceptMapRepository = {
  saveNodes: (nodes: ConceptMapNode[]) => Promise<void>
  saveEdges: (edges: ConceptMapEdge[]) => Promise<void>
  getMapByConversation: (conversationKey: string) => Promise<{
    nodes: ConceptMapNode[]
    edges: ConceptMapEdge[]
  }>
  clearMap: (conversationKey: string) => Promise<void>
}
```

## 10. 数据流设计

## 10.1 新消息生成数据流

```text
Official Chat DOM
↓
ChatAdapter / MessageObserver
↓
GenerationController
↓
AIStucturingService
↓
ConceptMapStore.addGeneratedDraft
↓
ConceptMapRepository.save
↓
ConceptMapCanvas 更新
```

## 10.2 节点编辑数据流

```text
用户双击节点标题
↓
ConceptMapNode 进入编辑态
↓
用户保存
↓
ConceptMapStore.updateNodeTitle
↓
ConceptMapRepository.saveNodes
↓
节点重新渲染
```

## 10.3 节点拖拽数据流

```text
用户拖拽节点
↓
React Flow onNodeDrag
↓
画布实时更新
↓
onNodeDragStop
↓
ConceptMapStore.moveNode
↓
ConceptMapRepository.saveNodes
```

## 10.4 原文跳转数据流

```text
用户点击 Floating Toolbar 的“原文”
↓
NodeFloatingToolbar.onOpenSource
↓
SourceLocator.locateNodeSource
↓
ChatAdapter.scrollToMessage / scrollToAnchor
↓
成功：Chat 原文高亮
失败：ConceptMapStore.markSourceLost + Toast
```

## 11. i18n 设计

## 11.1 规则

1. UI 文案使用 i18n key。
2. 节点标题不随 UI 语言切换自动变化。
3. AI 生成节点语言默认跟随当前对话语言。
4. SettingsMenu 中可以切换中文 / English。

## 11.2 示例 key

```ts
const i18nKeys = {
  panelTitle: 'thinking.panel.title',
  rename: 'common.rename',
  openSource: 'common.openSource',
  connect: 'common.connect',
  delete: 'common.delete',
  sourceLost: 'node.sourceLost',
  generating: 'status.generating',
}
```

## 12. 组件优先级

| 优先级 | 组件 / 模块 | 原因 |
|---|---|---|
| P0 | ExtensionRoot | 插件运行基础 |
| P0 | ThinkingPanel | 右侧主界面 |
| P0 | ConceptMapCanvas | 核心画布 |
| P0 | ConceptMapNode | 核心节点 |
| P0 | NodeFloatingToolbar | 节点主操作入口 |
| P0 | ChatAdapter | 官方 Chat 对接 |
| P0 | SourceLocator | 原文跳转核心 |
| P0 | ConceptMapStore | 状态核心 |
| P0 | ConceptMapRepository | 本地存储 |
| P1 | EdgeEditPopover | 关系编辑 |
| P1 | SourceListPopover | 多来源跳转 |
| P1 | SettingsMenu | 语言与设置 |
| P1 | BottomLog | 弱反馈 |
| P1 | GenerationErrorState | 异常处理 |

## 13. MVP 组件闭环

MVP 最小组件闭环为：

```text
ExtensionRoot
↓
ThinkingPanel
↓
ConceptMapCanvas
↓
ConceptMapNode + ConceptMapEdge
↓
NodeFloatingToolbar
↓
ConceptMapStore
↓
ChatAdapter / SourceLocator
↓
ConceptMapRepository
```

该闭环成立后，Thinking IDE 可以完成：

1. 在官方 Chat 页面右侧显示 Concept Map。
2. 展示 AI 生成节点和关系。
3. 支持节点选中、重命名、拖拽、连接、删除。
4. 支持通过 Toolbar 跳转原文。
5. 支持本地保存和恢复用户编辑结果。

