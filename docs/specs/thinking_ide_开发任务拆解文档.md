# Thinking IDE 开发任务拆解文档

## 1. 文档信息

| 字段 | 内容 |
|---|---|
| 产品名称 | Thinking IDE |
| 文档类型 | Development Task Breakdown / 开发任务拆解文档 |
| 版本 | v0.1 |
| 阶段 | MVP |
| 依据文档 | MVP v0.2 / PRD / 用户流程图 / Wireframe / 交互设计规范 / 组件设计文档 / 数据模型文档 / 技术方案文档 / 测试用例文档 |
| 技术栈 | Chrome Extension MV3 + React + TypeScript + React Flow + shadcn/ui + Radix UI + Zustand + Dexie |

## 2. 开发目标

MVP 开发目标是完成 Thinking IDE 的最小技术闭环：

```text
Chrome Extension 注入官方 Chat 页面
↓
右侧挂载 Thinking Panel
↓
ChatAdapter 识别官方 Chat 消息
↓
AI 回复完成后生成 Concept Map 草稿
↓
React Flow 渲染节点和关系
↓
用户直接操作节点和关系
↓
IndexedDB 保存用户编辑结果
↓
用户通过节点定位官方 Chat 原文
```

MVP 必须满足：

1. 不重做 Chat。
2. 不长期存储完整问答原文。
3. 插件失败不影响官方 Chat。
4. 右侧 Concept Map 支持直接操作。
5. 页面刷新后用户编辑结果可恢复。

## 2.1 当前 MVP 视图策略补充

当前 MVP 主视图策略补充如下：

1. 当前主渲染优先是 `Session -> Question -> Answer -> Outline` 的结构树。
2. `Concept View` 相关 graph 渲染保留为后续增强路线。
3. 因此，接下来的前端主任务优先是结构树渲染、展开/收起和原文联动，而不是继续深化 graph-first 主视图。

## 3. 任务优先级定义

| 优先级 | 定义 |
|---|---|
| P0 | MVP 核心闭环必须完成，不完成无法发布 |
| P1 | 重要能力，影响体验，但可以在核心闭环后补齐 |
| P2 | 边缘增强或后续优化能力 |

## 4. 开发阶段总览

```text
Phase 0：工程初始化
Phase 1：插件注入与右侧面板
Phase 2：数据模型与本地存储
Phase 3：ChatAdapter 与消息监听
Phase 4：Primary Structure View
Phase 5：节点与关系直接操作
Phase 6：AI 结构化生成流程
Phase 7：SourceLocator 原文定位
Phase 8：刷新恢复与重新解析
Phase 9：异常、隐私与性能处理
Phase 10：测试与验收
```

## 5. Phase 0：工程初始化

## TASK-0001 初始化项目工程

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | 工程基础 |
| 依赖 | 无 |
| 目标 | 搭建 Chrome Extension + React + TypeScript 项目基础 |

### 任务内容

1. 初始化前端项目。
2. 配置 TypeScript。
3. 配置 React。
4. 配置 Chrome Extension Manifest V3。
5. 配置构建工具。
6. 配置基础 lint / format。
7. 配置目录结构。

### 建议目录

```text
src/
├── extension/
├── app/
├── components/
├── stores/
├── services/
├── models/
├── i18n/
└── utils/
```

### 验收标准

1. 项目可以成功启动开发构建。
2. 可以生成 Chrome Extension 可加载产物。
3. Chrome 可以通过开发者模式加载插件。

## TASK-0002 安装核心依赖

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | 工程基础 |
| 依赖 | TASK-0001 |
| 目标 | 安装 MVP 所需核心依赖 |

### 任务内容

安装并验证：

1. React
2. TypeScript
3. React Flow / xyflow
4. Zustand
5. Dexie
6. shadcn/ui
7. Radix UI
8. lucide-react
9. i18n 基础库，可选

### 验收标准

1. 所有依赖安装成功。
2. React Flow 示例节点可在本地渲染。
3. shadcn/ui Button / Popover / DropdownMenu 可正常渲染。

## TASK-0003 定义 TypeScript 数据模型

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | 数据模型 |
| 依赖 | TASK-0001 |
| 目标 | 根据 Data Model Spec 定义核心类型 |

### 任务内容

创建以下模型文件：

```text
models/conversation.ts
models/messageRef.ts
models/source.ts
models/node.ts
models/edge.ts
models/settings.ts
```

定义：

1. ConversationRef
2. MessageRef
3. SourceRef
4. SourceAnchor
5. ConceptMapNode
6. ConceptMapEdge
7. UserSettings
8. NodeRole
9. NodeStatus
10. SourceStatus
11. EdgeRelationType
12. EdgeStatus

