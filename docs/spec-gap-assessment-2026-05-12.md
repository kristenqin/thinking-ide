# Thinking IDE 当前实现偏差评估（2026-05-12）

## 1. 结论摘要

当前仓库更接近：

1. **工程骨架和治理体系已成形**
2. **产品需求与设计稿对齐度明显不足**
3. **整体 spec 满足度约 40%**

这里的 `40%` 指的是 **按产品 spec 的需求满足率**，不是按“代码模块数”或“可运行闭环数”计算的工程完成度。

当前实现已经具备：

1. MV3 扩展注入
2. Shadow DOM 挂载
3. 基础聊天扫描
4. 本地启发式草图生成
5. React Flow 画布
6. Zustand + Dexie 持久化
7. 基础黑盒运行时验证

但距离 spec 中定义的 MVP 仍然存在关键偏差，尤其集中在：

1. **布局模式与面板结构**
2. **ChatAdapter 对历史会话和完整消息的适配**
3. **AI 结构化服务缺位**
4. **Markdown / answer outline / concept 抽取质量**
5. **测试覆盖与验收口径**
6. **隐私边界与持久化契约**

## 2. 为什么会出现这种偏差

### 2.1 推进方式偏向 runtime spine，而不是 spec parity

当前实现主要沿着：

`注入 -> 扫描 -> 生成 -> 渲染 -> 持久化`

这条工程骨架主线推进。

这条路线能快速形成一个可运行的 MVP 壳，但它默认优化的是：

1. 系统能不能跑起来
2. 局部功能能不能闭环
3. 构建、测试、运行时门禁是否成立

它没有自动保证：

1. 布局是否忠实于低保真稿
2. adapter 是否满足历史会话要求
3. 节点语义是否符合“短概念”要求
4. AI 能力是否已经进入应当引入的阶段

### 2.2 缺少几条产品级硬约束

当前仓库虽然已经有 Ready / Done / Git / Runtime Validation / UI Contract 等治理，但缺少以下强约束：

1. **Layout Fidelity Contract**
   明确规定默认必须优先实现真实 `4:6` 双栏，Overlay 只是 fallback。
2. **Adapter Acceptance Contract**
   明确规定必须覆盖历史会话、完整消息扫描、回复完成判断、稳定 MessageRef。
3. **Semantic Extraction Contract**
   明确规定节点必须是短概念、answer_outline 必须可用、Markdown 结构必须被利用。
4. **LLM Integration Decision Gate**
   明确规定当启发式方案无法满足概念质量要求时，必须升级为真实 AI Structuring Service。
5. **Spec-based Progress Metric**
   明确规定完成度按 spec 满足率汇报，而不是按工程闭环数汇报。

### 2.3 测试体系偏向工程正确性，不等于产品验收

当前测试主要覆盖：

1. `tsc --noEmit`
2. service/store 单测
3. mock-host runtime smoke
4. build / CI / 扩展加载

它们主要在证明：

1. 代码没坏
2. 运行时主链还活着
3. 扩展仍能注入

但没有充分证明：

1. 双栏布局是否成立
2. 历史会话是否完整加载
3. Markdown 结构是否被正确利用
4. 节点是否真的是“短概念”
5. 多数 P0 测试用例是否达标

## 3. 核心偏差矩阵

