# Thinking IDE PRD 产品需求文档

## 1. 文档信息

| 字段 | 内容 |
|---|---|
| 产品名称 | Thinking IDE |
| 文档类型 | PRD / 产品需求文档 |
| 版本 | v0.1 |
| 阶段 | MVP |
| 产品形态 | 浏览器插件 / 官方 AI Chat 页面增强插件 |
| 核心定位 | AI 辅助、用户主导的 Concept Map 工作台 |

## 2. 产品概述

Thinking IDE 是一个嵌入在官方 AI Chat 页面右侧的 Concept Map 工作台。

它通过读取官方 Chat Area 中的用户提问和 AI 回答，自动生成候选节点与候选关系，帮助用户在聊天过程中同步构建自己的 Concept Map。

Thinking IDE 不重做 AI Chat，不替代官方输入框、模型调用和聊天历史系统，而是专注于解决长对话中的定位、结构化、概念整理和认知模型构建问题。

核心产品价值：

```text
用户正常聊天
↓
Thinking IDE 自动生成 Concept Map 草稿
↓
用户直接拖拽、重命名、连接和删除节点
↓
AI 聊天过程同步沉淀为用户自己的认知模型
```

## 3. 目标用户

## 3.1 核心用户

Thinking IDE 主要服务于经常使用 GPT / AI Chat 构建认知模型的人。

第一阶段重点服务与设计、创造、分析、表达相关的人群：

1. UI/UX 设计师
2. 产品经理
3. 内容创作者
4. 研究型学习者
5. 知识型工作者
6. 程序员 / 技术方案设计者
7. 需要长期沉淀方法论的人

## 3.2 用户特征

目标用户通常具备以下行为特征：

1. 高频使用 AI Chat。
2. 经常围绕复杂问题连续追问。
3. 一次 Session 中会产生较长的问答内容。
4. 使用 AI 的目的不是单纯获取答案，而是构建理解、模型、方案或方法论。
5. 经常需要将 AI 对话进一步整理成文档、PPT、思维导图或知识笔记。
6. 希望在思考过程中同步沉淀结构，而不是等对话结束后再重新整理。

## 4. 用户问题与需求

## 4.1 当前用户路径

### 路径一：导入笔记软件整理

```text
用户在 AI Chat 中连续提问
↓
AI 生成大量回答
↓
用户复制聊天内容
↓
导入 Notion / 飞书 / Obsidian / 文档工具
↓
手动整理标题、段落、概念和关系
↓
形成笔记或知识文档
```

### 路径二：整理成输出材料

```text
用户通过 AI 完成多轮调研和分析
↓
获得多篇 AI 输出内容
↓
手动整合多个回答
↓
提炼结构和关键概念
↓
制作 PPT / 思维导图 / 汇报文档
↓
分享给他人
```

## 4.2 核心痛点

### 4.2.1 切换与定位成本高

在长对话 Session 中，用户需要不断滚动查找之前的某个问题、回答或段落。随着对话变长，滚动距离和查找成本快速上升，用户容易丢失思考脉络。

### 4.2.2 文档化成本高

用户需要手动复制 AI 输出，粘贴到笔记工具，再手动提取标题、概念、观点和关系。这个过程耗时且容易打断原有思考。

### 4.2.3 严格串行流程低效

当前用户通常是：

```text
先完成 AI 调研和对话
↓
再手动整理思维导图 / 文档 / PPT
```

这是一种严格串行流程，增加了时间成本和空间切换成本。

### 4.2.4 Concept Map 构建滞后

用户真正需要的是在思考过程中同步形成结构，而不是等长对话结束后再重新整理。

理想状态是：

```text
宏观上并行：聊天思考和 Concept Map 构建同时发生
微观上串行：用户逐步判断、确认和调整节点关系
```

## 5. 产品目标

## 5.1 MVP 目标

MVP 阶段需要实现以下目标：