### 验收标准

1. 类型定义完整。
2. 后续 store / repository / service 可直接引用。
3. TypeScript 无类型错误。

## 6. Phase 1：插件注入与右侧面板

## TASK-0101 配置 Manifest V3

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Chrome Extension |
| 依赖 | TASK-0001 |
| 目标 | 完成插件 manifest 配置 |

### 任务内容

配置：

1. manifest_version = 3。
2. content_scripts。
3. background service_worker。
4. permissions。
5. host_permissions。
6. web_accessible_resources。

### MVP 权限

```text
permissions:
- storage
- activeTab
- scripting

host_permissions:
- https://chatgpt.com/*
```

### 验收标准

1. 插件可被 Chrome 加载。
2. 只在目标域名运行 content script。
3. 非目标页面不注入。

## TASK-0102 实现 Content Script 入口

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Chrome Extension |
| 依赖 | TASK-0101 |
| 目标 | 在官方 Chat 页面运行 content script |

### 任务内容

1. 创建 contentEntry.tsx。
2. 检测当前页面是否为目标 Chat 页面。
3. 创建插件根容器。
4. 处理重复注入保护。
5. 挂载 ExtensionRoot。

### 验收标准

1. 打开 ChatGPT 页面后 content script 执行。
2. 非目标页面不执行注入逻辑。
3. 页面刷新后不会重复创建多个面板。

## TASK-0103 创建 Shadow DOM 容器

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | UI 注入 |
| 依赖 | TASK-0102 |
| 目标 | 使用 Shadow DOM 隔离插件 UI |

### 任务内容

1. 创建 thinking-ide-root。
2. attachShadow。
3. 创建 react-root。
4. 创建 portal-root。
5. 注入插件 CSS。
6. 确保 shadcn / Radix / React Flow 样式可用。

### 验收标准

1. Thinking Panel UI 在 Shadow DOM 中渲染。
2. 官方页面样式不受插件影响。
3. 插件样式不被官方页面污染。
4. Popover / Dropdown 等弹层样式正常。

## TASK-0104 实现 ThinkingPanel 基础布局

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Thinking Panel |
| 依赖 | TASK-0103 |
| 目标 | 实现右侧面板基础 UI |

### 任务内容

实现组件：

1. ExtensionRoot
2. ThinkingPanel
3. PanelHeader
4. StatusBar
5. BottomLog
6. EmptyState

### 布局要求

1. 默认 4:6 分栏。
2. Thinking Panel 约占 60vw。
3. 宽度使用 clamp(560px, 60vw, 960px)。
4. Header 显示 Thinking IDE / status / regenerate / settings / collapse。
5. BottomLog 位于底部。

### 验收标准

1. 面板显示在页面右侧。
2. Header 正常显示。
3. EmptyState 正常显示。
4. BottomLog 可显示弱提示。

## TASK-0105 实现 Layout Mode 与 Overlay Mode fallback

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 模块 | UI 注入 |
| 依赖 | TASK-0104 |
| 目标 | 实现 4:6 布局和 fallback |

### 任务内容

1. 尝试识别官方 Chat 主容器。
2. 应用 Layout Mode。
3. 如果主容器识别失败，则使用 Overlay Mode。
4. 确保官方 Chat 可继续使用。

### 验收标准

1. Layout Mode 成功时形成 4:6 分栏。
2. Layout Mode 失败时 Overlay Mode 可用。
3. fallback 不影响官方 Chat 输入和滚动。

## TASK-0106 实现面板收起 / 展开

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Thinking Panel |
| 依赖 | TASK-0104 |
| 目标 | 支持右侧面板收起和展开 |

### 任务内容

1. 添加 collapse 按钮。
2. 收起后显示 32px 窄条。
3. 点击窄条展开。
4. 状态写入 PanelStore。

### 验收标准

1. 用户可收起面板。
2. 收起后官方 Chat 可正常使用。
3. 用户可重新展开面板。

## 7. Phase 2：数据模型与本地存储

## TASK-0201 初始化 Dexie 数据库

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Persistence |
| 依赖 | TASK-0003 |
| 目标 | 创建 IndexedDB / Dexie 数据库 |

### 任务内容

创建：

```text
services/repository/db.ts
```

定义表：

```ts
conversations: 'conversationKey, updatedAt'
messageRefs: 'id, conversationKey, role, orderIndex, textHash'
nodes: 'id, conversationKey, status, sourceStatus, updatedAt, *roles'
edges: 'id, conversationKey, sourceNodeId, targetNodeId, status, relationType, updatedAt'
settings: 'id'
```

### 验收标准

1. IndexedDB 可创建。
2. 表结构与 Data Model Spec 一致。
3. schemaVersion = 1。

