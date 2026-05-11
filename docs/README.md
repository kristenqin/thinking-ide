# Docs Index

This folder contains the operational engineering guardrails for autonomous execution in this repository.

## Core Gates

1. Ready gate: [definition-of-ready.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-ready.md)
2. Done gate: [definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md)
3. Multi-agent rules: [multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md)
4. Document sync policy: [document-sync-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/document-sync-policy.md)
5. Document system map: [document-system-map.md](/Users/qyx/Desktop/project/thinking-ide/docs/document-system-map.md)
6. Git workflow: [git-workflow.md](/Users/qyx/Desktop/project/thinking-ide/docs/git-workflow.md)
7. Runtime validation: [runtime-validation.md](/Users/qyx/Desktop/project/thinking-ide/docs/runtime-validation.md)
8. Bundle notes: [bundle-reduction-notes.md](/Users/qyx/Desktop/project/thinking-ide/docs/bundle-reduction-notes.md)

## Execution Tracking

1. Active board: [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md)
2. Risks: [risk-register.md](/Users/qyx/Desktop/project/thinking-ide/docs/risk-register.md)
3. Requirement coverage: [traceability-matrix.md](/Users/qyx/Desktop/project/thinking-ide/docs/traceability-matrix.md)

## Architecture History

1. [ADR-0001-runtime-spine.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0001-runtime-spine.md)
2. [ADR-0002-shadow-dom-and-local-persistence.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md)

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