1. 在官方 AI Chat 页面右侧注入 Thinking Panel。
2. 识别官方 Chat Area 中的用户消息和 AI 消息。
3. 在 AI 回复完成后生成候选 Concept Map 草稿。
4. 将用户提问生成候选 question node。
5. 将 AI 完整回答生成候选 answer node。
6. 将 AI 回答结构项生成候选 answer_outline node。
7. 从问答中抽取候选 concept node。
8. 自动建议节点之间的候选关系。
9. 支持用户对 AI 生成节点进行直接操作，包括重命名、删除、拖拽和连接。
10. 支持用户手动创建、删除和修改关系。
11. 支持点击节点跳转到官方 Chat 原文位置。
12. 支持页面刷新后恢复 Concept Map 数据。

## 5.2 MVP 成功标准

MVP 成功的判断标准：

1. 用户可以在官方 Chat 页面右侧持续开启 Thinking Panel。
2. 用户可以通过右侧节点快速定位长对话中的原文。
3. 用户会主动删除、重命名、拖拽或连接 AI 生成的节点。
4. 用户会手动调整节点关系。
5. 用户认为 Concept Map 构建可以与聊天思考过程同步发生。

## 6. 产品范围

## 6.1 MVP 包含范围

MVP 包含以下能力：

1. 浏览器插件基础能力。
2. 官方 Chat 页面右侧 Thinking Panel 注入。
3. Chat Area 消息识别。
4. AI 回复完成监听。
5. 消息引用与原文定位。
6. Concept Map 候选节点生成。
7. Concept Map 候选关系生成。
8. 节点轻量编辑。
9. 关系轻量编辑。
10. 节点点击跳转原文。
11. 本地数据存储与刷新恢复。
12. 基础异常状态处理。

## 6.2 MVP 不包含范围

MVP 暂不包含：

1. 独立 AI Chat 主界面。
2. 独立聊天输入框。
3. 模型调用和 AI 回复生成能力。
4. 用户账号体系。
5. 跨设备同步。
6. 跨会话 Concept Map 合并。
7. 复杂自动布局算法。
8. 多人协作。
9. 版本历史。
10. 导出 PPT / 图片 / Markdown。
11. 完整文档发布系统。
12. 节点颜色体系。
13. 节点分组。
14. 复杂权限管理。

## 7. 核心概念定义

## 7.1 Thinking Panel

Thinking Panel 是注入在官方 AI Chat 页面右侧的 Concept Map 工作区域。

它负责展示 AI 生成的候选节点和候选关系，并支持用户编辑、调整和跳转原文。

## 7.2 Chat Adapter

Chat Adapter 是 Thinking IDE 与官方 Chat Area 之间的适配层。

它负责：

1. 识别当前会话。
2. 识别用户消息。
3. 识别 AI 消息。
4. 判断 AI 回复完成状态。
5. 生成 MessageRef。
6. 建立回答段落 anchor。
7. 根据节点跳转到原文位置。

## 7.3 Concept Map Node

Concept Map Node 是 Thinking IDE 中的基础对象。

问题、回答、回答结构项、概念、观点、结论、待办都可以被抽象成 Node。

MVP 阶段自动生成以下节点角色：

1. question
2. answer
3. answer_outline
4. concept

## 7.4 Concept Map Edge

Concept Map Edge 表示节点之间的关系。

MVP 阶段自动生成以下关系：

1. answered_by
2. contains
3. mentions
4. follow_up

## 7.5 Candidate / Accepted / Edited / Rejected

AI 生成的节点和关系在数据层可以标记为 candidate，但该状态不应在视觉层强打扰用户。

用户操作后状态变化：

1. candidate：AI 生成，尚未被用户主动编辑。
2. edited：用户修改过节点或关系。
3. removed / rejected：用户删除或移除节点、关系。
4. source_lost：节点保留，但原文定位失效。

产品体验上不强调“逐个接受候选节点”的审批流程。AI 生成的节点默认进入 Concept Map 草稿，用户通过删除、重命名、拖拽、连接等直接操作完成整理。

## 8. 用户流程

## 8.1 首次使用流程

```text
用户安装浏览器插件
↓
用户打开官方 AI Chat 页面
↓
Thinking IDE 在右侧注入 Thinking Panel
↓
用户正常发起提问
↓
AI 正常生成回答
↓
Thinking IDE 识别本轮问答
↓
AI 回复完成后生成候选节点和候选关系
↓
用户查看 Concept Map 草稿
↓
用户删除 / 重命名 / 拖拽 / 连接节点
↓
用户点击节点跳回原文
↓
用户继续对话，Concept Map 持续更新
```

