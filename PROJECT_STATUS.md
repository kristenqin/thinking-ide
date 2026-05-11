# Thinking IDE Execution Board

## Current Milestone

`M1 - MVP runtime spine`

Goal:
Ship a loadable Chrome Extension skeleton that can inject the right-side panel, scan the current chat, render a concept-map draft, and persist local state.

## Current Status

`in_progress`

## Now

1. Stabilize the runtime spine around `content script -> chat scan -> draft generation -> canvas render -> local persistence`.
2. Keep progress tracking, readiness rules, ADRs, risk tracking, and quality gates enforced through repo artifacts rather than memory.
3. Keep the implementation aligned with the existing PRD, technical design, component spec, and task breakdown documents.

## Next

1. Harden merge rules so more kinds of user-curated nodes and edges survive regeneration safely.
2. Improve source anchoring further with stronger identity strategies and source-lost handling.
3. Add delete flows and richer canvas editing actions from the interaction spec.
4. Start trimming the content bundle before the runtime spine grows further.

## Blocked

1. No hard blocker right now.
2. Real AI structuring is intentionally deferred until the local runtime and persistence path are stable.

## Risks

1. The current `content.js` production bundle is above Vite's default chunk warning threshold, so bundle-splitting or dependency trimming should be scheduled before the extension grows much further.
2. ChatGPT DOM selectors and source anchors are better than the first cut, but they are still heuristic and need stronger identity handling before the runtime spine can be treated as robust.

## Done

1. Bootstrapped a Vite + React + TypeScript + MV3 project skeleton.
2. Added manifest, background worker, content entry, and Shadow DOM mounting.
3. Implemented a first-pass chat scanner, heuristic draft generator, React Flow canvas, Zustand store, and Dexie persistence.
4. Established repository-level process guardrails: execution board, definition of done, and CI quality gate.
5. Added repo-level readiness, multi-agent governance, ADR, risk, and traceability artifacts for autonomous execution.
6. Added repo-level git workflow and local pre-commit gate so version-control discipline is tool-backed too.
7. Added incremental chat observation via `MessageObserver`, safer regeneration merging, and stronger source anchors.
8. Added a first automated test layer for stable services and store behavior, and wired it into `verify` / `ci`.

## Quality Gate

For a feature slice to move to `done`, it must satisfy every item in [docs/definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md).

## Governance Artifacts

1. Ready gate: [docs/definition-of-ready.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-ready.md)
2. Done gate: [docs/definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md)
3. Multi-agent rules: [docs/multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md)
4. Active risks: [docs/risk-register.md](/Users/qyx/Desktop/project/thinking-ide/docs/risk-register.md)
5. Requirement coverage: [docs/traceability-matrix.md](/Users/qyx/Desktop/project/thinking-ide/docs/traceability-matrix.md)
6. Architecture decisions: [docs/architecture-decisions/ADR-0001-runtime-spine.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0001-runtime-spine.md), [docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md)
7. Git workflow: [docs/git-workflow.md](/Users/qyx/Desktop/project/thinking-ide/docs/git-workflow.md)
8. Local hook setup: run `npm run setup:hooks`

## Notes

1. This board should stay short and operational. Product detail belongs in the spec documents already in the repo.
2. Update this file whenever the active milestone, next slice, or blocker state changes.
