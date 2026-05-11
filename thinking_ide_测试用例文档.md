# Thinking IDE 测试用例文档

## 1. 文档信息

| 字段 | 内容 |
|---|---|
| 产品名称 | Thinking IDE |
| 文档类型 | Test Cases / 测试用例文档 |
| 版本 | v0.1 |
| 阶段 | MVP |
| 测试范围 | Chrome Extension + Thinking Panel + ChatAdapter + Concept Map Canvas + Local Persistence |
| 依据文档 | MVP v0.2 / PRD / 交互设计规范 / 组件设计文档 / 数据模型文档 / 技术方案文档 |

## 2. 测试目标

本测试用例文档用于验证 Thinking IDE MVP 是否完成核心技术闭环：

```text
Chrome Extension 注入官方 Chat 页面
↓
Shadow DOM 挂载 React App
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
SourceLocator 跳转官方 Chat 原文
```

测试重点：

1. 插件是否能稳定注入。
2. Thinking Panel 是否不影响官方 Chat 使用。
3. ChatAdapter 是否能识别消息和会话。
4. AI 回复完成判断是否可靠。
5. Concept Map 节点和关系是否能生成、展示、编辑和保存。
6. 节点原文跳转是否可用。
7. 页面刷新和历史会话恢复是否可靠。
8. 异常状态是否有明确反馈。
9. 本地存储是否符合隐私边界。

## 3. 测试范围

## 3.1 测试包含范围

| 模块 | 是否测试 | 说明 |
|---|---|---|
| Chrome Extension 注入 | 是 | Manifest V3 / Content Script / Shadow DOM |
| Thinking Panel 布局 | 是 | 4:6 布局 / 收起展开 / Overlay fallback |
| ChatAdapter | 是 | 会话识别 / 消息扫描 / 消息监听 |
| AI 回复完成判断 | 是 | DOM 状态 + 文本稳定策略 |
| AI Structuring 调用 | 是 | Background 请求 / 成功 / 失败 / 超时 |
| Concept Map Canvas | 是 | React Flow 节点和关系渲染 |
| 节点交互 | 是 | 选中 / 重命名 / 拖拽 / 删除 / 连接 |
| 关系交互 | 是 | 创建 / 编辑 / 删除 |
| SourceLocator | 是 | question / answer / outline / concept 跳转 |
| IndexedDB 持久化 | 是 | 保存 / 恢复 / 逻辑删除 |
| i18n | 是 | 中文 / English 切换 |
| 异常状态 | 是 | DOM 识别失败 / 生成失败 / 定位失败 / 存储失败 |
| 隐私边界 | 是 | 不长期存储完整问答 |

## 3.2 MVP 暂不测试范围

| 模块 | 原因 |
|---|---|
| 跨设备同步 | MVP 不做 |
| 多人协作 | MVP 不做 |
| 导出 PPT / 图片 / Markdown | MVP 不做 |
| 复杂自动布局算法 | MVP 不做 |
| 完整后端账户系统 | MVP 不做 |
| 大规模图谱性能压测 | MVP 仅做基础节点数量验证 |
| 多 AI Chat 平台适配 | MVP 优先 ChatGPT 官方页面 |

## 4. 测试环境

## 4.1 浏览器环境

| 项目 | 要求 |
|---|---|
| 浏览器 | Chrome 最新稳定版 |
| 插件规范 | Manifest V3 |
| 操作系统 | macOS / Windows 至少各验证一次，MVP 可优先 macOS |
| 目标页面 | https://chatgpt.com/* |

## 4.2 数据环境

测试需要准备以下会话场景：

1. 空会话。
2. 单轮短问答。
3. 单轮长回答。
4. 多轮连续追问。
5. 含 Markdown 标题的回答。
6. 不含标题但有段落结构的回答。
7. 历史会话。
8. 长 Session 会话。
9. 插件已有本地 Concept Map 数据的会话。
10. 插件无本地数据的新会话。

## 4.3 网络环境

测试以下网络状态：

1. 正常网络。
2. AI Structuring Service 超时。
3. AI Structuring Service 返回错误。
4. AI Structuring Service 返回非法 JSON。
5. IndexedDB 可用。
6. IndexedDB 写入失败模拟。