## 8.2 长对话定位流程

```text
用户在长对话中想回看某个概念或问题
↓
用户在 Thinking Panel 中找到对应节点
↓
用户点击节点
↓
Chat Area 自动滚动到对应问题 / 回答 / 回答段落
↓
对应原文高亮
↓
用户继续阅读或追问
```

## 8.3 Concept Map 编辑流程

```text
系统生成候选节点和候选关系
↓
用户查看候选结构
↓
用户删除无用节点
↓
用户重命名重要节点
↓
用户拖拽调整布局
↓
用户手动连接节点关系
↓
用户修改关系名称
↓
Concept Map 草稿逐渐变成用户自己的认知模型
```

## 8.4 历史会话恢复流程

```text
用户打开历史 Chat 会话
↓
Thinking IDE 识别 conversationKey
↓
读取本地已保存的 Concept Map 数据
↓
根据 MessageRef / textHash / orderIndex 恢复节点与原文的定位关系
↓
恢复成功的节点可继续点击跳转
↓
恢复失败的节点保留，但标记原文定位失效
```

## 9. 功能需求

## 9.1 插件注入与布局

### 9.1.1 需求描述

Thinking IDE 需要以浏览器插件形式注入官方 AI Chat 页面，并在页面右侧挂载 Thinking Panel。

### 9.1.2 功能规则

1. 用户打开官方 AI Chat 页面后，插件自动检测页面。
2. 页面匹配成功后，右侧显示 Thinking Panel。
3. Thinking Panel 不遮挡官方 Chat 输入框。
4. 用户可以收起 / 展开 Thinking Panel。
5. Thinking Panel 展开时，Chat Area 需要保持可正常使用。
6. 插件样式需要尽量隔离，避免污染官方页面样式。

### 9.1.3 状态

1. 未注入
2. 注入中
3. 注入成功
4. 注入失败
5. 用户手动收起
6. 用户手动展开

### 9.1.4 验收标准

1. 打开官方 AI Chat 页面后，Thinking Panel 可以显示在右侧。
2. 用户可以正常使用官方 Chat。
3. 用户可以收起和展开 Thinking Panel。
4. 页面刷新后，Thinking Panel 可以重新注入。

## 9.2 Chat Area 消息识别

### 9.2.1 需求描述

Thinking IDE 需要识别官方 Chat Area 中的用户消息和 AI 消息，并将其转化为标准消息引用模型。

### 9.2.2 功能规则

1. 识别用户消息。
2. 识别 AI 消息。
3. 按消息顺序生成 orderIndex。
4. 为每条消息生成 MessageRef。
5. 为消息生成 textHash，用于后续恢复匹配。
6. 支持监听新增消息。
7. 支持识别历史消息。
8. 不长期保存完整消息原文。

### 9.2.3 验收标准

1. 插件可以正确识别当前页面已有用户消息。
2. 插件可以正确识别当前页面已有 AI 消息。
3. 用户发送新消息后，插件能监听到新增用户消息。
4. AI 生成新回复后，插件能监听到新增 AI 消息。
5. 每条消息都有稳定 MessageRef。

## 9.3 AI 回复完成监听

### 9.3.1 需求描述

Thinking IDE 需要在 AI 回复完成后再触发结构化解析，避免在流式输出未完成时生成不完整节点。

### 9.3.2 功能规则

1. AI 回复生成中时，不触发最终结构化解析。
2. AI 回复完成后，触发当前轮问答解析。
3. 如果无法可靠判断完成状态，可采用延迟稳定策略。
4. 同一轮回答只触发一次最终解析。
5. 用户可手动触发重新解析。

### 9.3.3 验收标准

1. AI 流式生成过程中不会提前生成最终 Concept Map 草稿。
2. AI 回复完成后自动生成候选节点和关系。
3. 同一轮回答不会重复生成多份候选结构。
4. 用户可以对失败或不满意的结果重新解析。

## 9.4 候选节点生成

### 9.4.1 需求描述

Thinking IDE 需要在每轮问答完成后生成候选节点。

