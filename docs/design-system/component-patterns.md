# Component Patterns

This document defines the reusable UI patterns that should guide the current MVP surfaces.

Use these patterns before inventing slice-specific styling.

## Governing Specs

These patterns are primarily derived from:

1. [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)
2. [thinking_ide_交互设计规范文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_交互设计规范文档.md)
3. [thinking_ide_低保真原型文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_低保真原型文档.md)

## 1. Panel Header

### Role

The header establishes the workspace identity and the current high-level state.

### Should include

1. workspace title
2. one lightweight state expression
3. one high-value refresh/regenerate affordance
4. settings or collapse affordances kept visually secondary

### Should not become

1. a dense action toolbar
2. a dashboard badge row
3. a heavy chrome band separating itself from the rest of the panel

## 2. Status Bar

### Role

The status bar communicates quiet operational context.

### Pattern

1. small semantic label
2. optional supporting hint
3. weak surface treatment

### Usage rule

If the message is not critical, keep it here or in the bottom log rather than escalating it into the main canvas.

## 3. Bottom Log

### Role

The bottom log is a low-interruption place for:

1. restore notices
2. regenerate summaries
3. source-jump feedback
4. undo confirmations

### Pattern

1. single-line or short multi-line copy
2. subtle separator from canvas
3. optional inline action such as undo

## 4. Concept Node

### Role

Nodes should remain concept-first.

### Default presentation

1. title is primary
2. system metadata is hidden or secondary
3. status is not the main visual treatment

### Selected presentation

1. selected state is clear
2. nearby tools appear through the floating toolbar
3. node does not become a mini form

### `source_lost` presentation

1. use a light warning affordance
2. do not let the warning dominate the node title
3. pair color with iconography or hint text

## 5. Node Floating Toolbar

### Role

This is the main direct-manipulation tool surface.

### Pattern

1. compact floating card
2. actions prioritized around rename, source jump, connect, and overflow
3. text-first or balanced text/icon treatment

### Interaction rule

It should feel attached to the node, not like a detached inspector window.

## 6. Edge Edit Popover

### Role

The edge editor is a small semantic adjustment tool.

### Pattern

1. compact popover
2. limited choice set
3. strong clarity around current relation

### Avoid

1. large modal treatment
2. overly decorative relation styling

## 7. State Views

### Empty

Should feel like a calm invitation to begin thinking.

### Generating

Should suggest progress without turning the workspace into a loading screen.

### Failed

Should present recovery clearly but quietly.

### Adapter Error

Should explain the host-page problem without overwhelming the user.

## 8. Canvas Chrome

### Role

Canvas chrome may exist, but only to orient the user inside the workspace.

### Allowed uses

1. quiet title or mode hint
2. selection context
3. concept/link counts
4. `source_lost` cue

### Avoid

1. framing the canvas like a developer tool surface
2. stacking multiple banners
3. making the chrome more visually important than the nodes
