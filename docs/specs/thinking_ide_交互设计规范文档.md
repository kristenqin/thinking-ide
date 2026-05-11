# Thinking IDE 交互设计规范文档

## 1. 文档信息

| 字段 | 内容 |
|---|---|
| 产品名称 | Thinking IDE |
| 文档类型 | Interaction Spec / 交互设计规范 |
| 版本 | v0.1 |
| 阶段 | MVP |
| 产品形态 | 官方 AI Chat 页面右侧 Concept Map 插件 |
| 技术约束 | React + React Flow + shadcn/ui / Radix UI |

## 2. 文档目标

本文档用于定义 Thinking IDE MVP 的核心交互规则，确保设计、开发、测试对以下内容有一致理解：

1. 用户动作如何触发。
2. 系统如何反馈。
3. 节点、关系、画布如何响应。
4. 数据状态如何变化。
5. 异常情况如何处理。

本文档不定义最终视觉样式，但会定义交互状态和行为规则。

## 3. 交互设计原则

### 3.1 直接操作优先

Thinking IDE 是 Concept Map 工作台，不是节点管理后台。节点和关系应尽量支持直接操作。

优先级：

```text
直接操作 > Floating Toolbar > Dropdown / Context Menu
```

### 3.2 节点轻量展示

节点默认只展示概念标题。

role、status、source、createdBy 等系统属性主要存在于数据层，不作为节点主视觉。

### 3.3 用户编辑优先

用户的编辑结果优先于 AI 生成结果。

重新解析、自动布局、AI 新增节点都不能覆盖用户已编辑内容和用户已调整布局。

### 3.4 Chat 原文联动可控

点击节点不直接跳转原文。

MVP 采用方案 B：

```text
单击节点 → 只选中节点
点击 Floating Toolbar 的“原文” → 跳转原文
```

这样避免用户在整理 Concept Map 时频繁触发左侧 Chat 滚动。

### 3.5 系统反馈弱打扰

生成中、失败、恢复、统计等信息尽量通过状态条、底部弱提示、Toast 等方式呈现，不遮挡已有 Concept Map，不打断用户思考。

## 4. 节点交互规范

## 4.1 节点默认态

### 展示内容

默认节点只展示标题。

```text
┌────────────────────┐
│ Concept Map        │
└────────────────────┘
```

默认不展示：

1. role 标签。
2. candidate / edited 状态文案。
3. 原文按钮。
4. 接受 / 忽略按钮。
5. 过多属性信息。

### 数据状态

节点可能具有以下数据状态：

```text
candidate
edited
removed / rejected
source_lost
```

这些状态默认不作为主视觉展示，除 source_lost 需要轻量提示。

## 4.2 节点选中

### 触发方式

```text
用户单击节点
```

### 系统响应

```text
节点进入 selected 状态
显示 Floating Toolbar
不触发 Chat Area 原文跳转
```

### 选中规则

1. 同一时间只允许一个 selected node。
2. 点击另一个节点时，前一个节点取消 selected，新节点 selected。
3. 点击空白画布时，取消当前 selected node。
4. 拖拽节点时保持 selected。
5. 删除 selected node 后取消 selected。

### Wireframe

```text
        ┌──────────────────────┐
        │ 重命名  原文  连接  ⋯ │
        └──────────────────────┘
╔════════════════════╗
║ Concept Map        ║
╚════════════════════╝
```

## 4.3 节点重命名

### 触发方式

1. 双击节点标题。
2. 点击 Floating Toolbar 中的“重命名”。

### 系统响应

节点进入标题编辑态。

```text
┌────────────────────────┐
│ [ Concept Map 工作台 ]  │
│ Esc 取消     Enter 保存 │
└────────────────────────┘
```

### 编辑规则

1. Enter 保存。
2. Esc 取消。
3. 点击节点外部默认保存。
4. 空标题不允许保存，保留编辑态并显示轻提示。
5. 标题过长时节点内省略，hover 显示完整标题。
6. 保存后节点 status = edited。
7. 用户编辑标题优先于 AI 生成标题。

### 异常规则

| 异常 | 处理 |
|---|---|
| 标题为空 | 不保存，显示提示 |
| 标题过长 | 保存，但节点内省略显示 |
| 保存失败 | Toast 提示，保留编辑态 |