### 9.4.2 自动生成节点

MVP 阶段自动生成：

1. question node
2. answer node
3. answer_outline node
4. concept node

### 9.4.3 生成规则

#### question node

来源：用户提问。

规则：

1. 每条用户提问默认生成一个候选 question node。
2. 标题应高度概括用户问题。
3. summary 描述用户问题的核心意图。
4. source 指向对应 user MessageRef。

#### answer node

来源：AI 完整回答。

规则：

1. 每条 AI 回复默认生成一个候选 answer node。
2. 标题应概括该回答整体内容。
3. summary 描述回答的主要价值。
4. source 指向对应 assistant MessageRef。

#### answer_outline node

来源：AI 回答中的结构项。

规则：

1. 从 AI 回答中的标题、段落主题、步骤、观点或结论中生成。
2. 数量应控制，避免生成过多。
3. 每个 outline node 需要有 anchor。
4. 点击后可定位到回答中的对应段落。

#### concept node

来源：用户提问和 AI 回答中的关键概念。

规则：

1. 优先提取对认知模型构建有价值的概念。
2. 数量建议控制在 3 到 7 个。
3. 避免抽取过于普通或无区分度的词。
4. 概念标题应简短。

### 9.4.4 节点初始状态

AI 生成的节点在数据层初始状态为：

```text
candidate
```

视觉层不强展示 candidate 文案。新生成节点可以通过轻量提示表达，例如：

1. 弱虚线边框。
2. 小圆点提示。
3. 底部生成日志。
4. 选中或 hover 后显示来源和状态。

节点默认进入 Concept Map 草稿。用户不需要逐个点击“接受”才能使用节点。

### 9.4.5 验收标准

1. 每轮问答完成后生成 question node。
2. 每轮问答完成后生成 answer node。
3. 每条 AI 回答可以生成若干 answer_outline node。
4. 每轮问答可以生成若干 concept node。
5. 所有自动生成节点在数据层默认状态为 candidate。
6. 节点视觉层默认以标题为中心，不强展示 role / status 等系统属性。
7. 节点标题可读、简短、可理解。
8. answer_outline node 可以定位到原回答段落。

## 9.5 候选关系生成

### 9.5.1 需求描述

Thinking IDE 需要自动建议节点之间的候选关系。

### 9.5.2 自动生成关系

MVP 阶段自动生成：

1. answered_by
2. contains
3. mentions
4. follow_up

### 9.5.3 关系规则

#### answered_by

```text
question node → answer node
```

表示某个用户问题由某个 AI 回答回应。

#### contains

```text
answer node → answer_outline node
```

表示某个 AI 回答包含某些回答结构项。

#### mentions

```text
question node / answer node → concept node
```

表示某个问题或回答中提到了某个概念。

#### follow_up

```text
previous question node → current question node
```

表示后一个问题是前一个问题的延续。

### 9.5.4 关系初始状态

AI 生成的关系在数据层初始状态为：

```text
candidate
```

视觉层不强制展示 candidate 文案。关系线可以通过轻量样式表现系统建议，例如较弱线条、虚线或 hover 后显示来源。

用户可以直接删除、修改或重命名关系，不需要逐条接受。

### 9.5.5 验收标准

1. question node 和 answer node 之间生成 answered_by 关系。
2. answer node 和 answer_outline node 之间生成 contains 关系。
3. question / answer 与 concept node 之间生成 mentions 关系。
4. 连续提问之间生成 follow_up 关系。
5. 所有自动生成关系在数据层默认状态为 candidate。
6. 用户可以直接修改、重命名或删除自动生成关系。

## 9.6 节点展示

### 9.6.1 需求描述

Thinking Panel 需要以 Concept Map 为中心展示节点。节点视觉重点应放在概念本身，而不是系统属性。

### 9.6.2 展示内容

节点默认只展示：

1. 节点标题。
2. 必要的轻量状态提示，例如 source_lost 图标。

节点在 hover / selected / 更多操作中可以展示：

1. 节点角色。
2. 节点来源。
3. 节点状态。
4. 原文定位入口。
5. 节点操作入口。

### 9.6.3 展示规则