## 5. 测试优先级定义

| 优先级 | 定义 |
|---|---|
| P0 | MVP 核心闭环必须通过，否则不可发布 |
| P1 | 重要功能，影响主要体验，但可有 fallback |
| P2 | 边缘场景或后续优化项 |

## 6. 插件注入与布局测试

### TC-EXT-001 插件在目标页面自动注入

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 已安装插件，打开 https://chatgpt.com/* |
| 测试步骤 | 1. 打开 ChatGPT 页面；2. 等待页面加载完成；3. 观察右侧区域 |
| 预期结果 | Thinking Panel 自动出现在页面右侧 |
| 验证点 | Content Script 成功运行；React App 成功挂载 |

### TC-EXT-002 非目标页面不注入

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 已安装插件，打开非 ChatGPT 页面 |
| 测试步骤 | 1. 打开任意非匹配域名页面；2. 检查页面右侧 |
| 预期结果 | Thinking Panel 不出现 |
| 验证点 | host_permissions 和匹配逻辑正确 |

### TC-EXT-003 Thinking Panel 默认 4:6 布局

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 插件已注入 |
| 测试步骤 | 1. 查看页面布局；2. 观察 Chat Area 与 Thinking Panel 的宽度比例 |
| 预期结果 | Chat Area 约 40%，Thinking Panel 约 60% |
| 验证点 | Layout Mode 生效；Thinking Panel 提供足够画布空间 |

### TC-EXT-004 Layout Mode 失败时 fallback 到 Overlay Mode

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 模拟 Chat 主容器识别失败 |
| 测试步骤 | 1. 阻断 Layout Mode 容器选择；2. 重新加载页面；3. 观察 Thinking Panel |
| 预期结果 | Thinking Panel 以 Overlay Mode 显示，不影响官方 Chat 使用 |
| 验证点 | fallback 可用 |

### TC-EXT-005 面板收起与展开

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | Thinking Panel 展开 |
| 测试步骤 | 1. 点击 Header 收起按钮；2. 查看右侧窄条；3. 点击窄条展开 |
| 预期结果 | 面板可收起为窄条，并可重新展开 |
| 验证点 | PanelStore.isCollapsed 正确更新 |

### TC-EXT-006 Shadow DOM 样式隔离

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | Thinking Panel 已注入 |
| 测试步骤 | 1. 检查官方 Chat 页面样式；2. 检查 Thinking Panel 组件样式；3. 打开 Popover / Dropdown |
| 预期结果 | 插件样式不污染官方页面；官方样式不污染插件；弹层样式正常 |
| 验证点 | Shadow DOM 和 portal-root 正常 |

## 7. ChatAdapter 测试

### TC-ADP-001 识别 conversationKey

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 打开一个 ChatGPT 会话 |
| 测试步骤 | 1. 插件初始化；2. 读取 conversationKey；3. 刷新页面后再次读取 |
| 预期结果 | 同一会话 conversationKey 保持稳定 |
| 验证点 | ConversationDetector 可靠 |

### TC-ADP-002 扫描历史用户消息

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 当前会话已有多条用户消息 |
| 测试步骤 | 1. 插件初始化；2. MessageScanner 扫描页面；3. 查看 NormalizedMessage 列表 |
| 预期结果 | 所有可见用户消息被识别，role = user |
| 验证点 | 用户消息 DOM 识别正确 |

### TC-ADP-003 扫描历史 AI 消息

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 当前会话已有多条 AI 消息 |
| 测试步骤 | 1. 插件初始化；2. MessageScanner 扫描页面；3. 查看 NormalizedMessage 列表 |
| 预期结果 | 所有可见 AI 消息被识别，role = assistant |
| 验证点 | AI 消息 DOM 识别正确 |

### TC-ADP-004 消息 orderIndex 正确

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 当前会话有多轮消息 |
| 测试步骤 | 1. 扫描消息；2. 检查 orderIndex |
| 预期结果 | 消息按页面顺序递增 |
| 验证点 | MessageRef 恢复基础正确 |

