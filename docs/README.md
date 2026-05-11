# Docs Index

This folder contains the operational engineering guardrails for autonomous execution in this repository.

## Core Gates

1. Ready gate: [definition-of-ready.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-ready.md)
2. Done gate: [definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md)
3. Adapter acceptance contract: [adapter-acceptance-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/adapter-acceptance-contract.md)
4. Multi-agent rules: [multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md)
5. Document sync policy: [document-sync-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/document-sync-policy.md)
6. Document system map: [document-system-map.md](/Users/qyx/Desktop/project/thinking-ide/docs/document-system-map.md)
7. Debug triage policy: [debug-triage-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/debug-triage-policy.md)
8. Frontend UI contract: [frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md)
9. Design system: [design-system/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/README.md)
10. Git workflow: [git-workflow.md](/Users/qyx/Desktop/project/thinking-ide/docs/git-workflow.md)
11. Runtime validation: [runtime-validation.md](/Users/qyx/Desktop/project/thinking-ide/docs/runtime-validation.md)
12. Bundle notes: [bundle-reduction-notes.md](/Users/qyx/Desktop/project/thinking-ide/docs/bundle-reduction-notes.md)
13. Layout fidelity contract: [layout-fidelity-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/layout-fidelity-contract.md)
14. Test alignment baseline: [test-alignment-baseline.md](/Users/qyx/Desktop/project/thinking-ide/docs/test-alignment-baseline.md)

## Execution Tracking

1. Active board: [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md)
2. Risks: [risk-register.md](/Users/qyx/Desktop/project/thinking-ide/docs/risk-register.md)
3. Requirement coverage: [traceability-matrix.md](/Users/qyx/Desktop/project/thinking-ide/docs/traceability-matrix.md)

## Current Assessments

1. Spec gap assessment: [spec-gap-assessment-2026-05-12.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-gap-assessment-2026-05-12.md)
2. AI structuring baseline: [ai-structuring-baseline.md](/Users/qyx/Desktop/project/thinking-ide/docs/ai-structuring-baseline.md)
3. Spec alignment execution plan: [spec-alignment-execution-plan.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-alignment-execution-plan.md)

## Architecture History

1. [ADR-0001-runtime-spine.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0001-runtime-spine.md)
2. [ADR-0002-shadow-dom-and-local-persistence.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md)

## Design System

1. Index: [design-system/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/README.md)
2. Overview: [design-system/overview.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/overview.md)
3. Notion baseline: [design-system/notion-baseline.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/notion-baseline.md)
4. Foundations: [design-system/foundations.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/foundations.md)
5. Component patterns: [design-system/component-patterns.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/component-patterns.md)
6. Implementation guidance: [design-system/implementation-guidance.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/implementation-guidance.md)

## Specs Layer

1. Specs index: [specs/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/README.md)

## How To Use

1. Check `definition-of-ready` before starting a feature slice.
2. Keep work inside a declared write set from `multi-agent-governance`.
3. Use `PROJECT_STATUS.md` as the short operational source of truth.
4. Do not mark work done unless it satisfies `definition-of-done`.
5. Install local repo hooks with `npm run setup:hooks`.
6. Use `npm run runtime:validate` for the full extension-load smoke pass, or rely on `npm run ci` to run the built-artifact runtime gate automatically.
7. Use `document-sync-policy` whenever a slice changes runtime guarantees, repo gates, current focus, or risk posture.
8. Use `debug-triage-policy` when investigating UI or runtime issues so rendered evidence is captured before code-first debugging.
9. Use `frontend-ui-contract` whenever a slice changes user-visible UI or interaction behavior.
10. Use `design-system/README.md` whenever a slice needs a concrete visual baseline or reusable UI pattern guidance.
11. For non-trivial work, default to sidecar agents with non-overlapping write sets and keep the main thread focused on orchestration and integration.
