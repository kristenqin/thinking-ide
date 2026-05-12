# AGENTS.md

This file is the root operating manual for agents working in this repository.

## Repo Purpose

Thinking IDE is a Chrome Extension MVP that injects a right-side concept-map workspace into ChatGPT. The current milestone is `M1 - MVP runtime spine`: inject the panel, scan chat content, generate a draft map, render it, and persist it locally.

## Start Here

Before starting any task, read these in order:

1. [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md)
2. [docs/definition-of-ready.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-ready.md)
3. [docs/definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md)
4. [docs/document-sync-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/document-sync-policy.md)
5. [docs/frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md) for any user-facing slice
6. [docs/design-system/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/README.md) for any slice that changes reusable visual language or workspace presentation
7. [docs/multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md)
8. [docs/git-workflow.md](/Users/qyx/Desktop/project/thinking-ide/docs/git-workflow.md)
9. [docs/spec-acceptance-commit-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-acceptance-commit-policy.md) for spec-parity work

Use [docs/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/README.md) as the navigation page for all governance artifacts.

## Product And Spec Sources Of Truth

The product and system specs live in [docs/specs/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/README.md). Use the relevant one explicitly when taking a task:

1. [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md)
2. [thinking_ide_mvp_项目文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_mvp_项目文档.md)
3. [thinking_ide_技术方案文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_技术方案文档.md)
4. [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)
5. [thinking_ide_数据模型详细设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_数据模型详细设计文档.md)
6. [thinking_ide_交互设计规范文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_交互设计规范文档.md)
7. [thinking_ide_开发任务拆解文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_开发任务拆解文档.md)
8. [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
9. [thinking_ide_低保真原型文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_低保真原型文档.md)

Do not say “aligned with spec” without naming which spec governs the slice.

## Codebase Boundaries

Default ownership lanes:

1. `src/extension`
   Injection lifecycle, content script boot, background worker, ChatGPT page coupling.
2. `src/services`
   Chat scanning, draft generation, source anchoring, transformation logic.
3. `src/stores`
   Zustand state and state transitions.
4. `src/db`
   Dexie and local persistence.
5. `src/components`
   UI and React Flow rendering only.
6. `docs` and `PROJECT_STATUS.md`
   Governance and execution tracking.

Do not let UI components directly own DOM scanning or persistence logic.

## Execution Rules

1. Only start tasks that satisfy [docs/definition-of-ready.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-ready.md).
2. Keep the write set explicit before editing.
3. One agent owns one slice.
4. Do not silently expand scope.
5. Do not revert unrelated work.
6. If a task crosses a shared runtime boundary, escalate before changing it.
7. If a task changes user-visible UI or interaction behavior, classify it using `frontend-ui-contract` before implementation.
8. If a task changes reusable visual language, token semantics, or shared workspace patterns, update the relevant file under `docs/design-system/` in the same slice.
9. Default to parallel sidecar execution for non-trivial work; keep the main thread focused on orchestration, integration, and final gates whenever write sets allow.
10. If a task matches the automatic delegation triggers in [docs/multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md), spawn sidecars proactively instead of waiting for the user to request them.
11. If a task is primarily about a UI or runtime issue investigation, follow [docs/debug-triage-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/debug-triage-policy.md) and capture screenshot or render-result evidence before code-first debugging.
12. For user-visible alignment work, do not describe a slice as aligned unless it meets the `acceptance` bar in [docs/spec-acceptance-commit-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-acceptance-commit-policy.md); otherwise report it as a `checkpoint`.

Shared runtime boundaries are:

1. ChatGPT DOM selectors or observation strategy
2. Message normalization shape
3. Node or edge schema
4. Zustand store shape
5. Persistence contract
6. Extension boot lifecycle

## Verification

Use the smallest valid gate for the slice:

1. Docs-only change: terminology, links, and governance consistency review
2. Code change without runtime behavior change: `npm run check`
3. Shipped behavior change outside runtime boundaries: `npm run verify`
4. Runtime-boundary behavior change: `npm run runtime:validate`
5. UI-facing behavior change: apply the acceptance checks in [docs/frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md) in addition to the command gate
6. UI/runtime debug investigation: terminology, links, governance consistency, and debug-triage-policy consistency review
7. Release or integration parity check: `npm run ci`

For design-system-only slices, use terminology, link, and cross-reference review as the minimum gate unless the slice also changes shipped frontend code.

Also follow the parallelism default and capacity-hygiene rules in [docs/multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md) so the main thread does not become the only place holding implementation context.

Install local hooks with:

```bash
npm run setup:hooks
```

## Git Workflow

1. Keep the integration branch releasable.
   Today the branch is `master`.
2. Prefer one branch and one commit per coherent slice.
3. Do not commit generated artifacts, debug files, or unrelated edits.
4. Follow [docs/git-workflow.md](/Users/qyx/Desktop/project/thinking-ide/docs/git-workflow.md) for commit cadence, gates, and handoff rules.

## Risk And Decision Records

Check these before changing core behavior:

1. [docs/risk-register.md](/Users/qyx/Desktop/project/thinking-ide/docs/risk-register.md)
2. [docs/traceability-matrix.md](/Users/qyx/Desktop/project/thinking-ide/docs/traceability-matrix.md)
3. [docs/architecture-decisions/ADR-0001-runtime-spine.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0001-runtime-spine.md)
4. [docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md)

## Current Focus

The current next slices are:

1. Follow [docs/spec-alignment-execution-plan.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-alignment-execution-plan.md) as the active ordering baseline.
2. Treat the first Wave 1 layout slice as landed: split-pane default, overlay fallback, collapse rail, and runtime validation are now in place.
3. Treat the second Wave 1 layout checkpoint as landed once integrated: header-owned collapse chrome, stronger left-column readability, and explicit empty-workspace guidance still stop short of layout `acceptance`.
4. Treat the first Wave 2 adapter-identity slice as landed: stable `conversationKey`, derivation metadata, visible-history `orderIndex`, and privacy-safer `MessageRef` locator fields.
5. Treat the first Wave 2 completion slice as landed: settled-assistant gating and duplicate auto-trigger suppression are now in place, while restoration semantics remain open.
6. Prepare Wave 3 in parallel: provider-backed AI structuring with `DeepSeek` in the first candidate batch.
7. Continue the remaining Wave 1 parity tail only where it closes the real-host workspace gap, especially left-column dilution from host sidebar/layout variance.

## Completion Reporting

When finishing a slice, report:

1. Status: `done`, `partial`, or `blocked`
2. Files changed
3. Checks run
4. Known gaps
5. Whether `PROJECT_STATUS.md` or another governance artifact needs updating under the document sync policy