### TC-ADP-005 新增用户消息监听

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 插件已运行 |
| 测试步骤 | 1. 用户发送新问题；2. 观察 MessageObserver 输出 |
| 预期结果 | 新用户消息被监听并生成 MessageRef |
| 验证点 | MutationObserver 可用 |

### TC-ADP-006 新增 AI 消息监听

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 用户发送问题，AI 开始回答 |
| 测试步骤 | 1. 等待 AI 回复生成；2. 观察 MessageObserver 输出 |
| 预期结果 | 新 AI 消息被监听并生成 MessageRef |
| 验证点 | assistant message 识别正确 |

### TC-ADP-007 MessageRef 包含 textHash 和 textPreview

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 消息已识别 |
| 测试步骤 | 1. 查看 MessageRef；2. 检查 textHash / textPreview |
| 预期结果 | textHash 存在；textPreview 为短文本，不是完整原文 |
| 验证点 | 隐私边界与恢复策略 |

## 8. AI 回复完成判断测试

### TC-GEN-001 AI 流式生成中不触发最终解析

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 用户发送问题，AI 正在流式回复 |
| 测试步骤 | 1. 观察 AI 回复生成中；2. 查看 Concept Map 是否生成 |
| 预期结果 | 不生成最终 Concept Map 草稿，仅显示等待状态 |
| 验证点 | 避免不完整解析 |

### TC-GEN-002 AI 回复完成后自动解析

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | AI 回复完成 |
| 测试步骤 | 1. 等待回复结束；2. 观察 Thinking Panel |
| 预期结果 | 自动触发结构化解析，并生成节点和关系 |
| 验证点 | 回复完成判断有效 |

### TC-GEN-003 文本稳定策略生效

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 无法识别官方生成状态 DOM |
| 测试步骤 | 1. 模拟 DOM 状态不可用；2. AI 回复完成后文本 1.5-2 秒不变化 |
| 预期结果 | 系统认为回复完成并触发解析 |
| 验证点 | fallback 完成判断可用 |

### TC-GEN-004 同一轮自动解析只触发一次

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 同一条 AI 回复完成 |
| 测试步骤 | 1. 等待自动解析；2. 继续观察 10 秒；3. 检查生成记录 |
| 预期结果 | 同一 messageRefId 不重复自动生成多份结构 |
| 验证点 | parsedAt / 防重复逻辑 |

### TC-GEN-005 手动重新解析可再次触发

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 某轮回答已经解析过 |
| 测试步骤 | 1. 点击 Header 重新解析；2. 等待结果 |
| 预期结果 | 重新解析成功，新增草稿节点，不覆盖用户编辑内容 |
| 验证点 | 自动解析与手动解析规则区分 |

## 9. AI Structuring Service 测试

### TC-AI-001 成功返回合法 nodes / edges

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | Background Service Worker 可访问结构化服务 |
| 测试步骤 | 1. 触发结构化请求；2. 检查返回数据 |
| 预期结果 | 返回合法 nodes / edges JSON |
| 验证点 | Background 调用链路正常 |

### TC-AI-002 返回非法 JSON 时进入生成失败状态

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 模拟结构化服务返回非法 JSON |
| 测试步骤 | 1. 触发结构化请求；2. 观察 UI |
| 预期结果 | 显示 GenerationErrorState，不影响旧图谱 |
| 验证点 | invalid JSON 处理 |

### TC-AI-003 请求超时处理

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 模拟结构化服务 30 秒无响应 |
| 测试步骤 | 1. 触发结构化请求；2. 等待超时 |
| 预期结果 | 进入生成失败状态，允许重试 |
| 验证点 | timeout 处理 |

### TC-AI-004 结构化请求只发送当前轮问答

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 当前会话有多轮历史消息 |
| 测试步骤 | 1. 触发最新一轮解析；2. 检查请求 payload |
| 预期结果 | payload 只包含当前轮 userMessage / assistantMessage，不包含完整历史会话 |
| 验证点 | 隐私边界 |

## 10. Concept Map 渲染测试

### TC-CANVAS-001 React Flow 成功渲染节点

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | Store 中存在 nodes |
| 测试步骤 | 1. 进入会话；2. 查看 Concept Map Canvas |
| 预期结果 | 节点显示在画布中，默认只展示标题 |
| 验证点 | mapDomainNodesToFlowNodes 正常 |