1. 默认节点卡片以 title 为中心。
2. role / status 不作为默认主视觉内容。
3. candidate 节点不强显示 Candidate 文案，仅通过弱样式或后台状态记录。
4. edited 节点不强显示 Edited 文案，用户编辑内容直接成为节点当前内容。
5. removed / rejected 节点默认不显示在主视图中。
6. source_lost 节点需要显示轻量失效提示，例如图标或 tooltip。
7. 点击节点优先执行选中和原文定位。

### 9.6.4 验收标准

1. 用户能以最低视觉负担阅读节点概念。
2. 用户能通过点击节点定位原文。
3. 用户能在选中或 hover 后找到节点操作。
4. 被删除的节点不再出现在主图中。
5. 原文定位失效的节点有可识别提示。

## 9.7 节点编辑

### 9.7.1 需求描述

用户可以对节点进行轻量编辑，将 AI 候选结构整理成自己的 Concept Map。

### 9.7.2 支持操作

MVP 支持以直接操作为主的节点编辑：

1. 点击节点：选中节点，并尝试定位原文。
2. 拖拽节点：调整节点位置。
3. 双击节点标题：重命名。
4. 从节点连接点拖线：创建关系。
5. Delete / Backspace：删除选中节点或关系。
6. 选中节点后显示 Floating Toolbar。
7. 更多操作放入 Dropdown / Context Menu。
8. 将 answer_outline node 转为 concept node 或 claim node。

### 9.7.3 操作规则

#### 直接保留节点

AI 生成节点默认进入 Concept Map 草稿。用户不需要点击“接受”才能继续使用。

节点如果被用户保留、不删除、不修改，则保持 candidate 数据状态，但视觉上作为普通节点参与 Concept Map。

#### 删除节点

1. 用户选中节点后按 Delete / Backspace，或通过更多菜单点击删除。
2. 节点状态变为 removed / rejected。
3. 节点从主视图隐藏。
4. 与该节点相连的边在主视图中隐藏或标记失效。
5. 不删除原始消息引用。

#### 修改节点标题

1. 用户双击节点标题或点击编辑按钮。
2. 标题进入可编辑状态。
3. 用户保存后，节点状态变为 edited。
4. 用户编辑内容优先于 AI 生成内容。

#### 拖拽节点位置

1. 用户直接拖拽节点。
2. 系统更新 layout.x 和 layout.y。
3. 页面刷新后保留布局。

#### 提升节点角色

1. 用户可以将 answer_outline node 提升为 concept node 或 claim node。
2. 系统为该节点追加新的 role。
3. 节点状态变为 edited。

### 9.7.4 验收标准

1. 用户可以点击节点并定位原文。
2. 用户可以双击节点标题进行重命名。
3. 用户可以拖拽节点位置。
4. 用户可以删除节点。
5. 用户可以从节点连接点拖线创建关系。
6. 用户可以将 outline 节点转为 concept / claim 节点。
7. 用户编辑结果可以持久化。
8. 节点操作不主要依赖 Dropdown；Dropdown 只承载低频或更多操作。

## 9.8 关系展示与编辑

### 9.8.1 需求描述

用户可以查看、创建、删除和修改节点之间的关系。

### 9.8.2 支持操作

MVP 支持直接操作式关系编辑：

1. 展示自动生成关系。
2. 点击关系线选中关系。
3. 从节点连接点拖线创建关系。
4. 删除关系。
5. 修改关系类型。
6. 修改关系名称。

### 9.8.3 操作规则

#### 删除关系

1. 用户选择关系线。
2. 点击删除。
3. 关系状态变为 rejected。
4. 关系从主视图隐藏。

#### 手动连接两个节点

1. 用户从一个节点拖出连接线。
2. 连接到另一个节点。
3. 系统创建新关系。
4. createdBy 为 user。
5. status 默认为 edited 或 accepted。

#### 修改关系类型或名称

1. 用户选中关系线。
2. 打开关系编辑入口。
3. 用户选择 relationType 或输入 label。
4. 保存后状态变为 edited。

### 9.8.4 验收标准

1. 用户可以看到节点之间的关系。
2. 用户可以点击关系线选中关系。
3. 用户可以删除自动生成关系。
4. 用户可以从节点连接点拖线创建关系。
5. 用户可以修改关系名称。
6. 用户可以修改关系类型。
7. 用户编辑后的关系可以持久化。