## 4.4 节点拖拽

### 触发方式

```text
用户按住节点并移动超过 3-5px
```

### 系统响应

1. 节点进入 dragging 状态。
2. 不触发原文跳转。
3. 与节点相连的边实时跟随。
4. Floating Toolbar 在拖拽过程中隐藏或跟随节点。
5. 拖拽结束后保存 layout。

### 拖拽规则

1. 不做吸附。
2. 不限制画布边界。
3. 拖拽结束后更新 layout.x / layout.y。
4. 用户手动调整过的位置不得被 AI 自动布局覆盖。
5. 重新解析新增节点时，不重排用户已调整节点。

### 数据变化

```ts
node.layout = {
  x: newX,
  y: newY
}
```

## 4.5 节点删除

### 触发方式

1. 选中节点后按 Delete / Backspace。
2. 点击 Floating Toolbar 或 More Menu 中的删除。

### 系统响应

1. 节点从主视图隐藏。
2. 节点 status = removed / rejected。
3. 与该节点相关的边同步隐藏或标记 removed。
4. 显示 Toast：节点已删除。
5. Toast 中提供“撤销”入口。

### 删除规则

1. MVP 删除采用逻辑删除，不物理删除。
2. 不做强二次确认，减少操作负担。
3. 支持最近一次删除撤销。
4. 删除 source_lost 节点与普通节点规则一致。

### Toast 示例

```text
节点已删除  [撤销]
```

## 4.6 节点角色转换

### 触发方式

通过 More Menu 触发：

```text
转为 Concept
转为 Claim
```

### 系统响应

1. 为节点追加对应 role。
2. 节点 status = edited。
3. 节点标题不变。
4. 关系不自动删除。

### 说明

角色转换是低频操作，放入 Dropdown / Context Menu，不放入 Floating Toolbar。

## 5. Floating Toolbar 规范

## 5.1 触发规则

```text
节点 selected 后显示 Floating Toolbar
```

## 5.2 消失规则

Floating Toolbar 在以下情况隐藏：

1. 点击空白画布。
2. 选中其他节点。
3. 节点进入标题编辑态。
4. 节点被删除。
5. 用户开始拖拽节点时，隐藏或跟随节点。
6. 打开其他浮层时，可根据场景隐藏。

## 5.3 位置规则

1. 默认显示在节点上方。
2. 节点靠近面板顶部时，显示在节点下方。
3. 节点靠近面板边缘时，自动向内避让。
4. 不遮挡正在编辑的输入框。

## 5.4 Toolbar 操作

MVP Floating Toolbar 包含：

```text
重命名  原文  连接  删除  ⋯
```

| 操作 | 行为 |
|---|---|
| 重命名 | 节点进入标题编辑态 |
| 原文 | 触发原文跳转流程 |
| 连接 | 开启连接模式 |
| 删除 | 删除当前节点 |
| ⋯ | 打开更多操作菜单 |

## 5.5 More Menu

More Menu 承载低频操作。

```text
┌─────────────────────┐
│ 转为 Concept          │
│ 转为 Claim            │
│ 重新解析来源           │
│ 查看属性              │
│ 删除节点              │
└─────────────────────┘
```

## 6. 关系交互规范

## 6.1 创建关系

### 触发方式

1. 节点 selected 或 hover 时显示连接点。
2. 用户从连接点拖出关系线。
3. 用户连接到目标节点。

### 创建规则

1. 不允许连接自己。
2. 允许连接不同 role 的节点。
3. MVP 允许重复连接，但后续可增加去重提示。
4. 连接完成后弹出 Edge Edit Popover。
5. 默认 relationType = relates_to。
6. 用户保存后创建 edge。
7. 用户取消则不创建 edge。

### 数据变化

```ts
edge = {
  sourceNodeId,
  targetNodeId,
  relationType: 'relates_to',
  label,
  createdBy: 'user',
  status: 'edited'
}
```

## 6.2 关系线点击

### 触发方式

```text
用户点击关系线
```

### 系统响应

1. edge 进入 selected 状态。
2. 显示 Edge Edit Popover。
3. 其他 selected node 取消选中。

## 6.3 关系编辑

### Popover 内容

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

### 编辑规则