### TC-CANVAS-002 React Flow 成功渲染关系线

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | Store 中存在 edges |
| 测试步骤 | 1. 查看 Concept Map Canvas；2. 观察节点之间关系 |
| 预期结果 | 关系线正确连接 source / target，并显示 label |
| 验证点 | mapDomainEdgesToFlowEdges 正常 |

### TC-CANVAS-003 removed 节点不渲染

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 某节点 status = removed |
| 测试步骤 | 1. 重新渲染画布；2. 查找该节点 |
| 预期结果 | removed 节点不显示在主视图 |
| 验证点 | 主视图过滤规则 |

### TC-CANVAS-004 removed 关系不渲染

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 某关系 status = removed |
| 测试步骤 | 1. 重新渲染画布；2. 查找该关系线 |
| 预期结果 | removed 关系不显示 |
| 验证点 | Edge 过滤规则 |

### TC-CANVAS-005 画布平移和缩放可用

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | Canvas 已渲染 |
| 测试步骤 | 1. 拖动画布；2. 使用缩放控件 |
| 预期结果 | 画布可平移、缩放，节点位置正确 |
| 验证点 | React Flow 基础能力可用 |

## 11. 节点交互测试

### TC-NODE-001 单击节点只选中，不跳转原文

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 画布存在节点 |
| 测试步骤 | 1. 单击节点；2. 观察左侧 Chat Area；3. 观察右侧节点状态 |
| 预期结果 | 节点 selected，Floating Toolbar 显示，左侧 Chat 不滚动 |
| 验证点 | 节点点击采用方案 B |

### TC-NODE-002 点击空白画布取消选中

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 某节点已 selected |
| 测试步骤 | 1. 点击画布空白区域 |
| 预期结果 | 节点取消 selected，Floating Toolbar 隐藏 |
| 验证点 | clearSelection 生效 |

### TC-NODE-003 同一时间只允许一个 selected node

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 画布存在多个节点 |
| 测试步骤 | 1. 点击节点 A；2. 点击节点 B |
| 预期结果 | A 取消 selected，B selected |
| 验证点 | selection 状态正确 |

### TC-NODE-004 双击标题进入重命名状态

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 画布存在节点 |
| 测试步骤 | 1. 双击节点标题 |
| 预期结果 | 节点显示 Input 编辑态 |
| 验证点 | 标题编辑入口可用 |

### TC-NODE-005 Enter 保存标题

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 节点处于标题编辑态 |
| 测试步骤 | 1. 输入新标题；2. 按 Enter |
| 预期结果 | 标题保存，node.status = edited，updatedBy = user |
| 验证点 | updateNodeTitle 正确 |

### TC-NODE-006 Esc 取消标题编辑

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 节点处于标题编辑态 |
| 测试步骤 | 1. 修改标题；2. 按 Esc |
| 预期结果 | 不保存修改，恢复原标题 |
| 验证点 | 取消编辑逻辑 |

### TC-NODE-007 空标题不允许保存

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 节点处于标题编辑态 |
| 测试步骤 | 1. 清空标题；2. 按 Enter |
| 预期结果 | 不保存，保持编辑态，显示轻提示 |
| 验证点 | 输入校验 |

### TC-NODE-008 拖拽节点更新 layout

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 画布存在节点 |
| 测试步骤 | 1. 拖拽节点到新位置；2. 松开鼠标；3. 检查数据 |
| 预期结果 | layout.x / layout.y 更新并持久化 |
| 验证点 | onNodeDragStop + Repository 保存 |

### TC-NODE-009 拖拽节点不触发原文跳转

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 画布存在节点 |
| 测试步骤 | 1. 按住节点拖拽超过 5px；2. 观察左侧 Chat Area |
| 预期结果 | 左侧 Chat 不滚动，不触发 SourceLocator |
| 验证点 | click / drag 区分正确 |

