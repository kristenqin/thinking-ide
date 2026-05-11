# Thinking IDE 最小 MVP 项目文档 v0.2

## 1. 项目名称

**Thinking IDE**

## 2. 一句话定位

**Thinking IDE 是一个嵌入在官方 AI Chat 右侧的 Concept Map 工作台，用 AI 将聊天内容转化为可直接操作的概念地图草稿，并由用户通过拖拽、重命名、连接和删除等方式主动整理成自己的认知模型。**

## 3. 项目背景

大多数用户使用 AI 的主要场景发生在 Chat 界面中。用户通过连续提问推进思考，但聊天记录通常以线性消息列表呈现，难以表达问题、回答、概念和结论之间的层级、关联与演进关系。

当一次对话包含长回答、多轮追问和持续推导时，用户会遇到以下问题：

1. 难以快速理解长回答的结构。
2. 难以回溯某个关键问题或关键回答段落。
3. 难以看清多轮追问之间的关系。
4. 难以将聊天过程沉淀成可复用的认知模型。
5. 难以在 AI 生成内容的基础上主动整理自己的概念结构。

Thinking IDE 在官方 AI Chat 页面右侧提供一个 Concept Map 工作台，将聊天过程中产生的问题、回答、回答结构项和关键概念转化为可操作的节点与关系，帮助用户在对话过程中逐步整理自己的认知模型。

## 4. 产品定位

Thinking IDE 以浏览器插件 / 页面增强插件的形式运行在官方 AI Chat 页面右侧。

```text
官方 Chat 页面
├── 官方 Chat Area
│   ├── 用户提问
│   ├── AI 回答
│   └── 官方输入框
│
└── Thinking IDE 注入的右侧 Thinking Panel
    ├── Concept Map 草稿
    ├── 节点直接操作
    ├── 关系编辑
    ├── 原文定位
    └── 底部弱提示
```

Thinking IDE 聚焦于 Chat Area 与 Thinking Panel 的连接：读取官方 Chat 页面中的对话内容，生成可编辑的 Concept Map 草稿，并支持用户通过节点跳转回原始聊天内容。

核心模块包括：

1. **Chat Adapter**：识别、读取、定位官方 Chat Area 中的消息。
2. **Thinking Panel**：展示和编辑 Concept Map 草稿。
3. **Concept Map Engine**：管理节点、关系、状态和布局。
4. **AI Structuring Service**：从聊天内容中生成节点和关系草稿。

## 5. 产品原则

### 5.1 用户主导原则

Thinking IDE 将 AI 生成结果视为可编辑草稿。

AI 负责：

```text
提取概念
生成节点草稿
建议关系草稿
提供初始结构
```

用户负责：

```text
判断哪些节点值得保留
修改节点命名
调整节点位置
连接节点关系
删除无用结构
重组自己的认知模型
```

核心原则是：

> **AI 生成草稿，用户完成建模。**

### 5.2 Concept Map 优先原则

Thinking IDE 的目标是辅助用户从聊天材料中搭建 Concept Map。

Concept Map 在产品体验上强调：

1. 用户主动选择概念。
2. 用户主动连接概念。
3. 用户主动定义关系。
4. 用户主动调整结构。
5. AI 辅助降低整理成本。

### 5.3 统一节点管理原则

问题、回答、回答结构项、关键概念、结论、待办和用户手动创建的想法都统一抽象为节点。

```text
问题是节点
回答是节点
回答中的 outline item 是节点
概念是节点
结论是节点
待办是节点
用户手动创建的想法也是节点
```

节点之间通过关系边表达组织方式。

### 5.4 直接操作优先原则

Thinking IDE 的节点不应像后台管理系统中的记录项一样依赖下拉菜单操作，而应更接近 Concept Map 工具的直接操作体验。

主操作模型：

```text
点击节点 → 选中节点，并尝试定位原文
双击标题 → 重命名
拖拽节点 → 调整位置
拖拽连接点 → 创建关系
点击关系线 → 编辑关系
Delete / Backspace → 删除选中节点或关系
选中节点 → 显示 Floating Toolbar
更多操作 → Dropdown / Context Menu
```