## 9.9 节点跳转原文

### 9.9.1 需求描述

用户点击节点后，Chat Area 需要滚动到对应原文位置。

### 9.9.2 跳转规则

#### question node

跳转到对应用户消息。

#### answer node

跳转到对应 AI 完整回答。

#### answer_outline node

跳转到对应 AI 回答段落。

#### concept node

高亮相关节点，并展示可跳转来源。

如果 concept node 只有一个来源，可以直接跳转到该来源。

如果 concept node 有多个来源，展示来源列表，由用户选择跳转。

### 9.9.3 高亮规则

1. 跳转成功后，对应原文区域短暂高亮。
2. 高亮持续时间建议 1.5 到 3 秒。
3. 右侧当前节点保持选中状态。

### 9.9.4 验收标准

1. 点击 question node 可以跳转到对应用户消息。
2. 点击 answer node 可以跳转到对应 AI 回答。
3. 点击 answer_outline node 可以跳转到对应回答段落。
4. 跳转后原文有高亮反馈。
5. 原文无法定位时显示失败提示。

## 9.10 本地存储与恢复

### 9.10.1 需求描述

Thinking IDE 需要本地保存 Concept Map 数据，并在页面刷新或重新打开历史会话时恢复。

### 9.10.2 存储内容

本地存储：

1. MessageRef
2. SourceRef
3. ConceptMapNode
4. ConceptMapEdge
5. 节点布局信息
6. 用户编辑结果
7. conversationKey

不长期存储：

1. 用户完整提问
2. AI 完整回答

### 9.10.3 恢复规则

1. 根据 conversationKey 找到本地 Concept Map 数据。
2. 根据 MessageRef 尝试恢复 DOM 定位。
3. 根据 textHash 和 orderIndex 辅助匹配原文。
4. 恢复成功则节点继续可跳转。
5. 恢复失败则节点保留，但 source 标记为失效。

### 9.10.4 验收标准

1. 页面刷新后 Concept Map 节点仍存在。
2. 页面刷新后用户编辑标题仍存在。
3. 页面刷新后用户手动关系仍存在。
4. 页面刷新后可恢复节点跳转。
5. 无法恢复定位的节点不会丢失。

## 9.11 重新解析

### 9.11.1 需求描述

用户可以对某轮问答重新生成候选节点和候选关系。

### 9.11.2 功能规则

1. 用户可以在 answer node 或对应消息上触发重新解析。
2. 重新解析生成新的 candidate 节点和关系。
3. 用户已经 edited / accepted 的节点不应被自动覆盖。
4. 新生成候选结构可以与已有结构并存或提示用户合并。

### 9.11.3 MVP 简化规则

MVP 阶段采用保守策略：

1. 重新解析只新增候选节点和关系。
2. 不自动覆盖用户编辑内容。
3. 重复候选节点可以通过标题相似度简单去重。

### 9.11.4 验收标准

1. 用户可以重新解析某轮回答。
2. 重新解析不会覆盖用户编辑过的节点。
3. 新候选节点可以继续被接受或忽略。

## 10. 页面与交互设计要求

## 10.1 Thinking Panel 默认结构

Thinking Panel 建议包含以下区域：

1. 顶部工具栏
2. Concept Map 主区域
3. 节点操作入口
4. 关系操作入口
5. 状态提示区域

### 顶部工具栏

包含：

1. 面板标题：Thinking IDE
2. 收起 / 展开按钮
3. 重新解析按钮
4. 设置入口，可选

### Concept Map 主区域

展示：

1. 候选节点
2. 已接受节点
3. 用户编辑节点
4. 节点关系线

## 10.2 节点显示与状态样式

节点默认以概念标题为中心，减少系统属性对思考的干扰。

建议状态表达：

1. candidate：数据层状态，视觉层仅做弱提示，不显示大面积 Candidate 文案。
2. edited：数据层状态，视觉层直接展示用户编辑后的标题。
3. removed / rejected：主视图隐藏。
4. source_lost：显示轻量警示图标和 tooltip。

默认节点：