## TASK-0202 实现 ConceptMapRepository

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Persistence |
| 依赖 | TASK-0201 |
| 目标 | 封装 Concept Map 数据读写 |

### 任务内容

实现：

```ts
saveNodes(nodes)
saveEdges(edges)
getMapByConversation(conversationKey)
saveConversation(conversation)
saveMessageRefs(messageRefs)
clearMap(conversationKey)
```

### 验收标准

1. 可以保存 nodes / edges。
2. 可以按 conversationKey 读取 map。
3. removed 数据默认不进入主视图。
4. clearMap 可以清除当前会话 map 数据。

## TASK-0203 实现 ConceptMapStore

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | State |
| 依赖 | TASK-0202 |
| 目标 | 管理 nodes / edges / selection / edit 状态 |

### 任务内容

实现 Zustand store：

```ts
setConversationKey
addGeneratedDraft
selectNode
selectEdge
clearSelection
updateNodeTitle
moveNode
removeNode
restoreNode
connectNodes
updateEdge
removeEdge
markSourceLost
restoreConversation
```

### 验收标准

1. Store 可维护 nodes / edges。
2. Store actions 可更新内存状态。
3. Store actions 可调用 Repository 持久化。
4. 删除采用 status = removed。

## TASK-0204 实现 PanelStore

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | State |
| 依赖 | TASK-0104 |
| 目标 | 管理面板 UI 状态 |

### 任务内容

实现：

```ts
isCollapsed
panelStatus
bottomLog
language
autoGenerate
```

以及 actions：

```ts
collapsePanel
expandPanel
setPanelStatus
setBottomLog
setLanguage
setAutoGenerate
```

### 验收标准

1. 面板收起展开状态可管理。
2. Header 状态可更新。
3. BottomLog 可更新。
4. 语言和 autoGenerate 可存储。

## TASK-0205 实现 Settings 持久化

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 模块 | Settings |
| 依赖 | TASK-0201, TASK-0204 |
| 目标 | 保存用户设置 |

### 任务内容

1. 保存 language。
2. 保存 autoGenerate。
3. 保存 panelCollapsed。
4. 初始化时读取 settings。

### 验收标准

1. 刷新页面后语言设置保留。
2. 刷新页面后 autoGenerate 设置保留。
3. 刷新页面后收起状态可恢复，可选。

## 8. Phase 3：ChatAdapter 与消息监听

## TASK-0301 实现 ConversationDetector

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | ChatAdapter |
| 依赖 | TASK-0102 |
| 目标 | 生成稳定 conversationKey |

### 任务内容

按优先级生成 conversationKey：

```text
URL conversation id
↓
页面可识别会话 id
↓
URL + title hash
↓
local generated session id
```

### 验收标准

1. 同一会话刷新后 conversationKey 稳定。
2. 不同会话 conversationKey 不同。
3. 无法识别时可生成 fallback key。

## TASK-0302 实现 MessageScanner

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | ChatAdapter |
| 依赖 | TASK-0301 |
| 目标 | 扫描当前页面已有消息 |

### 任务内容

1. 识别用户消息 DOM。
2. 识别 AI 消息 DOM。
3. 提取文本。
4. 生成 orderIndex。
5. 生成 textHash / textPreview。
6. 生成 MessageRef。

### 验收标准

1. 可以识别历史用户消息。
2. 可以识别历史 AI 消息。
3. 消息顺序正确。
4. 不保存完整消息原文。

## TASK-0303 实现 MessageObserver

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | ChatAdapter |
| 依赖 | TASK-0302 |
| 目标 | 监听新增消息和消息变化 |

### 任务内容

1. 使用 MutationObserver。
2. debounce DOM 变化。
3. 监听新增用户消息。
4. 监听新增 AI 消息。
5. 支持增量扫描。

### 验收标准

1. 用户发送新消息后能被监听。
2. AI 回复生成后能被监听。
3. 长对话下无明显卡顿。

## TASK-0304 实现 MessageNormalizer

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | ChatAdapter |
| 依赖 | TASK-0302 |
| 目标 | 将 DOM 消息转换为 NormalizedMessage |

### 任务内容

输出：

```ts
NormalizedMessage = {
  messageRefId,
  role,
  orderIndex,
  text,
  element,
  textHash,
  textPreview
}
```

### 验收标准

1. NormalizedMessage 格式稳定。
2. role 正确。
3. orderIndex 正确。
4. textPreview 为短文本，不是完整原文。

## TASK-0305 实现 ChatAdapter 门面接口

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | ChatAdapter |
| 依赖 | TASK-0301, TASK-0302, TASK-0303, TASK-0304 |
| 目标 | 对外提供统一 ChatAdapter API |

