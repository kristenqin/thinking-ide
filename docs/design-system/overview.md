# Design System Overview

Thinking IDE needs a design system because the repo already has clear product and interaction specs, but did not yet have a stable visual and implementation baseline.

This folder fills that gap.

## Scope

This design-system layer defines:

1. The visual authority for the MVP workspace.
2. Foundational tokens and semantic roles.
3. Reusable component patterns for the right-side concept-map workspace.
4. The implementation rules frontend slices should follow when building user-facing UI.

It does not replace:

1. Product scope in [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md)
2. Interaction behavior in [thinking_ide_交互设计规范文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_交互设计规范文档.md)
3. Component boundaries in [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)

## Design-System Authority

Use the following authority order for user-facing implementation:

1. Product and interaction intent from the relevant spec docs.
2. Visual baseline and foundations from this design-system folder.
3. `shadcn/ui` and `Radix UI` for primitives, accessibility, and overlay behavior.
4. Local component implementation details.

The important distinction is:

1. `shadcn/ui` and `Radix UI` define how primitives are built.
2. They do not define the final product aesthetic in this repo.
3. Notion-style workspace restraint defines that aesthetic baseline here.

## What “Notion Baseline” Means In This Repo

It means the product should inherit these qualities:

1. Page-like calm instead of dashboard chrome.
2. Strong hierarchy through spacing and typography, not loud decoration.
3. Neutral surfaces with only small, intentional accents.
4. Weak borders, light shadows, and readable density.
5. Feedback that feels document-adjacent and non-interruptive.
6. Detail surfaces that behave like side panels, popovers, and lightweight page tools.

It does not mean:

1. Pixel-for-pixel cloning of Notion UI.
2. Copying Notion branding, logos, or product-specific features.
3. Ignoring the concept-map nature of Thinking IDE.

## MVP Surfaces Covered Now

This initial design-system version is concrete enough to guide:

1. `ThinkingPanel`
2. `PanelHeader`
3. `StatusBar`
4. `BottomLog`
5. `ConceptMapCanvas`
6. `ConceptNode`
7. `NodeFloatingToolbar`
8. `EdgeEditPopover`
9. `StateViews`

## Repo Rule

For user-facing slices, frontend implementation should move through this chain:

`Spec -> Design System -> Tokens / Patterns -> Component Implementation`

Do not skip directly from spec text to ad hoc styling unless the slice is a clearly documented temporary exception.