```text
┌──────────────┐
│ Concept Map  │
└──────────────┘
```

选中节点：

```text
        ┌──────────────────────┐
        │ 重命名  原文  连接  ⋯ │
        └──────────────────────┘
╔════════════════════╗
║ Concept Map        ║
╚════════════════════╝
```

source_lost 节点：

```text
┌──────────────┐
│ Concept Map ⚠│
└──────────────┘
```

## 10.3 节点操作入口

节点操作采用三层交互模型：

1. 直接操作：点击、拖拽、双击、拖线连接、键盘删除。
2. Floating Toolbar：选中节点后显示高频操作。
3. Dropdown / Context Menu：承载低频或更多操作。

MVP 建议支持：

1. 点击节点：定位原文 / 选中节点。
2. 双击标题：编辑标题。
3. 拖拽节点：调整位置。
4. 拖拽连接点：创建关系。
5. Delete / Backspace：删除选中节点或关系。
6. Floating Toolbar：重命名、原文、连接、删除。
7. Dropdown / Context Menu：转为概念、转为 Claim、重新解析来源、更多属性。

## 10.4 关系操作入口

关系操作可以通过点击关系线触发。

MVP 建议支持：

1. 编辑关系名称
2. 修改关系类型
3. 删除关系

## 11. 状态与异常处理

## 11.1 空状态

触发条件：当前 Chat 页面没有可解析对话。

展示文案：

```text
开始一段对话后，Thinking IDE 会在这里生成 Concept Map 草稿。
```

## 11.2 加载状态

触发条件：AI 回复尚未完成，或结构化服务正在处理。

展示文案：

```text
正在从当前回答中提取候选节点和关系...
```

## 11.3 生成失败状态

触发条件：结构化服务失败。

展示文案：

```text
本轮 Concept Map 草稿生成失败，可以稍后重试。
```

可用操作：

1. 重试
2. 忽略本轮

## 11.4 Chat DOM 识别失败状态

触发条件：插件无法识别官方 Chat 页面结构。

展示文案：

```text
当前页面结构暂时无法识别，Thinking IDE 需要更新适配规则。
```

## 11.5 原文定位失败状态

触发条件：用户点击节点，但对应原始消息无法定位。

展示文案：

```text
原始消息位置暂时无法定位，节点内容仍已保留。
```

## 11.6 刷新恢复状态

页面刷新后，系统根据 conversationKey、MessageRef、textHash 和 orderIndex 尝试恢复节点与原文的定位关系。

恢复结果：

1. 恢复成功：节点继续可点击跳转。
2. 恢复失败：节点保留，source 标记为失效。

## 12. 数据需求

## 12.1 MessageRef

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

## 12.2 SourceRef

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

## 12.3 ConceptMapNode

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
  | 'accepted'
  | 'edited'
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

## 12.4 ConceptMapEdge