| 编号 | 偏差主题 | Spec 期望 | 当前实现证据 | 严重度 | 影响 |
|---|---|---|---|---|---|
| GAP-01 | 默认布局模式错误 | 默认 `4:6` 双栏，Thinking Panel 是主要思考空间，Overlay 仅作 fallback。见 [thinking_ide_mvp_项目文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_mvp_项目文档.md)、[thinking_ide_技术方案文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_技术方案文档.md)、[thinking_ide_低保真原型文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_低保真原型文档.md)、[thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md) | [src/extension/content.tsx](/Users/qyx/Desktop/project/thinking-ide/src/extension/content.tsx) 通过 `document.body.style.paddingRight` + 固定右侧面板实现近似 overlay，没有真实 Layout Mode，也没有 Overlay fallback 判定链 | P0 | 最直观的产品形态与设计稿不一致，后续 UI 调整会持续建立在错误空间模型上 |
| GAP-02 | 收起/展开与面板控制不完整 | Header 需要 `设置 + 收起`，面板需要支持收起/展开。见 [thinking_ide_低保真原型文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_低保真原型文档.md)、[thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)、[thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md) | `panelCollapsed` 只存在于 [src/models/settings.ts](/Users/qyx/Desktop/project/thinking-ide/src/models/settings.ts)，但当前没有 `collapsePanel` 动作、收起 UI、展开窄条或对应测试 | P1 | 面板控制能力与 spec 不一致，影响长期使用形态 |
| GAP-03 | ChatAdapter 不能证明已拿到完整历史消息 | 必须识别历史用户/AI 消息，稳定生成 `orderIndex / textHash / MessageRef`，支持历史会话恢复。见 [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md)、[thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md) | [src/services/chatAdapter.ts](/Users/qyx/Desktop/project/thinking-ide/src/services/chatAdapter.ts) 只是遍历当前 DOM 中的 `[data-message-author-role]`，`MessageRef` 只有 `id/role/text/createdAt`；没有 `orderIndex`，没有 `textHash`，也没有历史加载/虚拟化补偿机制 | P0 | 历史对话恢复、完整消息扫描、原文定位稳定性都缺乏坚实基础 |
| GAP-04 | AI 回复完成判断未落地 | 应在 AI 回复完成后再解析，避免流式中途生成；同一轮只触发一次。见 [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md)、[thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md) | [src/services/messageObserver.ts](/Users/qyx/Desktop/project/thinking-ide/src/services/messageObserver.ts) 只要监听到消息区域变动就 debounce 触发；[src/app/App.tsx](/Users/qyx/Desktop/project/thinking-ide/src/app/App.tsx) 直接 `regenerate()`，没有“回答完成”判定，也没有同轮一次性生成约束 | P0 | 会直接影响生成时机、重复生成和历史会话一致性 |
| GAP-05 | AI Structuring Service 没有真正存在 | 技术方案和 PRD 要求 `Background Service Worker -> AI Structuring Service`，并定义稳定 JSON 输入输出。见 [thinking_ide_技术方案文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_技术方案文档.md)、[thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md)、[thinking_ide_开发任务拆解文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_开发任务拆解文档.md) | [src/extension/background.ts](/Users/qyx/Desktop/project/thinking-ide/src/extension/background.ts) 只有 `onInstalled` 日志；当前生成完全由 [src/services/generator.ts](/Users/qyx/Desktop/project/thinking-ide/src/services/generator.ts) 本地启发式完成，没有任何外部结构化服务调用 | P0 | 语义质量、Markdown 结构化、概念粒度和后续 DeepSeek 接入都还没进入真正实现阶段 |
| GAP-06 | Markdown / answer_outline 仍停留在 heading-only checkpoint | 回答结构项应生成 `answer_outline node`，并能定位到回答段落；概念提取应利用标题、段落主题、步骤、观点、结论。见 [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md) | 当前 `answer_outline` 已从扁平 `answer.text` 启发式切分迁移到 payload-markdown-AST-first 路径： [src/services/chatAdapter.ts](/Users/qyx/Desktop/project/thinking-ide/src/services/chatAdapter.ts) 会为 payload-backed assistant messages 保留 `markdownText`， [src/utils/markdown.ts](/Users/qyx/Desktop/project/thinking-ide/src/utils/markdown.ts) 负责从 markdown 语法树中提取 heading， [src/services/generator.ts](/Users/qyx/Desktop/project/thinking-ide/src/services/generator.ts) 则按 heading 生成 `answer_outline`，并在无 heading 时返回空 outline。当前剩余缺口变成 richer heading-tree semantics、段落/区块级 source anchor，以及不只是 heading 的更完整 answer structure | P0 | 结构来源已经纠正，但 acceptance 仍要求从 heading-only checkpoint 继续走向更完整的 section/paragraph 级结构和定位 |
| GAP-07 | concept node 粒度不符合“短概念”要求 | concept 标题必须简短，数量 3–7，避免无区分度词。见 [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md) | [src/utils/text.ts](/Users/qyx/Desktop/project/thinking-ide/src/utils/text.ts) 和 [src/services/generator.ts](/Users/qyx/Desktop/project/thinking-ide/src/services/generator.ts) 现在会把 concept 拆成“更短标题 + 原句 summary”，并跳过重复的 Markdown H1；但标题仍是启发式提炼，还没有达到稳定的短概念 acceptance | P0 | 当前核心产品价值已经从“长句”往“可操作概念”逼近，但还没有真正实现 |
| GAP-08 | 图谱语义模型仍然不完整 | PRD 需要 `question / answer / answer_outline / concept` 节点，以及 `answered_by / contains / mentions / follow_up` 等关系。见 [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md) | 当前节点已覆盖 `question / answer / answer_outline / concept / claim`，关系开始覆盖 `contains`，但仍主要使用 `answers / expands / relates` 这条旧语义链，`mentions / follow_up` 仍缺位 | P1 | 图谱结构正从简化草图走向文档定义的 MVP 语义模型，但还没闭合 |
| GAP-09 | Source 跳转只覆盖单来源消息级场景 | concept 多来源需要 `SourceListPopover`，answer_outline 需要段落级定位，恢复需要 `textHash + orderIndex` 辅助。见 [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md)、[thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md) | [src/models/source.ts](/Users/qyx/Desktop/project/thinking-ide/src/models/source.ts) 现在支持 `message` / `heading` anchor 类型，[src/services/chatAdapter.ts](/Users/qyx/Desktop/project/thinking-ide/src/services/chatAdapter.ts) 会在 live DOM 可用时补 assistant H1 source，但还没有 `SourceListPopover`、段落锚点或多来源概念跳转 | P1 | 原文联动比纯消息块级更接近需求，但仍只覆盖了 MVP 中较窄的一段 |
| GAP-10 | 本地持久化违背隐私边界 | Spec 明确“不长期存完整用户提问和 AI 完整回答”。见 [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md)、[thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md) | [src/models/messageRef.ts](/Users/qyx/Desktop/project/thinking-ide/src/models/messageRef.ts) 把完整 `text` 放进 `MessageRef`；[src/services/repository.ts](/Users/qyx/Desktop/project/thinking-ide/src/services/repository.ts) 和 [src/db/database.ts](/Users/qyx/Desktop/project/thinking-ide/src/db/database.ts) 会把整份 `ThinkingDocument` 持久化到 IndexedDB | P0 | 这是实现契约和隐私边界的直接偏差 |
| GAP-11 | Settings / i18n 仍然只完成局部 | 组件设计文档要求 `SettingsMenu`、语言切换、Auto-generate、Clear current map 的 Dialog 确认、UI 文案 i18n。见 [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md) | 当前只完成了 [src/components/panel/ThinkingPanel.tsx](/Users/qyx/Desktop/project/thinking-ide/src/components/panel/ThinkingPanel.tsx) 中的 `Auto-refresh from chat` 和 `Clear current map` 轻量确认；没有 i18n 基础设施，文案仍硬编码，也没有 Language / About / 真正 Dialog | P1 | 功能可用但未达到 spec 定义的组件形态 |
| GAP-12 | StateViews / adapter error / generation error 体系不完整 | 组件设计文档要求 `EmptyState / GeneratingState / GenerationErrorState / AdapterErrorState`。见 [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md) | 当前只有空状态和简化状态条；没有独立 `AdapterErrorState`，`failed` 也没有完整 state view 体系 | P1 | 异常体验与 spec 差距较大 |
| GAP-13 | 测试覆盖显著低于 spec 范围 | 测试文档要求覆盖注入、4:6 布局、收起展开、历史消息扫描、AI 完成判断、AI Structuring、i18n、异常、隐私边界等。见 [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md) | 当前 `package.json` 只有 service/store 单测和 mock-host runtime smoke；没有真实 ChatGPT 历史会话回归、没有 adapter 完成判断测试、没有 layout/collapse/i18n/隐私边界测试 | P0 | 当前测试体系无法支持 60%–70% 的产品完成度判断 |
| GAP-14 | 进度口径偏工程，不偏需求 | 产品验收应按 spec 满足率衡量。 | 当前状态板和已完成项多基于工程闭环与治理落地，因此容易高估产品完成度 | P1 | 会持续影响优先级判断和预期管理 |