### 任务内容

实现：

```ts
getConversationKey
getMessages
observeMessageChanges
getMessageText
scrollToMessage
scrollToAnchor
```

### 验收标准

1. UI 和 service 可通过 ChatAdapter 访问 Chat 页面。
2. ChatAdapter 失败时返回明确错误。
3. 不影响官方 Chat 使用。

## 9. Phase 4：Concept Map Canvas

## TASK-0401 实现 ConceptMapCanvas 基础组件

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Canvas |
| 依赖 | TASK-0203 |
| 目标 | 封装 React Flow 画布 |

### 任务内容

1. 渲染 ReactFlow。
2. 注册 nodeTypes。
3. 注册 edgeTypes。
4. 渲染 Background / Controls。
5. 读取 store nodes / edges。

### 验收标准

1. Canvas 能正常显示。
2. React Flow Controls 可用。
3. 空 nodes / edges 时不报错。

## TASK-0402 实现 Domain Model 到 React Flow Model 转换

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Canvas |
| 依赖 | TASK-0401 |
| 目标 | 将 ConceptMapNode / Edge 转换为 React Flow 数据 |

### 任务内容

实现：

```ts
mapDomainNodesToFlowNodes
mapDomainEdgesToFlowEdges
```

规则：

1. removed nodes 不转换。
2. removed edges 不转换。
3. node.layout 转为 position。
4. edge.label 转为 label。

### 验收标准

1. nodes 正确渲染。
2. edges 正确渲染。
3. removed 数据不显示。

## TASK-0403 实现 ConceptMapNode

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Node |
| 依赖 | TASK-0401 |
| 目标 | 实现轻量节点组件 |

### 任务内容

1. 默认只显示 title。
2. selected 样式。
3. source_lost 图标。
4. React Flow Handle。
5. 双击标题进入编辑。
6. Enter 保存。
7. Esc 取消。
8. 空标题校验。

### 验收标准

1. 节点默认只显示标题。
2. 双击可重命名。
3. 标题保存后进入 store。
4. source_lost 可显示 ⚠。

## TASK-0404 实现 ConceptMapEdge

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Edge |
| 依赖 | TASK-0401 |
| 目标 | 实现关系线展示 |

### 任务内容

1. 显示边线。
2. 显示 relation label。
3. 支持 selected 样式。
4. AI 生成关系可用弱线条。

### 验收标准

1. edge 正确连接两个节点。
2. label 正确显示。
3. 点击 edge 可 selected。

## TASK-0405 实现初始简单布局算法

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 模块 | Layout |
| 依赖 | TASK-0402 |
| 目标 | 为 AI 生成节点提供初始位置 |

### 任务内容

布局规则：

```text
question node：上方
answer node：中间
answer_outline nodes：answer 下方
concept nodes：右侧或周边
```

### 验收标准

1. 首次生成节点不重叠严重。
2. 用户已拖拽节点不会被重排。
3. 新增节点放在空白区域。

## 10. Phase 5：节点与关系直接操作

## TASK-0501 实现节点选中逻辑

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Interaction |
| 依赖 | TASK-0403 |
| 目标 | 单击节点只选中，不跳转原文 |

### 任务内容

1. onNodeClick 调用 selectNode。
2. 不触发 SourceLocator。
3. 同时清除 selectedEdgeId。
4. 点击空白画布 clearSelection。

### 验收标准

1. 单击节点显示 selected。
2. Floating Toolbar 显示。
3. 左侧 Chat 不滚动。
4. 同一时间只有一个 selected node。

## TASK-0502 实现 NodeFloatingToolbar

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Interaction |
| 依赖 | TASK-0501 |
| 目标 | 实现 Canvas overlay 工具条 |

### 任务内容

1. 作为 ConceptMapCanvas overlay。
2. 根据 selectedNodeId 显示。
3. 计算节点 screen position。
4. 默认显示在节点上方。
5. 靠边避让。
6. 提供：重命名、原文、连接、删除、更多。

### 验收标准

1. 选中节点后工具条显示。
2. 点击空白后隐藏。
3. 节点进入编辑态后隐藏。
4. 工具条不被 React Flow 裁切。

## TASK-0503 实现节点重命名

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Interaction |
| 依赖 | TASK-0403, TASK-0203 |
| 目标 | 支持双击和 Toolbar 重命名 |

### 任务内容

1. 双击标题进入编辑态。
2. Toolbar 点击重命名进入编辑态。
3. Enter 保存。
4. Esc 取消。
5. blur 默认保存。
6. 空标题提示。
7. 保存后 status = edited，updatedBy = user。

### 验收标准

1. 重命名成功。
2. 刷新后标题保留。
3. 空标题不能保存。