### TC-NODE-010 Delete 删除选中节点

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 节点 selected |
| 测试步骤 | 1. 按 Delete 或 Backspace |
| 预期结果 | 节点从主视图隐藏，status = removed，Toast 显示撤销 |
| 验证点 | 逻辑删除与反馈 |

### TC-NODE-011 撤销最近一次删除节点

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 节点刚被删除，Toast 显示撤销 |
| 测试步骤 | 1. 点击撤销 |
| 预期结果 | 节点恢复，相关边恢复 |
| 验证点 | RecentAction 运行时撤销 |

## 12. Floating Toolbar 测试

### TC-TOOLBAR-001 节点 selected 后显示 Toolbar

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 画布存在节点 |
| 测试步骤 | 1. 单击节点 |
| 预期结果 | Floating Toolbar 出现在节点附近 |
| 验证点 | selectedNodeId 驱动 overlay 显示 |

### TC-TOOLBAR-002 点击重命名进入标题编辑

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | Toolbar 已显示 |
| 测试步骤 | 1. 点击“重命名” |
| 预期结果 | 节点进入标题编辑态，Toolbar 隐藏 |
| 验证点 | Toolbar 操作正确 |

### TC-TOOLBAR-003 点击原文触发 SourceLocator

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 节点 selected，Toolbar 已显示 |
| 测试步骤 | 1. 点击“原文” |
| 预期结果 | 触发原文定位流程 |
| 验证点 | 原文跳转入口正确 |

### TC-TOOLBAR-004 点击空白区域隐藏 Toolbar

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | Toolbar 已显示 |
| 测试步骤 | 1. 点击画布空白区域 |
| 预期结果 | Toolbar 隐藏 |
| 验证点 | clearSelection 生效 |

### TC-TOOLBAR-005 节点靠近边缘时 Toolbar 避让

| 字段 | 内容 |
|---|---|
| 优先级 | P2 |
| 前置条件 | 节点位于画布顶部或边缘 |
| 测试步骤 | 1. 选中边缘节点 |
| 预期结果 | Toolbar 显示在可见区域内，不被裁切 |
| 验证点 | overlay 定位策略 |

## 13. 关系交互测试

### TC-EDGE-001 从连接点拖线创建关系

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 画布存在两个节点 |
| 测试步骤 | 1. 从节点 A 的连接点拖线到节点 B |
| 预期结果 | 创建关系流程启动，EdgeEditPopover 出现 |
| 验证点 | React Flow onConnect 可用 |

### TC-EDGE-002 不允许连接自己

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 画布存在节点 |
| 测试步骤 | 1. 从节点 A 连接到节点 A |
| 预期结果 | 不创建 edge，显示轻提示 |
| 验证点 | 连接校验 |

### TC-EDGE-003 保存关系 label 和 type

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | EdgeEditPopover 已打开 |
| 测试步骤 | 1. 选择 relationType；2. 输入 label；3. 点击保存 |
| 预期结果 | edge 创建或更新，status = edited，label 正确显示 |
| 验证点 | updateEdge / connectNodes 正确 |

### TC-EDGE-004 点击关系线打开编辑 Popover

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 画布存在关系线 |
| 测试步骤 | 1. 点击关系线 |
| 预期结果 | edge selected，EdgeEditPopover 打开 |
| 验证点 | edge click 事件正常 |

### TC-EDGE-005 Delete 删除选中关系

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 关系线 selected |
| 测试步骤 | 1. 按 Delete / Backspace |
| 预期结果 | 关系从主视图隐藏，status = removed，Toast 显示撤销 |
| 验证点 | 关系逻辑删除 |

## 14. SourceLocator 原文定位测试

### TC-SRC-001 question node 跳转用户消息

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | question node 有 user_message source |
| 测试步骤 | 1. 选中 question node；2. 点击 Toolbar 原文 |
| 预期结果 | 左侧 Chat 滚动到对应用户消息，并高亮 1.5-3 秒 |
| 验证点 | scrollToMessage user 可用 |

### TC-SRC-002 answer node 跳转 AI 回复整体

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | answer node 有 assistant_message source |
| 测试步骤 | 1. 选中 answer node；2. 点击 Toolbar 原文 |
| 预期结果 | 左侧 Chat 滚动到对应 AI 回复整体，并高亮 |
| 验证点 | scrollToMessage assistant 可用 |