Dropdown / Context Menu 只承载低频操作，例如：

1. 转为 Concept
2. 转为 Claim
3. 重新解析来源
4. 查看属性
5. 删除节点

### 5.5 状态弱化原则

系统仍然需要在数据层记录节点和关系状态，但不应把这些状态作为节点主视觉。

数据层可以保留：

```text
candidate：AI 生成，尚未被用户主动编辑
edited：用户已编辑
removed / rejected：用户已删除或移除
source_lost：原文定位失效
```

视觉层原则：

1. 节点默认只展示概念标题。
2. 不默认展示 role / status 文案。
3. 不强制用户逐个接受 AI 生成节点。
4. 用户保留下来的节点自然成为当前 Concept Map 的一部分。
5. 用户不需要的节点通过删除移出主视图。
6. source_lost 这类影响功能的状态可用轻量图标和 Tooltip 表达。

## 6. 产品目标

### 6.1 MVP 核心目标

在不改变用户原有官方 Chat 使用习惯的前提下，Thinking IDE 完成以下能力：

1. 在官方 Chat 页面右侧注入 Thinking Panel。
2. 采用 4:6 布局，让 Thinking Panel 成为主要思考空间。
3. 从官方 Chat Area 中读取用户提问和 AI 回答。
4. 将用户提问生成 question node。
5. 将 AI 回答生成 answer node。
6. 将 AI 回答中的结构项生成 answer_outline node。
7. 从用户提问和 AI 回答中提取 concept node。
8. 自动建议节点之间的关系。
9. 支持用户点击节点后跳转到官方 Chat 页面中对应的原始问题或回答段落。
10. 支持用户通过拖拽、重命名、连接、删除等直接操作整理节点。
11. 支持用户将 AI 生成的结构草稿逐步整理成自己的 Concept Map。

### 6.2 MVP 边界

MVP 阶段聚焦右侧 Concept Map 工作台与官方 Chat Area 的对接，暂不包含以下能力：

1. 独立 AI Chat 主界面。
2. 独立聊天输入框。
3. 模型调用和 AI 回复生成能力。
4. 用户账号和聊天历史系统。
5. 完整跨会话知识库。
6. 复杂图谱自动推理。
7. 多人协作。
8. 大型自由白板。
9. 节点版本管理。
10. 完整文档发布系统。
11. 导出 PPT / 图片 / Markdown。
12. 节点颜色体系。
13. 节点分组。

MVP 需要验证的核心假设是：

> 用户是否需要在 AI Chat 右侧拥有一个 AI 辅助生成、但由用户通过直接操作主动整理的 Concept Map 工作台？

## 7. 目标用户

Thinking IDE 的核心用户是经常使用 GPT / AI Chat 来构建认知模型的人。

第一阶段重点服务与设计、创造、分析、表达相关的人群，包括：

1. UI/UX 设计师
2. 产品经理
3. 内容创作者
4. 研究型学习者
5. 知识型工作者
6. 程序员 / 技术方案设计者
7. 需要长期沉淀方法论的人

这类用户的共同特征是：

1. 经常围绕复杂主题连续追问 AI。
2. 使用 AI 的目的不是单纯获取答案，而是构建认知模型。
3. 经常在一次长 Session 中完成调研、分析、推导和方案形成。
4. 需要从 AI 输出中抽取关键概念、关系、观点和结构。
5. 经常把 AI 输出进一步整理成文档、PPT、思维导图或概念地图。
6. 希望在思考过程中同步整理结构，而不是等对话结束后再手动整理。
7. 希望 AI 降低整理成本，同时保留自己的结构判断权。

## 8. 核心使用场景

### 8.1 长对话中的结构定位

用户在长 Session 中持续追问，聊天内容越来越长，滚动查找成本快速上升。

Thinking IDE 在右侧持续维护 Concept Map 草稿。用户可以通过节点直接定位到对应的问题、回答或回答段落，减少长距离滚动和上下文丢失。

核心价值：

1. 降低长对话中的切换成本。
2. 降低查找原始上下文的定位成本。
3. 避免思考脉络在多轮追问中丢失。
4. 提高长 Session 的收益成本比。

