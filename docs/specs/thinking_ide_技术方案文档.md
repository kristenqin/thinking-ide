# Thinking IDE 技术方案文档

## 1. 文档信息

| 字段 | 内容 |
|---|---|
| 产品名称 | Thinking IDE |
| 文档类型 | Technical Design / 技术方案文档 |
| 版本 | v0.1 |
| 阶段 | MVP |
| 产品形态 | Chrome Extension / 官方 AI Chat 页面增强插件 |
| 前端技术栈 | React + TypeScript + React Flow + shadcn/ui + Radix UI |
| 状态管理 | Zustand |
| 本地存储 | IndexedDB / Dexie |
| 插件规范 | Chrome Extension Manifest V3 |

## 2. 技术目标与边界

## 2.1 技术目标

Thinking IDE MVP 的技术目标是：

1. 以 Chrome Extension 形式运行在官方 AI Chat 页面中。
2. 在官方 Chat 页面右侧注入 Thinking Panel。
3. 支持 4:6 分栏布局，Thinking Panel 作为主要思考空间。
4. 读取官方 Chat Area 中的用户消息和 AI 消息。
5. 在 AI 回复完成后生成 Concept Map 节点和关系草稿。
6. 基于 React Flow 渲染 Concept Map Canvas。
7. 支持节点重命名、拖拽、连接、删除和原文定位。
8. 使用 IndexedDB 持久化 Concept Map 数据。
9. 不长期存储完整用户提问和 AI 回答。
10. 插件故障时不影响官方 Chat 正常使用。

## 2.2 技术边界

MVP 不实现：

1. 独立 AI Chat 系统。
2. 自研完整画布引擎。
3. 复杂自动布局算法。
4. 跨设备同步。
5. 多人协作。
6. 导出 PPT / 图片 / Markdown。
7. 完整后端账户系统。
8. 长期保存完整问答原文。

## 3. 总体架构

## 3.1 架构总览

```text
Chrome Extension
├── Content Script
│   ├── 页面检测
│   ├── Shadow DOM 注入
│   ├── React App 挂载
│   ├── ChatAdapter
│   ├── MessageObserver
│   └── SourceLocator
│
├── Background Service Worker
│   ├── AI Structuring API 调用
│   ├── 扩展消息转发
│   └── 配置读取，可选
│
├── React App
│   ├── ThinkingPanel
│   ├── ConceptMapCanvas
│   ├── React Flow
│   ├── shadcn/ui Components
│   └── Zustand Stores
│
└── Local Persistence
    └── IndexedDB / Dexie
```

## 3.2 数据流总览

```text
Official Chat DOM
↓
ChatAdapter 扫描 / 监听消息
↓
NormalizedMessage
↓
GenerationController
↓
Background Service Worker
↓
AI Structuring Service
↓
ConceptMapNode / ConceptMapEdge
↓
Zustand Store
↓
Dexie / IndexedDB
↓
React Flow Canvas 渲染
```

## 4. Chrome Extension 架构

## 4.1 Manifest V3

MVP 使用 Chrome Extension Manifest V3。

基础能力：

1. Content Script 注入官方 Chat 页面。
2. Background Service Worker 处理 AI 结构化服务请求。
3. storage 权限用于插件配置，可选。
4. host_permissions 限制在目标 Chat 域名。

## 4.2 Manifest 示例

```json
{
  "manifest_version": 3,
  "name": "Thinking IDE",
  "version": "0.1.0",
  "description": "AI-assisted Concept Map workspace for Chat.",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://chatgpt.com/*"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://chatgpt.com/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["assets/*"],
      "matches": ["https://chatgpt.com/*"]
    }
  ]
}
```

## 4.3 Content Script 职责

Content Script 负责：

1. 检测是否为目标 Chat 页面。
2. 注入 Thinking Panel 容器。
3. 创建 Shadow DOM。
4. 挂载 React 应用。
5. 初始化 ChatAdapter。
6. 初始化 MessageObserver。
7. 处理页面 DOM 变化。
8. 调用 SourceLocator 完成原文定位。

Content Script 不负责：

1. 直接持久化完整问答原文。
2. 直接在 UI 组件中操作 DOM。
3. 承载复杂 AI 结构化逻辑。