### TC-SRC-003 answer_outline node 跳转回答段落

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | answer_outline node 有 message_block source 和 anchor |
| 测试步骤 | 1. 选中 outline node；2. 点击 Toolbar 原文 |
| 预期结果 | 左侧 Chat 滚动到对应回答段落，并高亮 |
| 验证点 | scrollToAnchor 可用 |

### TC-SRC-004 anchor 找不到时跳转完整回答

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | outline node 的 anchor 失效，但 messageRef 有效 |
| 测试步骤 | 1. 点击 Toolbar 原文 |
| 预期结果 | 跳转到 AI 完整回答，提示精确段落无法定位 |
| 验证点 | anchor fallback |

### TC-SRC-005 messageRef 找不到时标记 source_lost

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 节点 source messageRef 无法匹配 DOM |
| 测试步骤 | 1. 点击 Toolbar 原文 |
| 预期结果 | 节点 sourceStatus = lost，显示 ⚠，Toast 提示 |
| 验证点 | source_lost 规则 |

### TC-SRC-006 concept node 单来源直接跳转

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | concept node 只有一个 source |
| 测试步骤 | 1. 点击 Toolbar 原文 |
| 预期结果 | 直接跳转该 source |
| 验证点 | 单来源处理 |

### TC-SRC-007 concept node 多来源显示来源列表

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | concept node 有多个 sources |
| 测试步骤 | 1. 点击 Toolbar 原文 |
| 预期结果 | SourceListPopover 显示来源列表；用户选择后跳转 |
| 验证点 | 多来源处理 |

### TC-SRC-008 manual node 无来源提示

| 字段 | 内容 |
|---|---|
| 优先级 | P2 |
| 前置条件 | 手动节点无 sources |
| 测试步骤 | 1. 点击 Toolbar 原文 |
| 预期结果 | Toast 提示暂无可定位来源 |
| 验证点 | no_source 处理 |

## 15. 本地存储与刷新恢复测试

### TC-DB-001 AI 生成节点持久化

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | AI 结构化生成成功 |
| 测试步骤 | 1. 生成节点；2. 检查 IndexedDB nodes 表 |
| 预期结果 | nodes 正确保存，包含 conversationKey / roles / layout |
| 验证点 | Repository.saveNodes |

### TC-DB-002 AI 生成关系持久化

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | AI 结构化生成成功 |
| 测试步骤 | 1. 生成关系；2. 检查 IndexedDB edges 表 |
| 预期结果 | edges 正确保存，sourceNodeId / targetNodeId 正确 |
| 验证点 | Repository.saveEdges |

### TC-DB-003 节点重命名刷新后保留

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 节点已重命名 |
| 测试步骤 | 1. 刷新页面；2. 恢复当前会话；3. 查看节点标题 |
| 预期结果 | 用户修改后的标题保留 |
| 验证点 | updateNodeTitle 持久化 |

### TC-DB-004 节点拖拽位置刷新后保留

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 节点已拖拽到新位置 |
| 测试步骤 | 1. 刷新页面；2. 查看节点位置 |
| 预期结果 | 节点位置保持用户拖拽后的布局 |
| 验证点 | layout 持久化 |

### TC-DB-005 删除节点刷新后仍隐藏

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 节点已删除 |
| 测试步骤 | 1. 刷新页面；2. 查看画布 |
| 预期结果 | 删除节点不显示，IndexedDB 中 status = removed |
| 验证点 | 逻辑删除持久化 |

### TC-DB-006 历史会话恢复 Concept Map

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 某历史会话已有本地 map 数据 |
| 测试步骤 | 1. 打开历史会话；2. 等待插件恢复 |
| 预期结果 | 对应 Concept Map 恢复显示 |
| 验证点 | conversationKey 查询正确 |

### TC-DB-007 不长期存储完整问答原文

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 已完成多轮结构化生成 |
| 测试步骤 | 1. 检查 IndexedDB 所有表；2. 搜索完整用户提问和完整 AI 回答 |
| 预期结果 | 不存在完整问答原文；仅存在 textPreview / textHash / textQuote 短片段 |
| 验证点 | 隐私约束 |