### 8.2 从长回答中挑选概念

用户向 AI 提问后，AI 生成一段较长回答。Thinking IDE 从回答中提取 answer node、answer_outline node 和 concept node。

用户可以删除不重要的节点，重命名关键概念，拖拽调整结构，连接相关概念，点击节点跳回回答原文。

核心价值：

1. 降低从长回答中抽取结构的成本。
2. 降低手动文档化成本。
3. 让用户在阅读回答的同时完成概念沉淀。

### 8.3 多轮追问形成概念地图

用户围绕一个主题连续追问。Thinking IDE 生成一批问题节点、回答节点、概念节点和关系。

用户可以判断哪些问题属于同一主题，哪些概念需要合并，哪些关系需要重新命名，哪个节点应该作为中心概念，哪些节点只是临时过程。

核心价值：

1. 将多轮追问过程转化为可视化认知结构。
2. 将严格串行的“先调研、后输出导图”改为“边思考、边形成 Concept Map 草稿”。
3. 实现宏观上的并行构建：对话推进和结构整理同时发生。
4. 保留微观上的串行控制：用户仍然逐步判断、调整和连接节点关系。

### 8.4 用户主动连接概念

Thinking IDE 从用户提问和 AI 回答中提取关键概念，并将概念作为可操作节点呈现。

用户可以把概念节点连接到多个问题、回答、观点或结论节点上，逐渐形成自己的认知模型。

## 9. MVP 功能范围

### 9.1 官方 Chat Area 对接

Chat 主区域直接使用官方 Chat 页面已有的 Chat Area。

Thinking IDE 需要识别和对接官方 Chat Area。

对接目标：

1. 识别用户消息 DOM。
2. 识别 AI 回复 DOM。
3. 为每一轮问答生成稳定的本地 messageRef。
4. 监听新增消息。
5. 判断 AI 回复是否生成完成。
6. 读取用户提问文本。
7. 读取 AI 回答文本。
8. 为 AI 回答中的段落或标题建立 anchor。
9. 支持点击节点后滚动到对应消息或段落。
10. 避免额外复制存储完整用户提问和完整 AI 回答。

页面适配层需要单独抽象，避免业务逻辑和 DOM 选择器强绑定。

```text
Official Chat DOM
↓
Chat Adapter
↓
Normalized Message Model
↓
Thinking Panel
```

### 9.2 右侧 Thinking Panel

右侧 Thinking Panel 是统一的 Concept Map 工作台。

在这个面板中：

1. 用户提问可以成为 question node。
2. AI 完整回答可以成为 answer node。
3. AI 回答中的 Outline Item 可以成为 answer_outline node。
4. 用户提问和 AI 回答中的关键概念可以成为 concept node。
5. 多轮追问链路通过节点之间的 edge 表达。
6. 问题与回答之间通过 answered_by edge 连接。
7. 回答与回答结构之间通过 contains edge 连接。
8. 概念与问题、回答、回答结构之间通过 mentions / relates_to edge 连接。
9. AI 生成节点和关系草稿，用户通过直接操作进行整理。

### 9.3 最小界面形态

MVP 采用基于 React Flow 的简化 Concept Map Canvas。