## 4.4 Background Service Worker 职责

Background Service Worker 负责：

1. 接收 Content Script 的结构化请求。
2. 调用 AI Structuring Service。
3. 返回结构化结果。
4. 处理请求超时和失败。
5. 后续可扩展为配置管理、鉴权代理等。

## 5. 页面注入方案

## 5.1 注入目标

Thinking IDE 需要在官方 Chat 页面右侧注入 Thinking Panel。

默认布局：

```text
Official Chat Area：40%
Thinking Panel：60%
```

## 5.2 注入模式

MVP 支持两种注入模式：

### Layout Mode

Layout Mode 通过调整官方 Chat 页面主容器宽度，实现真实 4:6 分栏。

优点：

1. 体验最接近官方 Canvas / Coding 工作区。
2. 左右区域都可见。
3. 适合长期使用。

风险：

1. 依赖官方 DOM 结构。
2. 官方页面更新后可能失效。

### Overlay Mode

Overlay Mode 使用 fixed panel 覆盖页面右侧，不强改官方布局。

优点：

1. 稳定性更高。
2. 对官方 DOM 依赖更少。
3. 适合作为 fallback。

缺点：

1. 可能遮挡官方页面内容。
2. 体验不如真实分栏。

## 5.3 默认策略

```text
优先尝试 Layout Mode
↓
如果 Chat 主容器无法识别或样式调整失败
↓
fallback 到 Overlay Mode
```

## 5.4 宽度规则

Thinking Panel 推荐宽度：

```css
width: clamp(560px, 60vw, 960px);
```

Chat Area 剩余宽度约为 40%。

## 6. Shadow DOM 与样式隔离

## 6.1 使用 Shadow DOM

Thinking Panel UI 挂载到 Shadow DOM 中，避免：

1. 官方页面样式污染插件。
2. 插件样式污染官方页面。
3. z-index 和 reset 样式冲突。
4. Tailwind / shadcn 样式冲突。

## 6.2 Shadow DOM 结构

```text
thinking-ide-root
└── #shadow-root
    ├── style
    ├── portal-root
    └── react-root
```

## 6.3 样式注入

需要将编译后的 CSS 注入 Shadow Root。

包括：

1. Tailwind base / utilities。
2. shadcn/ui 样式变量。
3. React Flow 样式。
4. Thinking IDE 自定义样式。

## 6.4 Radix Portal 处理

Radix UI 的 Popover、Dropdown、Dialog、Tooltip 等默认可能 portal 到 document.body。

在 Shadow DOM 中需要指定 portal container：

```text
portal-root inside shadowRoot
```

规则：

1. 所有 Portal 类组件挂载到 shadowRoot 内部 portal-root。
2. 避免弹层样式丢失。
3. 避免弹层被官方页面 z-index 干扰。

## 7. ChatAdapter 方案

## 7.1 ChatAdapter 目标

ChatAdapter 负责将官方 Chat 页面转换成 Thinking IDE 可理解的数据。

职责：

1. 识别当前会话。
2. 扫描已有消息。
3. 监听新增消息。
4. 区分用户消息和 AI 消息。
5. 生成 MessageRef。
6. 提供原文定位能力。

## 7.2 ChatAdapter 模块拆分

```text
ChatAdapter
├── ConversationDetector
├── MessageScanner
├── MessageObserver
├── MessageNormalizer
└── SourceLocator
```

## 7.3 ConversationDetector

负责生成 conversationKey。

优先级：

```text
官方 URL conversation id
↓
页面可识别会话 id
↓
URL + title hash
↓
本地生成 session id
```

接口：

```ts
type ConversationDetector = {
  detect: () => ConversationRef
}
```

## 7.4 MessageScanner

负责扫描当前页面已有消息。

接口：

```ts
type MessageScanner = {
  scan: () => NormalizedMessage[]
}
```

## 7.5 MessageObserver

使用 MutationObserver 监听新增消息和消息内容变化。

接口：

```ts
type MessageObserver = {
  start: (callback: (messages: NormalizedMessage[]) => void) => void
  stop: () => void
}
```

性能要求：