## 4. 对你刚才提出的 5 个问题的直接归因

### 4.1 为什么没有尽可能忠实设计稿

根因不是“没看到设计稿”，而是：

1. 默认把它当成了**先跑起来的 MVP**，不是**设计忠实度优先的 MVP**
2. 没把“默认双栏、面板不是 overlay”写成仓库里的硬约束
3. UI 收敛一直在做，但空间模型从一开始就偏了

### 4.2 为什么测试完成度和你体感差这么多

因为当前测试证明的是：

1. 代码没坏
2. 扩展能加载
3. 核心 store/service 路径没回归

而不是：

1. 设计稿对齐
2. 历史会话可靠
3. Markdown 结构正确
4. concept 粒度正确
5. AI 结构化服务真实可用

### 4.3 为什么历史对话只像拿到了最近一轮

因为当前 `generator` 只取：

1. 最新 `user` 消息
2. 最新 `assistant` 消息

见 [src/services/generator.ts](/Users/qyx/Desktop/project/thinking-ide/src/services/generator.ts) 中：

1. `const seedQuestion = userMessages.at(-1) ?? messages[0]`
2. `const seedAnswer = assistantMessages.at(-1) ?? messages.at(-1) ?? messages[0]`

也就是说，当前生成策略本来就只围绕“最近一轮”建图，而不是围绕“整个历史会话”建图。