```text
┌──────────────────────────────┬──────────────────────────────────────────────┐
│                              │                                              │
│      Official Chat Area      │              Thinking Panel                  │
│                              │                                              │
│  User Question               │   Concept Map Canvas                         │
│  AI Answer                   │                                              │
│  User Question               │   项目定位讨论 → MVP 定义建议                 │
│  AI Answer                   │             ↓                                │
│                              │       Concept Map 工作台                      │
│  Chat Input                  │                                              │
│                              │   Bottom Log                                 │
│                              │   Generated 8 nodes · 4 relations            │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

### 9.4 节点点击逻辑

用户点击右侧 Thinking Panel 中的节点后，Chat 主区域定位到原始内容。

#### 点击 question node

```text
点击 question node
↓
根据 messageRefId
↓
Chat 主区域滚动到对应用户提问
```

#### 点击 answer node

```text
点击 answer node
↓
根据 messageRefId
↓
Chat 主区域滚动到对应 AI 完整回答
```

#### 点击 answer_outline node

```text
点击 answer_outline node
↓
根据 messageRefId + anchor
↓
Chat 主区域滚动到对应 AI 回答段落
```

#### 点击 concept node

```text
点击 concept node
↓
如果只有一个来源，直接跳转
↓
如果有多个来源，展示来源列表
↓
用户选择来源后跳转到对应原文
```

### 9.5 原文展示原则

完整提问和完整回答保留在官方 Chat 主区域中。

右侧 Thinking Panel 负责 Concept Map 构建、结构导航和关系编辑。节点点击跳转到原文位置，避免在右侧重复回显完整问答内容。

### 9.6 节点编辑能力

MVP 阶段支持直接操作式编辑：

1. 点击节点：选中节点，并尝试定位原文。
2. 双击节点标题：重命名。
3. 拖拽节点：调整节点位置。
4. 从节点连接点拖线：创建关系。
5. 点击关系线：编辑关系。
6. Delete / Backspace：删除选中节点或关系。
7. Floating Toolbar：提供重命名、原文、连接、更多等高频操作。
8. Dropdown / Context Menu：承载转为 Concept、转为 Claim、重新解析来源、查看属性等低频操作。

## 10. 信息架构

```text
Thinking IDE
├── Official Chat Area
│   ├── User Message
│   └── Assistant Message
│
└── Thinking Panel
    └── Concept Map Workspace
        ├── Canvas
        │   ├── Node
        │   ├── Edge
        │   └── Floating Toolbar
        │
        ├── Node Role
        │   ├── Question
        │   ├── Answer
        │   ├── Answer Outline
        │   ├── Concept
        │   ├── Claim
        │   └── Todo
        │
        ├── Edge Type
        │   ├── answered_by
        │   ├── contains
        │   ├── mentions
        │   ├── relates_to
        │   ├── follow_up
        │   └── supports
        │
        └── Source Anchor
            ├── messageRefId
            ├── messageBlockAnchor
            └── derivedFromNodeIds
```

## 11. 核心数据设计

### 11.1 MessageRef

```ts
type MessageRef = {
  id: string
  conversationKey: string
  role: 'user' | 'assistant'

  domSelector?: string
  domPath?: string
  textHash?: string
  orderIndex: number

  createdAt: string
}
```

### 11.2 SourceRef

```ts
type SourceRef = {
  sourceType:
    | 'user_message'
    | 'assistant_message'
    | 'message_block'
    | 'manual'
    | 'derived'

  messageRefId?: string

  anchor?: {
    type: 'message' | 'heading' | 'offset' | 'block'
    headingText?: string
    start?: number
    end?: number
    blockId?: string
  }

  derivedFromNodeIds?: string[]
}
```

### 11.3 ConceptMapNode

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

type NodeStatus =
  | 'candidate'
  | 'edited'
  | 'removed'
  | 'rejected'
  | 'source_lost'

type ConceptMapNode = {
  id: string
  conversationKey: string

  title: string
  summary?: string

  roles: NodeRole[]
  status: NodeStatus

  source?: SourceRef

  layout?: {
    x: number
    y: number
  }

  createdBy: 'system' | 'user'
  createdAt: string
  updatedAt: string
}
```

### 11.4 ConceptMapEdge

```ts
type EdgeStatus =
  | 'candidate'
  | 'edited'
  | 'removed'
  | 'rejected'

type ConceptMapEdge = {
  id: string
  conversationKey: string

  sourceNodeId: string
  targetNodeId: string

  relationType:
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

  label?: string
  status: EdgeStatus

  createdBy: 'system' | 'user'
  createdAt: string
  updatedAt: string
}
```

## 12. 核心处理流程

### 12.1 单轮问答处理流程

