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
10. [docs/code-authoring-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/code-authoring-policy.md) for implementation slices
11. [docs/refactor-trigger-rules.md](/Users/qyx/Desktop/project/thinking-ide/docs/refactor-trigger-rules.md) before extending complex areas
12. [docs/engineering-review-checklist.md](/Users/qyx/Desktop/project/thinking-ide/docs/engineering-review-checklist.md) when closing user-visible or runtime-facing code work
13. [docs/worktree-hygiene-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/worktree-hygiene-policy.md) before starting a new slice on a dirty tree

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
13. For implementation work, follow [docs/code-authoring-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/code-authoring-policy.md) and stop for a bounded cleanup when [docs/refactor-trigger-rules.md](/Users/qyx/Desktop/project/thinking-ide/docs/refactor-trigger-rules.md) says further accretion would harden the wrong structure.
14. If the worktree is not clean, apply [docs/worktree-hygiene-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/worktree-hygiene-policy.md) before starting another non-emergency slice.

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
8. Code-authoring governance slice: terminology, links, and consistency review across `AGENTS.md`, `PROJECT_STATUS.md`, `definition-of-done`, and the new authoring-policy docs
9. Worktree-hygiene governance slice: terminology, links, and consistency review across `AGENTS.md`, `PROJECT_STATUS.md`, `git-workflow`, `multi-agent-governance`, and `definition-of-done`

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
2. Treat the older Wave 1 split-pane slices as superseded shell experiments. The active Wave 1 shell baseline is now [docs/sidepanel-first-refactor-checklist.md](/Users/qyx/Desktop/project/thinking-ide/docs/sidepanel-first-refactor-checklist.md).
3. Treat the first `sidePanel-first` runtime checkpoint as landed: browser-owned sidePanel entry, background lifecycle ownership, a lightweight host runtime bridge, and a dedicated panel session controller now form the default Wave 1 runtime path.
4. Treat the next Wave 1 checkpoint as landed in code once this slice is integrated: sidePanel-native copy/callouts and shell cleanup now remove most of the active layout/overlay residue, but shell `acceptance` is still open.
5. Keep split-pane-era chrome and host-layout surgery out of new Wave 1 work unless a compatibility patch is clearly bounded and justified as a fallback.
6. Treat the first Wave 2 adapter-identity slice and the first full-session history-input checkpoint as landed: stable `conversationKey`, derivation metadata, privacy-safer `MessageRef` locator fields, and a conversation-payload-backed active-branch history path are now in place.
7. Treat the first Wave 2 completion slice, the first restoration-safety slice, the restoration-messaging checkpoint, and the explicit runtime-session-state checkpoint as landed: settled-assistant gating, duplicate auto-trigger suppression, partial-history protection, more honest restored/rebound copy, and explicit `idle/restored/partial-history/rebound/refreshed` session states are now in place, while fuller restoration semantics remain open.
8. Treat Wave 3 prep as implementation-ready: provider-backed AI structuring with `DeepSeek` in the first candidate batch now has fixtures and a normalized provider-draft contract, but no runtime wiring yet.
9. Continue the remaining Wave 1 parity tail only where it closes the sidePanel-product gap, especially consuming explicit restored/partial-history runtime states in the panel UI, deeper shell productization, and removal of transplanted in-page workspace assumptions.
10. Treat the second Wave 2 generation checkpoint as landed: the runtime now materializes multi-turn `question` / `answer` node chains from the full-session history path instead of collapsing graph generation to the latest exchange.
11. Treat the third Wave 2 generation checkpoint as landed: heuristic `answer_outline` nodes and `contains` edges now materialize from assistant structure.
12. Treat the fourth and fifth Wave 2 source-semantics checkpoints as landed: `answer_outline` extraction now prefers Markdown H1 headings first, `SourceRef` now carries durable `anchor.type` metadata, `chatAdapter` can emit assistant H1 heading sources from the live DOM, and jump-to-source now resolves those heading anchors before falling back to the parent answer block.
13. Treat the fourth Wave 2 concept-quality checkpoint as landed: heuristic concept extraction now produces shorter titles plus fuller summaries and avoids re-emitting Markdown H1 headings as duplicate concept nodes, but short-concept acceptance is still open.
14. Treat code authoring governance as active repo policy: the second store/runtime checkpoint is now landed, but broader runtime/store boundary cleanup is still open and should follow `code-authoring-policy`, `refactor-trigger-rules`, and `engineering-review-checklist`.
15. Treat worktree hygiene as active repo policy: before opening another long-running slice on top of in-flight sidePanel migration diffs, classify the tree and run a sweep instead of letting mixed local residue keep growing.

## Completion Reporting

When finishing a slice, report:

1. Status: `done`, `partial`, or `blocked`
2. Files changed
3. Checks run
4. Known gaps
5. Whether `PROJECT_STATUS.md` or another governance artifact needs updating under the document sync policy
