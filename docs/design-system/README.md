# Design System

This folder turns the existing Thinking IDE specs into an implementable design-system layer.

Use this layer when a slice changes visual hierarchy, interaction surfaces, or reusable UI patterns.

## Purpose

The design-system layer exists to make one repo-level rule explicit:

1. `shadcn/ui` and `Radix UI` are implementation primitives.
2. Notion is the visual baseline for workspace structure, restraint, and surface language.
3. The product specs under [../specs/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/README.md) still own product intent and interaction behavior.

## Read In This Order

1. [overview.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/overview.md)
2. [notion-baseline.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/notion-baseline.md)
3. [foundations.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/foundations.md)
4. [component-patterns.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/component-patterns.md)
5. [implementation-guidance.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/implementation-guidance.md)

## Governing Inputs

This design-system layer is derived from:

1. [thinking_ide_交互设计规范文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_交互设计规范文档.md)
2. [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)
3. [thinking_ide_低保真原型文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_低保真原型文档.md)
4. [thinking_ide_mvp_项目文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_mvp_项目文档.md)

## How To Use It

1. Start with the governing spec docs for behavior and structure.
2. Use this folder to decide how that behavior should look and feel.
3. Implement using shared tokens and reusable patterns before adding page-specific styling.
4. Update this folder when the visual baseline, foundations, or reusable patterns change.