## 16. 重新解析测试

### TC-REGEN-001 重新解析不覆盖 edited node

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 用户已重命名某节点 |
| 测试步骤 | 1. 点击重新解析；2. 等待生成完成；3. 查看该节点标题 |
| 预期结果 | 用户编辑标题不被覆盖 |
| 验证点 | 用户编辑保护 |

### TC-REGEN-002 重新解析不覆盖用户布局

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 用户已拖拽节点位置 |
| 测试步骤 | 1. 点击重新解析；2. 查看已拖拽节点位置 |
| 预期结果 | 已拖拽节点位置不被自动重排 |
| 验证点 | layout 保护 |

### TC-REGEN-003 重新解析新增节点放在空白区域

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 已有用户布局 |
| 测试步骤 | 1. 触发重新解析；2. 查看新增节点位置 |
| 预期结果 | 新节点出现在当前视图右侧或空白区域，不挤乱旧节点 |
| 验证点 | 新节点布局规则 |

### TC-REGEN-004 removed 节点不自动复活

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 用户删除某 AI 生成节点 |
| 测试步骤 | 1. 重新解析同一轮回答；2. 查看该节点是否重新出现 |
| 预期结果 | 被删除节点不自动恢复到主视图 |
| 验证点 | removed 去重规则 |

## 17. i18n 测试

### TC-I18N-001 切换中文界面

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 打开 SettingsMenu |
| 测试步骤 | 1. 选择 Language = 中文 |
| 预期结果 | UI 文案切换为中文 |
| 验证点 | i18n 生效 |

### TC-I18N-002 切换英文界面

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 打开 SettingsMenu |
| 测试步骤 | 1. 选择 Language = English |
| 预期结果 | UI 文案切换为英文 |
| 验证点 | i18n 生效 |

### TC-I18N-003 已生成节点标题不随 UI 语言变化

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 已有节点；切换语言 |
| 测试步骤 | 1. 切换 UI 语言；2. 查看节点标题 |
| 预期结果 | 节点标题保持原语言，不自动翻译 |
| 验证点 | 节点内容与 UI 文案分离 |

## 18. 异常状态测试

### TC-ERR-001 Chat DOM 识别失败

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 模拟 ChatAdapter 无法识别页面结构 |
| 测试步骤 | 1. 打开页面；2. 初始化 ChatAdapter |
| 预期结果 | 显示 AdapterErrorState；官方 Chat 不受影响 |
| 验证点 | DOM failure fallback |

### TC-ERR-002 生成失败不影响旧图谱

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 已有旧图谱；下一轮生成失败 |
| 测试步骤 | 1. 模拟结构化服务失败；2. 查看旧图谱 |
| 预期结果 | 旧图谱仍可查看和编辑 |
| 验证点 | generation error 隔离 |

### TC-ERR-003 IndexedDB 写入失败提示

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 模拟 IndexedDB 写入失败 |
| 测试步骤 | 1. 重命名节点；2. 触发保存 |
| 预期结果 | Toast 提示保存失败；内存状态暂时保留 |
| 验证点 | storage error 处理 |

### TC-ERR-004 React UI 崩溃时不影响官方 Chat

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 模拟组件抛错 |
| 测试步骤 | 1. 触发 React 组件错误；2. 查看官方 Chat |
| 预期结果 | ErrorBoundary 显示插件错误面板；官方 Chat 仍可使用 |
| 验证点 | ErrorBoundary 有效 |

## 19. 性能测试

### TC-PERF-001 长对话 MutationObserver 不明显卡顿

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 会话包含大量消息 |
| 测试步骤 | 1. 打开长会话；2. 滚动和发送新消息；3. 观察页面性能 |
| 预期结果 | 官方 Chat 滚动和输入无明显卡顿 |
| 验证点 | MutationObserver debounce / 增量扫描 |

### TC-PERF-002 拖拽节点时不卡顿

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 画布存在一定数量节点 |
| 测试步骤 | 1. 连续拖拽节点；2. 观察画布响应 |
| 预期结果 | 拖拽流畅；拖拽中不频繁写库 |
| 验证点 | onNodeDragStop 写库策略 |