## TASK-0504 实现节点拖拽保存 layout

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Interaction |
| 依赖 | TASK-0401, TASK-0203 |
| 目标 | 用户拖拽节点后保存位置 |

### 任务内容

1. onNodeDragStop 获取 position。
2. 调用 moveNode。
3. 更新 layout。
4. 持久化到 IndexedDB。
5. 拖拽中不写库。

### 验收标准

1. 节点可拖拽。
2. 刷新后位置保留。
3. 拖拽不触发原文跳转。

## TASK-0505 实现节点删除与撤销

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Interaction |
| 依赖 | TASK-0203 |
| 目标 | 删除节点并支持最近一次撤销 |

### 任务内容

1. Delete / Backspace 删除 selected node。
2. Toolbar 删除按钮删除节点。
3. node.status = removed。
4. 相关 edge.status = removed。
5. Toast 显示撤销。
6. 实现最近一次撤销。

### 验收标准

1. 删除节点后主视图隐藏。
2. 刷新后仍隐藏。
3. 点击撤销后恢复。

## TASK-0506 实现节点连接创建关系

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Interaction |
| 依赖 | TASK-0401, TASK-0203 |
| 目标 | 允许用户从节点拖线创建关系 |

### 任务内容

1. 节点显示连接 Handle。
2. onConnect 触发关系创建流程。
3. 禁止连接自己。
4. 连接完成后打开 EdgeEditPopover。
5. 默认 relationType = relates_to。
6. 保存后创建 edge。

### 验收标准

1. 可从节点 A 连接到节点 B。
2. 不能连接自己。
3. 保存后关系显示在画布。
4. 刷新后关系保留。

## TASK-0507 实现 EdgeEditPopover

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Interaction |
| 依赖 | TASK-0404 |
| 目标 | 编辑关系类型和名称 |

### 任务内容

1. 点击关系线 selected。
2. 计算关系中点。
3. 显示 Popover。
4. 修改 relationType。
5. 修改 label。
6. 保存后 status = edited。
7. 删除关系。

### 验收标准

1. 点击关系线可打开编辑。
2. 修改 label 后画布更新。
3. Delete 可删除关系。
4. 刷新后修改保留。

## 11. Phase 6：AI 结构化生成流程

## TASK-0601 实现 Background 消息通信

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Background |
| 依赖 | TASK-0101 |
| 目标 | Content Script 与 Background 通信 |

### 任务内容

1. 定义 chrome.runtime.sendMessage 类型。
2. Background 接收 STRUCTURE_TURN 请求。
3. Background 返回成功 / 失败。
4. 支持 timeout。

### 验收标准

1. Content Script 可发送请求。
2. Background 可返回结构化结果。
3. 错误可返回统一格式。

## TASK-0602 实现 AIStucturingService

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | AI Service |
| 依赖 | TASK-0601 |
| 目标 | 调用 AI 结构化服务生成 nodes / edges |

### 任务内容

1. 构造 StructureTurnInput。
2. 调用 AI API。
3. 解析 JSON。
4. 校验 nodes / edges。
5. 处理非法 JSON。
6. 处理超时和网络错误。

### 验收标准

1. 成功返回合法 nodes / edges。
2. 非法 JSON 进入失败状态。
3. 超时进入失败状态。
4. 请求只包含当前轮问答。

## TASK-0603 实现 AI 回复完成判断

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Generation |
| 依赖 | TASK-0303 |
| 目标 | AI 回复完成后触发解析 |

### 任务内容

1. 优先检测官方生成状态 DOM。
2. fallback 到文本稳定策略。
3. 文本 1.5-2 秒不变化后认为完成。
4. 同一 messageRefId 只自动解析一次。

### 验收标准

1. 流式生成中不解析。
2. 回复完成后自动解析。
3. 同一轮不重复解析。

## TASK-0604 实现 GenerationController

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Generation |
| 依赖 | TASK-0602, TASK-0603, TASK-0203 |
| 目标 | 串联生成流程 |

### 任务内容

1. 获取当前轮 user / assistant message。
2. 设置 panelStatus = generating。
3. 调用 AIStucturingService。
4. 生成 ConversationRef / MessageRef / Node / Edge。
5. 调用 addGeneratedDraft。
6. 写入 BottomLog。
7. 失败时进入 GenerationErrorState。

### 验收标准

1. AI 回复完成后生成 Concept Map 草稿。
2. 生成失败不影响旧图谱。
3. BottomLog 显示生成结果。

## TASK-0605 实现重新解析

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 模块 | Generation |
| 依赖 | TASK-0604 |
| 目标 | 支持 Header 与节点来源重新解析 |

### 任务内容