1. MutationObserver 需要 debounce。
2. 避免每次 DOM 变化都全量解析。
3. 对长对话页面进行增量扫描。

## 7.6 MessageNormalizer

将 DOM 消息转换为标准消息。

```ts
type NormalizedMessage = {
  messageRefId: string
  role: 'user' | 'assistant'
  orderIndex: number
  text: string
  element: HTMLElement
  textHash?: string
  textPreview?: string
}
```

## 7.7 ChatAdapter 接口

```ts
type ChatAdapter = {
  getConversationKey: () => string
  getMessages: () => NormalizedMessage[]
  observeMessageChanges: (callback: (messages: NormalizedMessage[]) => void) => void
  getMessageText: (messageRefId: string) => string
  scrollToMessage: (messageRefId: string) => Promise<boolean>
  scrollToAnchor: (messageRefId: string, anchor: SourceAnchor) => Promise<boolean>
}
```

## 8. AI 回复完成判断

## 8.1 问题

如果在 AI 回复流式输出未完成时生成 Concept Map，会导致：

1. 节点不完整。
2. outline 缺失。
3. 关系不准确。
4. 多次重复生成。

## 8.2 完成判断策略

MVP 使用组合策略：

```text
优先检测官方生成状态 DOM
↓
如果无法识别，则使用文本稳定策略
↓
文本 1.5-2 秒不变化，认为回答完成
```

## 8.3 DOM 状态策略

优先检测：

1. stop generating 按钮是否消失。
2. loading indicator 是否消失。
3. assistant message 是否停止更新。

该策略依赖官方 DOM，失败时降级。

## 8.4 文本稳定策略

流程：

```text
记录 assistant message text
↓
等待 1.5-2 秒
↓
再次读取 text
↓
若文本未变化，认为完成
```

## 8.5 防重复解析

同一轮 assistant message 只触发一次自动解析。

可用标记：

```text
messageRefId + parsedAt
```

用户手动点击重新解析不受该限制。

## 9. AI Structuring Service 调用方案

## 9.1 调用路径

MVP 采用 Background Service Worker 调用 AI Structuring Service。

```text
Content Script
↓
chrome.runtime.sendMessage
↓
Background Service Worker
↓
AI Structuring Service
↓
Background Service Worker
↓
Content Script
```

## 9.2 原因

不建议 Content Script 直接调用 AI API：

1. 存在跨域限制。
2. API key 暴露风险更高。
3. 不利于后续迁移到后端代理。
4. 不利于统一错误处理。

## 9.3 输入数据

```ts
type StructureTurnInput = {
  conversationKey: string
  userMessage: {
    messageRefId: string
    content: string
  }
  assistantMessage: {
    messageRefId: string
    content: string
  }
  previousNodes: ConceptMapNode[]
  previousEdges: ConceptMapEdge[]
}
```

## 9.4 输出数据

```ts
type StructureTurnOutput = {
  nodes: ConceptMapNode[]
  edges: ConceptMapEdge[]
}
```

## 9.5 隐私约束

1. 结构化请求只发送当前轮问答文本。
2. 本地不长期存储完整问答。
3. API 请求失败不影响旧图谱。
4. 后续可改为用户自带 API key 或后端代理。

## 9.6 超时与错误

建议超时时间：

```text
30 秒
```

错误处理：

1. timeout → generation error。
2. network error → generation error。
3. invalid JSON → generation error。
4. rate limit → generation error + 可重试提示。

## 10. React 应用架构

## 10.1 组件结构

```text
ExtensionRoot
└── ThinkingPanel
    ├── PanelHeader
    ├── StatusBar
    ├── ConceptMapCanvas
    │   ├── ReactFlow
    │   │   ├── ConceptMapNode
    │   │   └── ConceptMapEdge
    │   ├── NodeFloatingToolbar
    │   ├── EdgeEditPopover
    │   └── SourceListPopover
    ├── BottomLog
    └── StateViews
```

## 10.2 ErrorBoundary

ThinkingPanel 外层需要 ErrorBoundary。

目标：

1. React UI 崩溃不影响官方 Chat。
2. 显示轻量错误面板。
3. 提供刷新插件入口。

```text
ExtensionRoot
└── ErrorBoundary
    └── ThinkingPanel
```