1. 用户可以修改 relationType。
2. 用户可以修改 label。
3. 保存后 edge status = edited。
4. 点击取消不保存修改。
5. 点击空白画布关闭 Popover，默认不保存。
6. Delete / Backspace 删除 selected edge。

## 6.4 删除关系

### 触发方式

1. 选中关系线后按 Delete / Backspace。
2. 在 Edge Edit Popover 点击删除关系。

### 系统响应

1. edge 从主视图隐藏。
2. edge status = removed / rejected。
3. 显示 Toast：关系已删除。
4. Toast 可提供撤销。

## 7. 画布交互规范

## 7.1 画布基础行为

基于 React Flow 默认能力实现：

1. 支持平移。
2. 支持缩放。
3. 显示 React Flow Controls。
4. MVP 不默认显示 MiniMap。
5. 点击空白画布取消节点或关系选中。
6. 点击空白画布关闭 Floating Toolbar 和 Popover。

## 7.2 滚轮行为

MVP 使用 React Flow 默认滚轮行为，后续根据真实使用体验调优。

需要避免与官方 Chat Area 的滚动产生明显冲突。

## 7.3 画布与 Chat Area 的空间关系

默认 4:6 布局：

```text
Chat Area：40%
Thinking Panel：60%
```

Thinking Panel 宽度建议：

```css
width: clamp(560px, 60vw, 960px);
```

## 8. 节点与原文跳转规范

## 8.1 触发方式

MVP 采用方案 B：

```text
单击节点 → 只选中节点
点击 Floating Toolbar 的“原文” → 跳转原文
```

## 8.2 不同节点的跳转规则

| 节点 | 跳转目标 |
|---|---|
| question node | 对应用户消息 |
| answer node | 对应 AI 回复整体 |
| answer_outline node | 对应 AI 回复段落 |
| concept node | 单来源直接跳转，多来源展示来源列表 |

## 8.3 跳转成功反馈

1. Chat Area 滚动到目标位置。
2. 原文区域高亮 1.5 到 3 秒。
3. 右侧节点保持 selected 状态。
4. Status Bar 或 Toast 显示：已定位到原文。

## 8.4 answer_outline anchor 失败

如果 answer_outline 的精确 anchor 找不到：

```text
滚动到对应 AI 完整回答
↓
提示：精确段落无法定位，已跳转到对应回答
```

## 8.5 messageRef 失败

如果 messageRef 完全找不到：

1. 节点保留。
2. 节点标记 source_lost。
3. 显示轻量 ⚠ 图标。
4. Toast 提示：原始消息位置暂时无法定位，节点内容仍已保留。

## 8.6 concept node 多来源

### 一个来源

直接跳转。

### 多个来源

展示 Source List Popover。

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

### 无来源

显示提示：

```text
暂无可定位来源
```

## 9. 新节点生成与布局规范

## 9.1 首次生成布局

首次生成 Concept Map 草稿时，采用简单层级布局：

```text
question node
↓
answer node
↓
answer_outline nodes

concept nodes 放在 answer / outline 周边
```

## 9.2 布局规则

1. question node 放在上方。
2. answer node 放在中间。
3. answer_outline nodes 放在 answer 下方。
4. concept nodes 放在右侧或周边。
5. edges 显示关系 label。

## 9.3 用户布局保护

1. 用户拖拽后的节点位置不得被自动覆盖。
2. 重新解析不重排用户已编辑布局。
3. 新增节点放在当前视图右侧或空白区域。
4. 已存在节点不因为新节点加入而大幅移动。

## 10. 重新解析规范

## 10.1 触发入口

1. Header 的重新解析按钮。
2. 选中 answer node 后，More Menu 中的“重新解析来源”。

## 10.2 重新解析规则

1. 重新解析最近一轮或当前选中来源。
2. 重新解析不覆盖 edited nodes。
3. 重新解析不覆盖 user-created nodes。
4. 重新解析不覆盖用户手动调整的 layout。
5. 新节点以草稿形式加入。
6. 相似节点可跳过或标记为可能重复。
7. MVP 使用简单标题去重。

## 10.3 反馈

重新解析中：

```text
正在重新提取节点和关系...
```

重新解析成功：

```text
Added 5 nodes · Your edits were preserved
```

重新解析失败：

```text
重新解析失败，可以稍后重试。
```