1. Header ↻ 重新解析最近一轮。
2. More Menu 重新解析来源。
3. 不覆盖 edited / user-created nodes。
4. 不覆盖用户 layout。
5. 使用 fingerprint 做简单去重。

### 验收标准

1. 重新解析可生成新增节点。
2. 用户编辑标题不被覆盖。
3. 用户布局不被打乱。
4. removed 节点不自动复活。

## 12. Phase 7：SourceLocator 原文定位

## TASK-0701 实现 SourceLocator 基础接口

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | SourceLocator |
| 依赖 | TASK-0305 |
| 目标 | 提供节点到原文的定位能力 |

### 任务内容

实现：

```ts
locateNodeSource(node)
locateSource(source)
```

### 验收标准

1. 能识别 node.sources。
2. 能根据 sourceType 调用 ChatAdapter。
3. 返回 LocateResult。

## TASK-0702 实现 question / answer 节点跳转

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | SourceLocator |
| 依赖 | TASK-0701 |
| 目标 | 跳转到用户消息或 AI 回复整体 |

### 任务内容

1. user_message → scrollToMessage。
2. assistant_message → scrollToMessage。
3. scrollIntoView。
4. 添加高亮 class。
5. 1.5-3 秒后移除高亮。

### 验收标准

1. question node 可跳转用户消息。
2. answer node 可跳转 AI 回复。
3. 原文高亮。

## TASK-0703 实现 answer_outline 段落跳转

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | SourceLocator |
| 依赖 | TASK-0701 |
| 目标 | 通过 SourceAnchor 跳转回答段落 |

### 任务内容

1. 支持 blockId。
2. 支持 headingText。
3. 支持 textHash / textQuote。
4. 支持 offset fallback。
5. anchor 找不到时跳转完整回答。

### 验收标准

1. outline 节点可跳转段落。
2. anchor 失败时跳转完整回答。
3. 有明确提示。

## TASK-0704 实现 concept 多来源跳转

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 模块 | SourceLocator |
| 依赖 | TASK-0701 |
| 目标 | 处理 concept node 多来源 |

### 任务内容

1. 0 来源：Toast 暂无来源。
2. 1 来源：直接跳转。
3. 多来源：显示 SourceListPopover。
4. 用户选择来源后跳转。

### 验收标准

1. concept 单来源可直接跳转。
2. 多来源显示列表。
3. 选择来源后定位原文。

## TASK-0705 实现 source_lost 处理

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | SourceLocator |
| 依赖 | TASK-0701, TASK-0203 |
| 目标 | 原文定位失败时保留节点并标记 |

### 任务内容

1. 定位失败时 markSourceLost。
2. sourceStatus = lost。
3. 节点显示 ⚠。
4. Toast 提示。
5. 节点仍可编辑。

### 验收标准

1. 定位失败不删除节点。
2. 节点仍可拖拽、重命名、连接。
3. 刷新后 source_lost 状态保留。

## 13. Phase 8：刷新恢复与历史会话

## TASK-0801 实现会话恢复流程

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Restore |
| 依赖 | TASK-0202, TASK-0301 |
| 目标 | 页面刷新后恢复当前会话 Concept Map |

### 任务内容

1. 获取 conversationKey。
2. 查询 Repository。
3. 恢复 nodes / edges / messageRefs。
4. 写入 ConceptMapStore。
5. 渲染 Concept Map。

### 验收标准

1. 刷新后节点恢复。
2. 刷新后关系恢复。
3. 用户编辑标题恢复。
4. 用户布局恢复。

## TASK-0802 实现 MessageRef 恢复匹配

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 模块 | Restore |
| 依赖 | TASK-0302, TASK-0305 |
| 目标 | 恢复节点与官方 Chat 原文的定位关系 |

### 任务内容

匹配优先级：

```text
domSelector / domPath
↓
conversationKey + role + orderIndex
↓
textHash
↓
textPreview
```

### 验收标准

1. 大部分历史节点可恢复原文定位。
2. 无法恢复时 sourceStatus = lost。
3. 节点不丢失。

## TASK-0803 实现历史会话打开恢复

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 模块 | Restore |
| 依赖 | TASK-0801, TASK-0802 |
| 目标 | 用户打开历史 Chat 时恢复对应 map |

### 任务内容

1. 识别历史会话 conversationKey。
2. 读取本地 map。
3. 尝试恢复定位。
4. 显示恢复状态。

### 验收标准

1. 历史会话 Concept Map 可恢复。
2. source_lost 节点保留。
3. 可继续编辑恢复后的 map。

## 14. Phase 9：异常、隐私与性能处理

## TASK-0901 实现错误模型与 ErrorBoundary

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Error Handling |
| 依赖 | TASK-0104 |
| 目标 | 插件错误不影响官方 Chat |