### TC-PERF-003 生成结果批量写入

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | AI 结构化返回多个 nodes / edges |
| 测试步骤 | 1. 触发生成；2. 观察 IndexedDB 写入次数 |
| 预期结果 | 批量写入，而不是逐条高频写入 |
| 验证点 | Repository 批量保存 |

## 20. 隐私与安全测试

### TC-SEC-001 插件只在指定域名启用

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 打开非 ChatGPT 网站 |
| 测试步骤 | 1. 查看插件是否注入 |
| 预期结果 | 不注入，不读取页面内容 |
| 验证点 | host_permissions 生效 |

### TC-SEC-002 不污染官方页面全局样式

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 插件已注入 |
| 测试步骤 | 1. 检查官方 Chat 页面样式；2. 与未安装插件状态对比 |
| 预期结果 | 官方页面样式无异常变化 |
| 验证点 | Shadow DOM 样式隔离 |

### TC-SEC-003 不长期保存完整问答

| 字段 | 内容 |
|---|---|
| 优先级 | P0 |
| 前置条件 | 完成多轮解析 |
| 测试步骤 | 1. 导出 IndexedDB 数据；2. 搜索完整用户问题和完整 AI 回复 |
| 预期结果 | 不存在完整问答原文 |
| 验证点 | 隐私边界 |

### TC-SEC-004 清除当前 map 数据

| 字段 | 内容 |
|---|---|
| 优先级 | P1 |
| 前置条件 | 当前会话有 Concept Map 数据 |
| 测试步骤 | 1. 打开 Settings；2. 点击 Clear current map；3. 确认 |
| 预期结果 | 当前 conversationKey 下 nodes / edges 清除；官方 Chat 不受影响 |
| 验证点 | 数据清除能力 |

## 21. 回归测试清单

每次发布前至少执行以下 P0 回归：

```text
TC-EXT-001 插件在目标页面自动注入
TC-EXT-003 Thinking Panel 默认 4:6 布局
TC-EXT-005 面板收起与展开
TC-ADP-001 识别 conversationKey
TC-ADP-002 扫描历史用户消息
TC-ADP-003 扫描历史 AI 消息
TC-ADP-005 新增用户消息监听
TC-ADP-006 新增 AI 消息监听
TC-GEN-001 AI 流式生成中不触发最终解析
TC-GEN-002 AI 回复完成后自动解析
TC-GEN-004 同一轮自动解析只触发一次
TC-AI-001 成功返回合法 nodes / edges
TC-CANVAS-001 React Flow 成功渲染节点
TC-CANVAS-002 React Flow 成功渲染关系线
TC-NODE-001 单击节点只选中，不跳转原文
TC-NODE-005 Enter 保存标题
TC-NODE-008 拖拽节点更新 layout
TC-NODE-010 Delete 删除选中节点
TC-EDGE-001 从连接点拖线创建关系
TC-EDGE-004 点击关系线打开编辑 Popover
TC-SRC-001 question node 跳转用户消息
TC-SRC-002 answer node 跳转 AI 回复整体
TC-SRC-003 answer_outline node 跳转回答段落
TC-DB-003 节点重命名刷新后保留
TC-DB-004 节点拖拽位置刷新后保留
TC-DB-005 删除节点刷新后仍隐藏
TC-DB-007 不长期存储完整问答原文
TC-ERR-001 Chat DOM 识别失败
TC-ERR-002 生成失败不影响旧图谱
TC-SEC-001 插件只在指定域名启用
TC-SEC-003 不长期保存完整问答
```

## 22. MVP 测试通过标准

MVP 可进入下一阶段的标准：

1. 所有 P0 用例通过。
2. P1 用例通过率不低于 80%。
3. 插件注入失败时不影响官方 Chat。
4. DOM 识别失败时有清晰 fallback。
5. AI 生成失败不影响旧图谱。
6. 节点和关系核心编辑能力可用。
7. 页面刷新后用户编辑结果可恢复。
8. 不长期存储完整问答原文。
9. 原文定位失败时节点仍保留且可编辑。
10. 长对话基础使用无明显卡顿。