```text
1. 用户在官方 Chat 页面发送问题
2. 官方 Chat 系统正常生成回答
3. Thinking IDE 的 Chat Adapter 监听到新增用户消息
4. Chat Adapter 生成 user MessageRef
5. Chat Adapter 监听到新增 AI 回复
6. 等待 AI 回复完成
7. Chat Adapter 生成 assistant MessageRef
8. Thinking 结构化服务临时读取当前轮问答文本
9. 从用户提问中生成 question node
10. 从 AI 完整回答中生成 answer node
11. 从 AI 回答结构中生成 answer_outline nodes
12. 从问题和回答中抽取 concept nodes
13. 自动建议 edges
14. 保存 ConceptMapNode、ConceptMapEdge、MessageRef 和 SourceRef
15. 右侧 Thinking Panel 自动刷新
16. 用户直接拖拽、重命名、连接、删除这些节点和关系
```

### 12.2 用户整理流程

```text
AI 生成 Concept Map 草稿
↓
用户查看节点和关系
↓
用户删除无用节点
↓
用户重命名重要节点
↓
用户拖拽调整结构
↓
用户连接相关概念
↓
用户点击节点回到原文验证上下文
↓
Concept Map 持续更新
```

## 13. 页面结构设计

### 13.1 主页面布局

```text
┌──────────────────────────────┬──────────────────────────────────────────────┐
│                              │ Thinking IDE        Synced      ↻   ⚙   ⟩     │
│      Official Chat Area      ├──────────────────────────────────────────────┤
│                              │                                              │
│  User Question               │              Concept Map Canvas              │
│  AI Answer                   │                                              │
│  User Question               │     项目定位讨论 ──回应──▶ MVP 定义建议       │
│  AI Answer                   │                               │              │
│                              │                               ▼              │
│  Chat Input                  │                         Concept Map          │
│                              │                                              │
│                              ├──────────────────────────────────────────────┤
│                              │ Generated 8 nodes · 4 relations              │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

### 13.2 节点默认形态

```text
┌────────────────────┐
│ Concept Map        │
└────────────────────┘
```

### 13.3 节点选中形态

```text
        ┌──────────────────────┐
        │ 重命名  原文  连接  ⋯ │
        └──────────────────────┘