### 任务内容

1. 定义 AppError。
2. ThinkingPanel 外层加 ErrorBoundary。
3. UI 崩溃时显示错误面板。
4. 提供刷新插件入口。

### 验收标准

1. React 组件崩溃不影响官方 Chat。
2. 错误面板可显示。

## TASK-0902 实现 AdapterErrorState

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Error Handling |
| 依赖 | TASK-0305 |
| 目标 | Chat DOM 识别失败时显示 fallback |

### 任务内容

1. ChatAdapter 初始化失败时设置 panelStatus = adapter_error。
2. 显示错误提示。
3. 官方 Chat 保持可用。

### 验收标准

1. DOM 识别失败有明确提示。
2. 官方 Chat 不受影响。

## TASK-0903 实现 GenerationErrorState

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Error Handling |
| 依赖 | TASK-0604 |
| 目标 | 结构化生成失败时有明确状态 |

### 任务内容

1. 生成失败显示错误状态。
2. 提供重试。
3. 提供忽略本轮。
4. 不影响旧图谱。

### 验收标准

1. 生成失败不清空旧图谱。
2. 用户可重试。

## TASK-0904 实现隐私边界检查

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | Privacy |
| 依赖 | TASK-0202, TASK-0604 |
| 目标 | 确保不长期存储完整问答 |

### 任务内容

1. Repository 不保存完整 user content。
2. Repository 不保存完整 assistant content。
3. 只保存 textHash / textPreview / textQuote。
4. 结构化请求只发送当前轮问答。

### 验收标准

1. IndexedDB 中不存在完整问答原文。
2. 请求 payload 不包含完整历史会话。

## TASK-0905 实现性能优化基础策略

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 模块 | Performance |
| 依赖 | TASK-0303, TASK-0504 |
| 目标 | 降低长对话和画布操作卡顿 |

### 任务内容

1. MutationObserver debounce。
2. 长对话增量扫描。
3. 拖拽结束后写库。
4. AI 生成结果批量写入。
5. removed 节点不渲染。

### 验收标准

1. 长对话下官方 Chat 无明显卡顿。
2. 节点拖拽流畅。
3. IndexedDB 写入不高频。

## TASK-0906 实现 i18n 基础能力

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 模块 | i18n |
| 依赖 | TASK-0104, TASK-0205 |
| 目标 | 支持中文 / English UI 切换 |

### 任务内容

1. 创建 zh / en 文案文件。
2. UI 组件使用 i18n key。
3. SettingsMenu 提供语言切换。
4. 切换后 UI 文案立即生效。
5. 节点标题不随 UI 语言变化。

### 验收标准

1. 中文 UI 可显示。
2. 英文 UI 可显示。
3. 节点标题不被自动翻译。

## 15. Phase 10：测试与验收

## TASK-1001 执行 P0 回归测试

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | QA |
| 依赖 | 所有 P0 开发任务 |
| 目标 | 验证 MVP 核心闭环 |

### 任务内容

执行测试用例文档中的 P0 回归测试。

重点覆盖：

1. 插件注入。
2. 4:6 布局。
3. ChatAdapter。
4. AI 回复完成判断。
5. AI 结构化生成。
6. Canvas 渲染。
7. 节点重命名 / 拖拽 / 删除。
8. 关系创建 / 编辑。
9. 原文跳转。
10. IndexedDB 恢复。
11. 隐私边界。

### 验收标准

1. 所有 P0 测试用例通过。
2. 无阻塞级缺陷。
3. 插件失败不影响官方 Chat。

## TASK-1002 执行 P1 测试

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 模块 | QA |
| 依赖 | 所有 P1 开发任务 |
| 目标 | 验证重要体验能力 |

### 任务内容

执行 P1 测试用例。

### 验收标准

1. P1 测试通过率不低于 80%。
2. 未通过项有 fallback 或记录为已知问题。

## TASK-1003 修复阻塞缺陷

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 模块 | QA |
| 依赖 | TASK-1001 |
| 目标 | 修复影响 MVP 发布的缺陷 |

### 阻塞缺陷定义

1. 插件无法注入。
2. 官方 Chat 无法正常使用。
3. ChatAdapter 无法识别消息。
4. AI 回复完成后无法生成节点。
5. 节点无法渲染。
6. 用户编辑结果无法保存。
7. 隐私边界被破坏。

### 验收标准

1. 所有阻塞缺陷关闭。
2. 回归测试通过。

## 16. P0 任务依赖链