## 11. React Flow 画布方案

## 11.1 Domain Model 到 React Flow Model

需要将 ConceptMapNode / ConceptMapEdge 转换为 React Flow 的 nodes / edges。

```ts
type FlowNode = {
  id: string
  type: 'conceptMapNode'
  position: { x: number; y: number }
  data: ConceptMapNodeData
}

type FlowEdge = {
  id: string
  type: 'conceptMapEdge'
  source: string
  target: string
  data: ConceptMapEdgeData
  label?: string
}
```

## 11.2 转换函数

```ts
function mapDomainNodesToFlowNodes(nodes: ConceptMapNode[]): FlowNode[]

function mapDomainEdgesToFlowEdges(edges: ConceptMapEdge[]): FlowEdge[]
```

## 11.3 nodeTypes / edgeTypes

```ts
const nodeTypes = {
  conceptMapNode: ConceptMapNode
}

const edgeTypes = {
  conceptMapEdge: ConceptMapEdge
}
```

## 11.4 React Flow 事件处理

| React Flow 事件 | 处理 |
|---|---|
| onNodeClick | selectNode(nodeId) |
| onPaneClick | clearSelection() |
| onNodeDragStop | moveNode(nodeId, position) + persist |
| onConnect | create edge flow |
| onEdgeClick | selectEdge(edgeId) |
| onNodesDelete | removeNode(nodeId) |
| onEdgesDelete | removeEdge(edgeId) |

## 11.5 Floating Toolbar 定位

Floating Toolbar 作为 Canvas overlay。

定位策略：

1. 读取 selected node 的 position 和尺寸。
2. 结合 React Flow viewport transform 计算 screen position。
3. 默认显示在节点上方。
4. 靠近边缘时自动避让。
5. 拖拽中隐藏或跟随。

## 11.6 EdgeEditPopover 定位

EdgeEditPopover 作为 Canvas overlay。

定位策略：

1. 获取 selected edge 的 source / target node 坐标。
2. 计算 edge 中点。
3. 在中点附近显示 Popover。
4. 靠近边缘时避让。

## 12. 状态管理方案

## 12.1 Zustand Store

MVP 使用 Zustand 管理状态。

Store 拆分：

1. ConceptMapStore
2. PanelStore
3. AdapterStore

## 12.2 ConceptMapStore

管理：

1. nodes
2. edges
3. selectedNodeId
4. selectedEdgeId
5. editingNodeId
6. conversationKey

核心 actions：

```ts
selectNode(nodeId)
selectEdge(edgeId)
clearSelection()
addGeneratedDraft(nodes, edges)
updateNodeTitle(nodeId, title)
moveNode(nodeId, position)
removeNode(nodeId)
connectNodes(sourceId, targetId, relationType, label)
updateEdge(edgeId, patch)
removeEdge(edgeId)
markSourceLost(nodeId)
restoreConversation(conversationKey)
```

## 12.3 PanelStore

管理：

1. isCollapsed
2. panelStatus
3. bottomLog
4. language
5. autoGenerate

## 12.4 AdapterStore

管理：

1. adapterReady
2. adapterError
3. observedMessagesCount

## 12.5 持久化策略

组件不直接写 IndexedDB。

```text
UI 事件
↓
Store Action
↓
Repository
↓
IndexedDB
```

## 13. IndexedDB / Dexie 持久化方案

## 13.1 Dexie 初始化

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

## 13.2 写入策略

| 事件 | 写入时机 |
|---|---|
| addGeneratedDraft | 批量写 nodes / edges |
| updateNodeTitle | 保存 node |
| onNodeDragStop | 保存 node layout |
| removeNode | 保存 node.status = removed |
| connectNodes | 保存 edge |
| updateEdge | 保存 edge |
| removeEdge | 保存 edge.status = removed |
| settings change | 保存 settings |

## 13.3 性能策略

1. 拖拽过程中不频繁写库。
2. 拖拽结束后写库。
3. AI 生成结果批量写入。
4. 写库失败通过 Toast 提示。

## 14. SourceLocator 原文定位方案

## 14.1 调用路径

