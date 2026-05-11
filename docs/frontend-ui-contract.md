# Frontend UI Contract

This repo treats UI and UX as part of shipped behavior, not as a polish pass after logic is done.

Use this document to keep frontend work moving in parallel with runtime and state work without letting the two drift apart.

## Purpose

This contract defines:

1. Which spec documents govern UI behavior and structure.
2. Which parts of a feature slice must ship with UI treatment in the same iteration.
3. Which frontend concerns can move in parallel with logic work.
4. What evidence is required before a frontend-facing slice can be called `done`.
5. How the design-system layer should mediate between product specs and implementation.

## Governing Spec Sources

Use these documents explicitly when a slice affects UI or interaction behavior:

1. [thinking_ide_交互设计规范文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_交互设计规范文档.md)
2. [thinking_ide_低保真原型文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_低保真原型文档.md)
3. [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)
4. [thinking_ide_mvp_项目文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_mvp_项目文档.md)
5. [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
6. [design-system/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/README.md)
7. [design-system/notion-baseline.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/notion-baseline.md)
8. [design-system/foundations.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/foundations.md)
9. [design-system/component-patterns.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/component-patterns.md)

Do not say "UI aligned with spec" unless the slice names which of these governs the change.

Also be explicit about the split of authority:

1. product specs own behavior and structure
2. the design-system folder owns the reusable visual baseline
3. `shadcn/ui` and `Radix UI` are implementation primitives, not the default product aesthetic

## Core Rule

Any slice that changes what the user sees, clicks, edits, or relies on for state feedback must be treated as a combined behavior slice, not as "logic now, UI later" unless the deferral is recorded explicitly in [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md).

## Parallel Delivery Model

UI and logic should progress in parallel, but along clear interfaces.

### Usually Safe To Advance In Parallel

These can usually move while underlying logic is still evolving, as long as the store and action names are stable:

1. Panel information architecture.
2. Visual language, spacing, typography, and surface hierarchy.
3. State views such as empty, waiting, generating, synced, failed, and adapter error.
4. Node and edge presentation.
5. Overlay composition such as toolbar, popover, inspector, and notice layout.
6. Motion and feedback treatments.

### Coupled To Interaction Semantics

These must be aligned with store/service behavior before finalizing the UI:

1. Which actions are available in node-selected and edge-selected states.
2. Whether edits are instant-save or explicit-save.
3. Undo scope and reversibility rules.
4. Regeneration behavior after user edits.
5. Source-jump success and failure feedback.
6. Panel status model and state transitions.

If a slice touches the second group, treat it as a shared frontend-state contract change.

## Visual Authority Rule

Thinking IDE uses a Notion-derived workspace baseline for visual language.

That means:

1. calm page-like hierarchy
2. neutral surfaces
3. weak chrome and weak interruptions
4. tool-like overlays instead of dashboard framing

Do not treat `shadcn/ui` default styling as the target visual language unless the design-system docs explicitly say so.

## Required UI Contract Areas

These areas define the expected product shape for M1 and must stay visible during implementation review:

1. The right-side Thinking Panel is the main concept-map workspace, not a narrow auxiliary utility bar.
2. The panel layout and state presentation should feel like a product workspace, not a developer control surface.
3. Canvas editing should use explicit overlay patterns described in the component and interaction specs.
4. Left-right linkage between map and original chat should have clear selection and feedback treatment.
5. Empty, generating, synced, failed, and source-lost states must be treated as product states, not only console-style text output.
6. Visual hierarchy should come from the design-system foundations and patterns before page-local styling choices.

## Slice Classification

Every frontend-facing slice should be classified before implementation:

1. `Logic-only`
   Internal behavior changed but user-visible interaction did not.
2. `UI-coupled`
   Store/service behavior and UI behavior both changed and should land together.
3. `UI-alignment`
   Primary goal is to move the implementation closer to the governing interaction or structural specs.
4. `Design-system`
   Primary goal is to define or adjust reusable visual rules that other frontend slices should build on.

Record the classification in the task write-up or progress notes when the slice is non-trivial.

## UI Acceptance Checklist

Before marking a frontend-facing slice `done`, verify all of the following:

1. The governing UI spec documents are named explicitly.
2. The relevant design-system docs are named explicitly when the slice affects reusable visual language.
3. The user-visible behavior matches the intended interaction contract, or the gap is recorded clearly.
4. The implementation does not leave obviously temporary "engineering console" UI in a workflow that is meant to be product-facing.
5. The relevant state views are handled, not only the success path.
6. The result is validated by the right level of evidence:
   - code inspection for purely structural refactors
   - `npm run verify` for ordinary behavior slices
   - `npm run runtime:validate` or `npm run ci` for runtime-boundary UI slices
7. `PROJECT_STATUS.md`, `AGENTS.md`, and `docs/traceability-matrix.md` are updated when the slice changes current UI coverage or next UI priorities.

## Escalation Triggers

Escalate before implementation if any of these are true:

1. The visual/layout expectation in the low-fi or interaction spec conflicts with the current component structure.
2. A slice needs a new panel status or new cross-layer interaction mode.
3. A UI change would force a store-shape or persistence-shape change.
4. The intended user flow is still ambiguous after naming the governing spec docs.
5. The slice needs a new reusable visual pattern or token that is not yet documented in `docs/design-system/`.

## Default Working Rule

When taking a feature slice, ask:

1. What logic behavior is changing?
2. What user-visible state or interaction must land with it?
3. Which part can ship now, and which gap must be recorded if the UI portion is deferred?

If the answer to question 2 is "none," the slice may stay logic-only.
If the answer is non-empty, the UI portion is part of the slice unless the deferral is explicitly tracked.