## 11. 语言切换规范

## 11.1 入口

语言切换放在 Settings 中。

```text
Settings
├── Language
│   ├── 中文
│   └── English
```

## 11.2 规则

1. 默认跟随浏览器或 Chat 页面语言。
2. 用户可以手动切换中文 / English。
3. 切换后 UI 文案立即生效。
4. MVP 暂不强制改变已生成节点语言。
5. AI 生成节点语言默认跟随当前对话语言。

## 12. 生成中与失败状态规范

## 12.1 AI 回复生成中

规则：

1. 不锁定旧图谱。
2. 不遮挡已有 Concept Map。
3. 用户可以继续查看和编辑已有节点。
4. 状态条显示：等待 AI 回复完成。

## 12.2 结构化生成中

规则：

1. 不遮挡旧图谱。
2. 用户可以继续查看和编辑已有节点。
3. 状态条显示：正在从当前回答中提取节点和关系。

## 12.3 生成失败

规则：

1. 只提示本轮失败。
2. 不影响旧图谱。
3. 提供“重试 / 忽略本轮”。

提示：

```text
本轮 Concept Map 草稿生成失败，可以稍后重试。
```

## 13. source_lost 交互规范

## 13.1 状态说明

source_lost 表示节点仍存在，但无法定位到原始 Chat 内容。

## 13.2 节点行为

source_lost 节点仍可：

1. 选中。
2. 重命名。
3. 拖拽。
4. 连接。
5. 删除。

## 13.3 原文跳转行为

当用户点击 source_lost 节点的“原文”时：

```text
显示 Toast：原始消息位置暂时无法定位，节点内容仍已保留。
```

## 13.4 视觉提示

```text
┌────────────────────┐
│ Concept Map      ⚠ │
└────────────────────┘
```

Tooltip：

```text
原文定位失效，节点仍可编辑。
```

## 14. 快捷键规范

MVP 支持最小快捷键集合：

| 快捷键 | 行为 |
|---|---|
| Enter | 保存标题编辑 |
| Esc | 取消标题编辑 / 关闭浮层 |
| Delete / Backspace | 删除选中节点或关系 |
| Cmd / Ctrl + Z | MVP 可暂不做，建议预留 |

## 15. 异常与反馈规范

## 15.1 删除反馈

删除节点或关系后显示 Toast：

```text
节点已删除  [撤销]
```

或：

```text
关系已删除  [撤销]
```

MVP 建议至少支持最近一次删除撤销。

## 15.2 连接失败

连接失败时不创建 edge，并显示轻提示。

常见失败原因：

1. 连接到自己。
2. 连接目标无效。
3. 用户取消关系编辑。

## 15.3 保存失败

保存标题或关系失败时，显示 Toast，并保留当前编辑态。

## 15.4 DOM 识别失败

当 Chat Adapter 无法识别官方 Chat 页面结构时：

```text
当前页面结构暂时无法识别，Thinking IDE 需要更新适配规则。
```

官方 Chat 页面仍可正常使用。

## 16. 交互优先级

| 优先级 | 交互 | 原因 |
|---|---|---|
| P0 | 单击节点选中 | 节点操作基础 |
| P0 | Floating Toolbar | 高频操作入口 |
| P0 | 原文跳转 | 核心价值 |
| P0 | 节点重命名 | 用户主动建模核心 |
| P0 | 节点拖拽 | Concept Map 基础操作 |
| P0 | 节点删除 | 清理 AI 草稿 |
| P0 | 节点连接 | Concept Map 核心 |
| P0 | 关系编辑 | 建立认知关系 |
| P1 | source_lost | 历史恢复可靠性 |
| P1 | 重新解析 | 处理生成质量波动 |
| P1 | 语言切换 | 国际化基础 |
| P1 | 最近一次撤销 | 减少误删成本 |

## 17. 核心交互闭环

```text
AI 生成节点和关系草稿
↓
用户单击节点选中
↓
用户通过 Floating Toolbar 或直接操作整理节点
↓
用户拖拽节点调整布局
↓
用户拖线连接节点
↓
用户点击“原文”回到 Chat 上下文
↓
Concept Map 与聊天思考过程同步更新
```

这个闭环成立后，Thinking IDE 的 MVP 交互体验成立。