### 4.4 为什么 Markdown 解析看起来不对

因为现在根本还没有 Markdown 结构解析路径。  
当前是：

1. 先拿完整文本
2. 按标点/换行切句
3. 把句段当概念候选

这和“按第一级标题、段落主题、步骤层级建 answer_outline / concept”不是一个层级的实现。

### 4.5 为什么没有主动提出 DeepSeek

因为当前实现一直被限制在“本地启发式先跑通”的思路里。  
但一旦发现：

1. Markdown 结构要利用
2. 概念粒度要精细
3. 节点必须简短
4. answer_outline 要稳定生成

就应该主动提出接真实模型服务。  
这里确实应该更早把 `DeepSeek` 作为候选 AI Structuring Service 提上来，而不是继续沿启发式硬推。

## 5. 后续如何避免同类偏差

### 5.1 从“工程主线”切成“spec 主线”

后续完成度应以：

1. 布局是否对
2. adapter 是否可靠
3. structuring 是否满足概念要求
4. 测试是否覆盖 spec

来汇报，而不是按“已经有几个模块可运行”来汇报。

### 5.2 把以下 5 条补成仓库硬约束

1. **Layout Fidelity Contract**
   默认必须双栏，Overlay 只能 fallback。
2. **Adapter Acceptance Contract**
   必须覆盖历史会话、完整消息扫描、完成状态判定、稳定 MessageRef。
3. **Semantic Extraction Contract**
   `answer_outline`、Markdown 结构、短概念标题、3–7 个 concept。
4. **Privacy Storage Contract**
   不长期存完整问答原文。
5. **LLM Integration Decision Gate**
   当启发式不满足概念质量要求时，必须升级真实 AI 服务。

### 5.3 重新排序后续执行优先级

建议新的优先级顺序为：

1. **P0：修正默认布局为真实 4:6 双栏**
2. **P0：重写 ChatAdapter / completion detection / 历史会话扫描口径**
3. **P0：确定 AI Structuring Service 方案**
   候选可以直接包含 `DeepSeek`
4. **P0：引入 Markdown / answer_outline / concept extraction 正确链路**
5. **P0：修正持久化隐私边界**
6. **P0：补真实需求验收测试**
7. **P1：补 panel collapse / i18n / state views / multi-source jump**

## 6. 建议的下一轮执行目标

下一轮不建议继续无差别堆功能。  
更合适的是先完成一个“重新对齐阶段”，至少产出：

1. **layout fidelity 定义**
2. **adapter acceptance 定义**
3. **AI structuring 方案决策**
4. **当前测试缺口清单**

然后再继续开发。

如果直接继续沿当前实现堆功能，后面返工成本会更高。