```text
用户点击 Floating Toolbar 的“原文”
↓
NodeFloatingToolbar.onOpenSource
↓
SourceLocator.locateNodeSource(node)
↓
ChatAdapter.scrollToMessage / scrollToAnchor
↓
成功：原文滚动 + 高亮
失败：markSourceLost + Toast
```

## 14.2 Source 类型处理

| sourceType | 定位方式 |
|---|---|
| user_message | scrollToMessage |
| assistant_message | scrollToMessage |
| message_block | scrollToAnchor |
| derived | 查找 derivedFromNodeIds 或 sources |
| manual | 无原文来源提示 |

## 14.3 concept node 多来源

规则：

1. 0 个来源：Toast 提示暂无来源。
2. 1 个来源：直接定位。
3. 多个来源：显示 SourceListPopover。

## 14.4 跳转成功

执行：

```text
scrollIntoView
↓
添加高亮 class
↓
1.5-3 秒后移除高亮
```

## 14.5 跳转失败

执行：

```text
markSourceLost(nodeId)
↓
Toast：原始消息位置暂时无法定位
```

## 15. 自动布局方案

## 15.1 MVP 策略

MVP 不引入复杂自动布局库。

使用简单层级布局：

```text
question node：上方
answer node：中间
answer_outline nodes：answer 下方
concept nodes：右侧或周边
```

## 15.2 用户布局保护

规则：

1. 用户拖拽后的节点位置不被自动覆盖。
2. 重新解析不重排用户已调整节点。
3. 新节点放在当前视图右侧或空白区域。
4. 已存在节点不因新节点加入而大幅移动。

## 15.3 后续扩展

后续可考虑：

1. dagre
2. elkjs
3. 自定义局部布局

MVP 暂不引入。

## 16. 错误处理方案

## 16.1 统一错误模型

```ts
type AppError = {
  code: string
  message: string
  source: 'adapter' | 'generation' | 'storage' | 'locator' | 'ui'
  recoverable: boolean
}
```

## 16.2 错误类型与处理

| 错误 | UI 处理 |
|---|---|
| adapter error | AdapterErrorState |
| generation error | GenerationErrorState |
| storage error | Toast |
| locator error | Toast + source_lost |
| ui error | ErrorBoundary |

## 16.3 ErrorBoundary

React 组件崩溃时：

1. 显示轻量错误面板。
2. 不影响官方 Chat 页面。
3. 提供重载插件入口。

## 17. 性能优化方案

## 17.1 MutationObserver 优化

1. debounce DOM 变化回调。
2. 避免每次变化全量扫描。
3. 对长对话进行增量识别。

## 17.2 结构化生成优化

1. AI 回复完成后再解析。
2. 同一轮只自动解析一次。
3. 用户手动重新解析时才再次调用。

## 17.3 画布性能

1. MVP 控制节点数量。
2. React Flow 只渲染当前图谱主视图节点。
3. removed 节点不渲染。
4. 避免节点组件内复杂计算。

## 17.4 存储性能

1. 拖拽中不写 IndexedDB。
2. 拖拽结束后写。
3. 批量写入 AI 生成结果。
4. 写入失败通过 Toast 提示。

## 18. 隐私与安全方案

## 18.1 本地存储原则

长期不存储：

1. 用户完整提问。
2. AI 完整回答。

长期存储：

1. textHash。
2. textPreview。
3. 短 textQuote。
4. MessageRef。
5. SourceRef。
6. ConceptMapNode。
7. ConceptMapEdge。

## 18.2 AI 请求原则

1. 只发送当前轮问答用于结构化。
2. 不发送完整历史会话。
3. 失败不影响旧图谱。
4. 后续可支持用户自带 API key 或后端代理。

## 18.3 权限控制

1. 只在指定域名启用。
2. 不读取无关页面内容。
3. 不注入全局变量。
4. 不污染官方页面。

## 18.4 数据清除

MVP 支持：

```text
Clear current map
```

后续支持：

```text
Clear all local data
```

## 19. 项目目录结构

建议目录：

