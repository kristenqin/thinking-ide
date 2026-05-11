# Layout Fidelity Contract

This contract turns the existing layout requirements for Thinking IDE into a repo-level hard constraint.

Use this document when a slice changes:

1. page-level Thinking Panel injection layout
2. default workspace width or split behavior
3. collapse or expand behavior
4. required panel header controls
5. acceptance evidence for layout fidelity

## Purpose

The repo already has strong runtime and UI governance, but the gap assessment found one missing hard rule: the product must default to a real `4:6` split-pane workspace, not a page-level overlay approximation.

This document closes that gap by making layout fidelity an explicit repository contract rather than a preference.

## Governing Sources

This contract is derived from the following named sources:

1. [thinking_ide_mvp_项目文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_mvp_项目文档.md)
2. [thinking_ide_技术方案文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_技术方案文档.md)
3. [thinking_ide_交互设计规范文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_交互设计规范文档.md)
4. [thinking_ide_低保真原型文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_低保真原型文档.md)
5. [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)
6. [thinking_ide_开发任务拆解文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_开发任务拆解文档.md)
7. [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
8. [spec-gap-assessment-2026-05-12.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-gap-assessment-2026-05-12.md)

Do not say "layout aligned with spec" unless the slice names which of these sources governs the specific change.

## Core Contract

Thinking IDE's page-level workspace layout must satisfy all of the following:

1. The default mode is true `4:6` split-pane.
2. The Thinking Panel is the primary thinking workspace, not a narrow utility rail.
3. Overlay Mode is fallback only when Layout Mode cannot be established safely.
4. Collapse and expand behavior are part of the required product shape, not optional polish.
5. Header controls required by the governing specs must be present in the expanded workspace.

If implementation cannot satisfy these rules, the gap must be recorded explicitly and the slice cannot be described as layout-faithful.

## Definitions

### Layout Mode

`Layout Mode` means the extension establishes a real left-right workspace relationship between the official Chat Area and the Thinking Panel so the page reads as:

```text
Official Chat Area: 40%
Thinking Panel: 60%
```

This is the intended default experience.

### Overlay Mode

`Overlay Mode` means the Thinking Panel is rendered as a fixed layer over the page rather than as the default page layout.

Overlay Mode is allowed only as fallback when:

1. the Chat container cannot be identified reliably
2. the host layout cannot be adjusted safely
3. applying Layout Mode would break chat usability

Overlay Mode is not the product-default success path.

### Overlay Distinction

This contract applies to page-level injection layout only.

It does not ban spec-approved canvas overlays such as:

1. floating node toolbars
2. edge edit popovers
3. lightweight workspace popovers

Those remain valid UI patterns under the component and interaction specs.

## Hard Requirements

### Default Workspace Shape

1. On successful injection, the first target posture is real `4:6` split-pane.
2. The Thinking Panel should occupy the right-side workspace at approximately `60%` width.
3. Width guidance remains `clamp(560px, 60vw, 960px)` unless a governing spec supersedes it.
4. The official Chat Area remains visible and usable alongside the panel.

### Fallback Rule

1. The runtime should attempt Layout Mode first.
2. Overlay Mode may be used only after Layout Mode cannot be established or maintained.
3. A layout slice is not complete if it ships only overlay behavior while presenting that result as the default product form.

### Header Controls

In expanded mode, the header must expose the control set required by the current spec baseline:

1. workspace title: `Thinking IDE`
2. visible status treatment
3. regenerate or refresh action
4. settings entry
5. collapse affordance

Equivalent wording or icon treatment is acceptable only if the control semantics remain intact.

### Collapse And Expand Behavior

1. The user must be able to collapse the panel from the header.
2. The collapsed state must reduce the workspace to a narrow right-edge rail.
3. The collapsed rail must remain discoverable and expandable.
4. Expanding must restore the main workspace without forcing page reload.
5. Collapse behavior must not break official chat input, scroll, or general page use.

## Acceptance Criteria

A slice may claim layout fidelity only if all of the following are true:

1. On a healthy supported host page, the default visible result is real `4:6` split-pane rather than page overlay.
2. The panel reads as the main concept-map workspace and provides enough canvas space for normal use.
3. Layout Mode failure falls back to Overlay Mode instead of breaking injection or host usability.
4. The header shows title, status, regenerate or refresh, settings, and collapse controls in expanded mode.
5. The user can collapse the panel into a narrow rail and expand it back.
6. Chat input and scrolling remain usable in expanded mode, collapsed mode, and fallback overlay mode.
7. Repo validation and docs do not describe overlay-only behavior as spec-complete layout.

## Verification Rule

For docs or planning slices, the minimum gate is terminology, link, and governance consistency review.

For shipped implementation that changes page-level layout behavior:

1. apply the acceptance checks in [frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md)
2. use the relevant cases from [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md), especially default `4:6`, Overlay fallback, and collapse or expand behavior
3. run the repository gate required by [AGENTS.md](/Users/qyx/Desktop/project/thinking-ide/AGENTS.md) for the slice risk level

## Reporting Rule

When closing a layout-related slice, report:

1. whether the result satisfies true split-pane by default
2. whether Overlay Mode remains fallback-only
3. whether header controls are complete or still partial
4. whether collapse and expand behavior is complete or still partial
5. any remaining gap against the governing sources named above

## Current Gap Link

This contract directly addresses the gap identified in:

1. [spec-gap-assessment-2026-05-12.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-gap-assessment-2026-05-12.md) section `2.2` for the missing `Layout Fidelity Contract`
2. `GAP-01` for wrong default layout mode
3. `GAP-02` for incomplete collapse and panel controls
4. `GAP-13` for missing layout and collapse acceptance coverage