╔════════════════════╗
║ Concept Map        ║
╚════════════════════╝
```

## 14. 技术实现建议

### 14.1 产品形态建议

MVP 适合以浏览器插件形式实现，例如：

1. Chrome Extension
2. Edge Extension
3. Tampermonkey / Userscript 原型
4. 后续官方集成形态

最小实现路径：

```text
浏览器插件
↓
Content Script 注入官方 Chat 页面
↓
在页面右侧挂载 Thinking Panel
↓
读取 Chat Area DOM
↓
生成 Concept Map 草稿
↓
用户直接操作节点和关系
↓
点击节点滚动定位原文
```

### 14.2 前端建议

默认技术方案：

1. React + TypeScript
2. React Flow / xyflow
3. shadcn/ui + Radix UI
4. lucide-react
5. Zustand
6. Dexie / IndexedDB
7. Chrome Extension Manifest V3
8. Shadow DOM 样式隔离

### 14.3 Chat Adapter 建议

Chat Adapter 负责把官方 Chat 页面转换成 Thinking IDE 可以理解的标准数据。

```ts
type ChatAdapter = {
  getConversationKey: () => string
  getMessages: () => NormalizedMessage[]
  observeMessageChanges: (callback: Function) => void
  getMessageText: (messageRefId: string) => string
  scrollToMessage: (messageRefId: string) => void
  scrollToAnchor: (messageRefId: string, anchor: SourceRef['anchor']) => void
}
```

### 14.4 存储建议

MVP 可以先无后端，全部本地运行：

1. 插件读取页面内容。
2. 调用 AI 结构化接口。
3. 节点和关系存储在 IndexedDB。
4. 用户编辑结果存储在本地。

长期不存储：

1. 用户完整提问
2. AI 完整回答

## 15. MVP 验收标准

### 15.1 功能验收

MVP 完成后，应该满足：

1. 插件可以在官方 Chat 页面右侧成功注入 Thinking Panel。
2. 用户可以继续正常使用官方 Chat，不受插件影响。
3. Thinking Panel 默认提供足够宽的思考空间。
4. 插件可以识别用户消息和 AI 消息。
5. 插件可以在 AI 回复完成后触发结构化解析。
6. 每轮用户提问后会自动生成 question node。
7. 每个 AI 回答会自动生成 answer node。
8. 每个 AI 回答会自动生成 answer_outline nodes。
9. 系统可以从问答中抽取 concept nodes。
10. 系统可以自动建议基础关系。
11. 用户可以点击节点跳转到官方 Chat 原文。
12. 用户可以双击节点标题进行重命名。
13. 用户可以拖拽节点位置。
14. 用户可以从节点连接点拖线创建关系。
15. 用户可以点击关系线编辑关系。
16. 用户可以删除节点或关系。
17. 页面刷新后保留用户编辑结果。
18. 原始用户提问和 AI 回答不重复存储，只通过 MessageRef 和 SourceRef 引用。

### 15.2 体验验收

体验上应该满足：

1. 用户不需要离开 Chat。
2. 用户可以在新建聊天或查看历史聊天时保持 Thinking Panel 开启。
3. 用户可以通过右侧节点直接定位原文。
4. 右侧面板承担 Concept Map 草稿和认知编辑功能。
5. AI 自动生成结构草稿，用户拥有最终结构控制权。
6. 用户能方便地删除无用节点。
7. 用户能方便地重命名关键概念。
8. 用户能方便地拖拽和连接节点。
9. 长回答比原来更容易拆解。
10. 多轮追问比原来更容易回溯。
11. 用户能感受到自己正在主动整理思考。
12. 用户能感受到 Concept Map 构建与聊天思考过程同步发生。

## 16. 核心指标

### 16.1 使用行为指标

1. Thinking Panel 开启率。
2. 单个会话中节点点击次数。
3. question / answer / outline 节点跳转原文次数。
4. 用户连续多轮使用 Thinking Panel 的比例。
5. 用户在历史会话中打开 Thinking Panel 的比例。

### 16.2 编辑行为指标

1. 节点删除次数。
2. 节点标题修改次数。
3. 节点拖拽次数。
4. 用户手动创建关系次数。
5. 用户删除 AI 自动生成关系次数。
6. 用户修改关系名称或类型次数。
7. Floating Toolbar 使用次数。

### 16.3 价值验证指标

1. 用户是否认为长对话定位成本降低。
2. 用户是否认为文档化整理成本降低。
3. 用户是否认为 Concept Map 构建能与思考过程同步发生。
4. 用户是否愿意持续开启右侧 Thinking Panel。
5. 用户是否会把整理后的 Concept Map 用于后续文档、PPT 或思维导图输出。

## 17. 后续版本方向

### 17.1 V1：增强编辑能力

可以增加：

1. 手动创建节点。
2. 节点分组。
3. 节点折叠。
4. 局部图谱聚焦。
5. 关系名称自定义增强。
6. 节点属性面板。

### 17.2 V2：从单会话 Concept Map 到跨会话 Concept Map

可以增加：

1. 跨会话概念合并。
2. 相似节点识别。
3. 多个对话之间的概念关系。
4. 项目级 Concept Map。
5. 用户手动维护中心概念。

### 17.3 V3：从 Thinking Panel 到 Thinking IDE

可以增加：

1. 多项目工作区。
2. Concept Map 模板。
3. 认知模型模板。
4. 研究模式。
5. 产品设计模式。
6. 学习模式。
7. 团队协作。

## 18. MVP 最小闭环总结

```text
用户在官方 Chat 页面正常聊天
↓
Thinking IDE 插件在右侧注入 Thinking Panel
↓
Chat Adapter 读取官方 Chat Area 中的问答内容
↓
系统生成 question / answer / outline / concept nodes
↓
系统建议 edges
↓
右侧 Thinking Panel 形成 Concept Map 草稿
↓
用户点击节点跳回官方 Chat 原文
↓
用户拖拽、重命名、连接和删除节点
↓
AI 草稿逐渐变成用户自己的 Concept Map
```

Thinking IDE 的核心价值是：

> **在不重做 Chat 的前提下，把官方 AI Chat 页面增强成一个 AI 辅助、用户主导、支持直接操作的 Concept Map 工作台。**