```text
src/
├── extension/
│   ├── content/
│   │   ├── injectPanel.ts
│   │   ├── createShadowRoot.ts
│   │   └── contentEntry.tsx
│   │
│   ├── background/
│   │   └── background.ts
│   │
│   └── manifest/
│       └── manifest.json
│
├── app/
│   ├── ExtensionRoot.tsx
│   └── ThinkingPanel.tsx
│
├── components/
│   ├── panel/
│   │   ├── PanelHeader.tsx
│   │   ├── StatusBar.tsx
│   │   ├── BottomLog.tsx
│   │   └── SettingsMenu.tsx
│   │
│   ├── canvas/
│   │   ├── ConceptMapCanvas.tsx
│   │   ├── NodeFloatingToolbar.tsx
│   │   ├── EdgeEditPopover.tsx
│   │   └── SourceListPopover.tsx
│   │
│   ├── node/
│   │   └── ConceptMapNode.tsx
│   │
│   ├── edge/
│   │   └── ConceptMapEdge.tsx
│   │
│   └── state/
│       ├── EmptyState.tsx
│       ├── GenerationErrorState.tsx
│       └── AdapterErrorState.tsx
│
├── stores/
│   ├── conceptMapStore.ts
│   ├── panelStore.ts
│   └── adapterStore.ts
│
├── services/
│   ├── chatAdapter/
│   │   ├── ChatAdapter.ts
│   │   ├── ConversationDetector.ts
│   │   ├── MessageScanner.ts
│   │   ├── MessageObserver.ts
│   │   └── MessageNormalizer.ts
│   │
│   ├── sourceLocator.ts
│   ├── aiStructuringService.ts
│   ├── generationController.ts
│   └── repository/
│       ├── db.ts
│       └── conceptMapRepository.ts
│
├── models/
│   ├── conversation.ts
│   ├── messageRef.ts
│   ├── source.ts
│   ├── node.ts
│   └── edge.ts
│
├── i18n/
│   ├── index.ts
│   ├── zh.ts
│   └── en.ts
│
└── utils/
    ├── hash.ts
    ├── debounce.ts
    └── time.ts
```

## 20. 权限配置

## 20.1 MVP 权限

```text
permissions:
- storage
- activeTab
- scripting

host_permissions:
- https://chatgpt.com/*
```

如果调用外部 AI API，需要添加对应 host permission。

## 20.2 权限原则

1. 权限最小化。
2. 只在目标 Chat 页面启用。
3. 不请求无关网站权限。
4. 后续扩展其他 AI Chat 页面时按域名逐步增加。

## 21. MVP 技术风险与 fallback

## 21.1 官方 DOM 变化

风险：官方 Chat 页面 DOM 更新导致 ChatAdapter 失效。

Fallback：

1. 显示 AdapterErrorState。
2. 不影响官方 Chat 使用。
3. 保留已有 Concept Map 数据。
4. 后续更新适配规则。

## 21.2 Layout Mode 失败

风险：无法稳定调整官方页面 4:6 布局。

Fallback：

```text
切换到 Overlay Mode
```

## 21.3 AI 结构化失败

风险：接口失败、超时、返回 JSON 不合法。

Fallback：

1. 显示 GenerationErrorState。
2. 提供重试。
3. 不影响旧图谱。

## 21.4 原文定位失败

风险：MessageRef / SourceAnchor 无法恢复。

Fallback：

1. 节点标记 sourceStatus = lost。
2. 节点保留并可编辑。
3. 显示 Toast。

## 21.5 IndexedDB 写入失败

Fallback：

1. Toast 提示保存失败。
2. 内存状态继续保留。
3. 后续重试保存。

## 22. MVP 技术闭环

```text
Chrome Extension 注入页面
↓
Shadow DOM 挂载 React App
↓
ChatAdapter 识别官方 Chat 消息
↓
MutationObserver 监听新增问答
↓
AI 回复完成判断
↓
Background 调用 AI Structuring Service
↓
生成 ConceptMapNode / ConceptMapEdge
↓
Zustand 更新状态
↓
Dexie 持久化到 IndexedDB
↓
React Flow 渲染 Concept Map
↓
用户直接操作节点和关系
↓
SourceLocator 定位官方 Chat 原文
```

该技术闭环成立后，Thinking IDE MVP 可以在不重做 Chat 的前提下，将官方 AI Chat 页面增强为一个 AI 辅助、用户主导、支持直接操作的 Concept Map 工作台。

