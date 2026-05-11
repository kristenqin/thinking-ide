# Implementation Guidance

This document translates the design-system layer into implementation rules for the frontend.

## Implementation Stack Rule

Use this stack consistently:

1. Product and interaction specs define behavior and structure.
2. The design-system folder defines visual baseline, tokens, and reusable patterns.
3. `shadcn/ui` and `Radix UI` provide primitives and accessibility foundations.
4. Local components compose those primitives into Thinking IDE-specific surfaces.

## Frontend Delivery Rule

For any user-facing slice:

1. name the governing spec docs
2. name the relevant design-system docs
3. decide whether the slice is `Logic-only`, `UI-coupled`, or `UI-alignment`
4. implement against shared tokens and patterns before page-local overrides

## Expected Code-Level Outcomes

The frontend should move toward:

1. shared CSS variables or token files for surfaces, text, border, and state colors
2. reusable workspace primitives for header, bottom log, toolbars, and state cards
3. minimal one-off style declarations in feature components
4. explicit state variants rather than ad hoc conditional classes everywhere

## Preferred Primitive Mapping

Use `shadcn/ui` and `Radix UI` like this:

| Need | Preferred primitive direction |
|---|---|
| command-like actions | `Button` |
| text editing | `Input` |
| compact menus | `DropdownMenu` or `ContextMenu` |
| node-adjacent tools | `Popover` or lightweight floating surface |
| explanatory hover detail | `Tooltip` |
| low-interruption confirmation | `Toast` |
| state card or issue explanation | `Alert` |
| layered settings | `Dialog` only when a popover is too small |

## Review Checklist For Implementers

Before shipping a user-facing slice, confirm:

1. the panel still reads as a workspace rather than a control console
2. hierarchy comes primarily from typography, spacing, and subtle surfaces
3. state color is informative, not dominant
4. overlays feel compact and tool-like
5. `source_lost`, `failed`, and other degraded states still fit the same calm system
6. the implementation uses the shared design-system layer instead of inventing a new mini-style

## Current Open Implementation Gap

The repo now has the documentation contract for a design system, but not yet the full token implementation in code.

The next implementation steps should be:

1. add a shared token source in the extension styles
2. refactor panel, canvas, and overlay surfaces to consume those tokens
3. normalize repeated workspace surfaces into reusable component patterns

Until that lands, treat this folder as the implementation target and update code incrementally toward it.