```text
TASK-0001 初始化项目工程
↓
TASK-0101 配置 Manifest V3
↓
TASK-0102 Content Script 入口
↓
TASK-0103 Shadow DOM 容器
↓
TASK-0104 ThinkingPanel 基础布局
↓
TASK-0201 Dexie 初始化
↓
TASK-0202 Repository
↓
TASK-0203 ConceptMapStore
↓
TASK-0301 ConversationDetector
↓
TASK-0302 MessageScanner
↓
TASK-0303 MessageObserver
↓
TASK-0305 ChatAdapter 门面
↓
TASK-0401 ConceptMapCanvas
↓
TASK-0403 ConceptMapNode
↓
TASK-0501 节点选中
↓
TASK-0502 Floating Toolbar
↓
TASK-0503 节点重命名
↓
TASK-0504 节点拖拽
↓
TASK-0505 节点删除
↓
TASK-0506 节点连接
↓
TASK-0507 关系编辑
↓
TASK-0601 Background 通信
↓
TASK-0602 AI Structuring Service
↓
TASK-0603 AI 回复完成判断
↓
TASK-0604 GenerationController
↓
TASK-0701 SourceLocator
↓
TASK-0702 question / answer 跳转
↓
TASK-0703 outline 跳转
↓
TASK-0801 会话恢复
↓
TASK-0901 ErrorBoundary
↓
TASK-0902 AdapterErrorState
↓
TASK-0903 GenerationErrorState
↓
TASK-0904 隐私边界检查
↓
TASK-1001 P0 回归测试
```

## 17. MVP 最小开发闭环

如果需要进一步压缩开发范围，最小闭环可以只完成以下任务：

```text
1. 插件注入
2. Shadow DOM + ThinkingPanel
3. ChatAdapter 识别当前轮问答
4. 手动 mock AI Structuring Service 返回 nodes / edges
5. React Flow 渲染节点和关系
6. 节点选中 + Floating Toolbar
7. 节点重命名 / 拖拽 / 删除
8. 节点连接 / 关系编辑
9. 点击原文定位 Chat 消息
10. IndexedDB 保存和刷新恢复
```

该闭环成立后，再补：

1. 真实 AI Structuring Service。
2. AI 回复完成自动判断。
3. 多来源跳转。
4. 重新解析。
5. i18n。
6. 异常状态完善。

## 18. 开发里程碑建议

## Milestone 1：插件可注入

目标：右侧 Thinking Panel 能出现在官方 Chat 页面。

包含任务：

1. TASK-0001
2. TASK-0101
3. TASK-0102
4. TASK-0103
5. TASK-0104
6. TASK-0106

## Milestone 2：本地 Concept Map 可渲染

目标：使用 mock nodes / edges 在右侧渲染 Concept Map。

包含任务：

1. TASK-0003
2. TASK-0201
3. TASK-0202
4. TASK-0203
5. TASK-0401
6. TASK-0402
7. TASK-0403
8. TASK-0404

## Milestone 3：节点和关系可编辑

目标：完成直接操作式 Concept Map 编辑。

包含任务：

1. TASK-0501
2. TASK-0502
3. TASK-0503
4. TASK-0504
5. TASK-0505
6. TASK-0506
7. TASK-0507

## Milestone 4：对接官方 Chat

目标：能够识别官方 Chat 消息并跳转原文。

包含任务：

1. TASK-0301
2. TASK-0302
3. TASK-0303
4. TASK-0304
5. TASK-0305
6. TASK-0701
7. TASK-0702
8. TASK-0703

## Milestone 5：AI 生成闭环

目标：AI 回复完成后生成 Concept Map 草稿。

包含任务：

1. TASK-0601
2. TASK-0602
3. TASK-0603
4. TASK-0604

## Milestone 6：恢复、异常与验收

目标：完成刷新恢复、异常处理、隐私边界和 P0 测试。

包含任务：

1. TASK-0801
2. TASK-0802
3. TASK-0901
4. TASK-0902
5. TASK-0903
6. TASK-0904
7. TASK-1001
8. TASK-1003

## 19. 发布前检查清单

发布 MVP 前必须确认：

```text
□ 插件只在目标 Chat 页面注入
□ Thinking Panel 可展开和收起
□ 官方 Chat 输入和滚动不受影响
□ ChatAdapter 能识别用户消息和 AI 消息
□ AI 回复完成后能生成节点和关系
□ 节点默认只展示标题
□ 节点单击只选中，不跳转原文
□ Floating Toolbar 可用
□ 节点可重命名
□ 节点可拖拽
□ 节点可删除
□ 节点可连接
□ 关系可编辑
□ question / answer / outline 节点可定位原文
□ 页面刷新后节点、关系和布局可恢复
□ 生成失败不影响旧图谱
□ DOM 识别失败不影响官方 Chat
□ 不长期存储完整用户提问和 AI 回答
□ P0 测试用例全部通过
```