```ts
type EdgeStatus =
  | 'candidate'
  | 'accepted'
  | 'edited'
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

## 13. AI 结构化服务需求

## 13.1 输入

```json
{
  "conversationKey": "official_chat_conv_local_001",
  "userMessage": {
    "messageRefId": "ref_user_001",
    "content": "用户提问内容"
  },
  "assistantMessage": {
    "messageRefId": "ref_ai_001",
    "content": "AI回答内容"
  },
  "previousNodes": [],
  "previousEdges": []
}
```

## 13.2 输出

```json
{
  "nodes": [
    {
      "title": "节点标题",
      "summary": "节点摘要",
      "roles": ["question"],
      "status": "candidate",
      "source": {
        "sourceType": "user_message",
        "messageRefId": "ref_user_001"
      }
    }
  ],
  "edges": [
    {
      "sourceNodeId": "node_question_001",
      "targetNodeId": "node_answer_001",
      "relationType": "answered_by",
      "status": "candidate"
    }
  ]
}
```

## 13.3 生成要求

1. 输出必须为稳定 JSON。
2. 每轮至少生成 question node 和 answer node。
3. concept node 数量建议控制在 3 到 7 个。
4. answer_outline node 数量需要控制，避免过度拆分。
5. 节点标题简短，适合展示在图中。
6. 节点 summary 概括本质，不复述长文本。
7. 所有 AI 生成节点和关系状态为 candidate。
8. 不要求 AI 生成最终图谱，只生成可编辑草稿。

## 14. 非功能需求

## 14.1 性能要求

1. 插件注入不应明显拖慢官方 Chat 页面加载。
2. Thinking Panel 展开 / 收起响应应流畅。
3. 单轮结构化生成应有明确加载状态。
4. 本地节点数量较多时，面板仍应可操作。

## 14.2 兼容性要求

1. MVP 优先支持 Chrome。
2. 后续支持 Edge。
3. 官方 Chat 页面 DOM 变化时，应尽量隔离适配层改动。

## 14.3 数据隐私要求

1. 不长期存储完整用户提问和完整 AI 回答。
2. 长期存储节点、关系和定位引用。
3. 调用结构化服务时会临时读取当前轮问答内容。
4. 用户应能清除本地 Concept Map 数据。

## 14.4 稳定性要求

1. Chat Adapter 识别失败时不影响官方 Chat 使用。
2. Thinking Panel 崩溃时不影响官方 Chat 页面。
3. 本地数据读取失败时提供错误提示。

## 15. 埋点与指标

## 15.1 使用行为指标

1. Thinking Panel 开启率。
2. Thinking Panel 收起率。
3. 单会话节点点击次数。
4. 原文跳转次数。
5. 用户在历史会话中打开 Thinking Panel 的比例。

## 15.2 编辑行为指标

1. 节点删除次数。
2. 节点标题修改次数。
3. 节点拖拽次数。
4. 用户手动创建关系次数。
5. 用户删除 AI 自动生成关系次数。
6. 用户修改关系名称或类型次数。
7. 节点直接点击定位原文次数。
8. Floating Toolbar 使用次数。

## 15.3 价值验证指标

1. 用户是否认为长对话定位成本降低。
2. 用户是否认为文档化整理成本降低。
3. 用户是否认为 Concept Map 构建能与思考过程同步发生。
4. 用户是否愿意持续开启右侧 Thinking Panel。
5. 用户是否会把整理后的 Concept Map 用于后续文档、PPT 或思维导图输出。

## 16. MVP 总体验收清单

MVP 完成时，需要满足以下总体验收条件：

1. 插件能在官方 Chat 页面右侧正常显示 Thinking Panel。
2. 用户可以正常使用官方 Chat，不受插件影响。
3. 插件能识别当前会话中的用户消息和 AI 消息。
4. AI 回复完成后能生成候选 Concept Map 节点和关系。
5. 用户可以重命名、删除、拖拽和连接节点。
6. 用户可以创建、删除和修改关系。
7. 点击节点可以跳转到官方 Chat 原文。
8. 页面刷新后 Concept Map 数据可以恢复。
9. 异常状态有清晰提示。
10. 插件不长期存储完整问答原文。

## 17. 后续版本规划

## 17.1 V1：增强编辑能力

1. 手动创建节点。
2. 节点分组。
3. 节点折叠。
4. 批量接受 / 忽略候选节点。
5. 关系名称自定义增强。
6. 局部图谱聚焦。

## 17.2 V2：跨会话 Concept Map

1. 跨会话概念合并。
2. 相似节点识别。
3. 项目级 Concept Map。
4. 用户手动维护中心概念。
5. 历史会话图谱聚合。

## 17.3 V3：输出与分享

1. 导出 Markdown。
2. 导出图片。
3. 导出思维导图。
4. 生成 PPT 大纲。
5. 生成知识文档。
6. 分享 Concept Map。

## 18. 开放问题

以下问题可在后续设计和技术方案阶段继续细化：

1. 官方 Chat 页面 DOM 变化时的适配策略如何设计？
2. MessageRef 的稳定性如何进一步提高？
3. answer_outline node 的 anchor 使用 heading、block 还是 offset 更稳定？
4. concept node 多来源时的跳转交互如何设计最轻量？
5. 候选节点过多时，是否需要折叠或分层展示？
6. 用户删除候选节点后，后续重新解析是否需要避免重复出现？
7. 本地数据清除入口放在哪里？
8. 是否需要支持用户手动关闭某个会话的自动解析？

