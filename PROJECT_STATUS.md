# Thinking IDE Execution Board

## Current Milestone

`M1 - MVP runtime spine`

Goal:
Ship a loadable Chrome Extension skeleton that can inject the right-side panel, scan the current chat, render a concept-map draft, and persist local state.

## Current Status

`in_progress`

## Now

1. Wave 1 now has a landed page-level layout slice: default split-pane, overlay fallback, and collapse/expand rail with runtime coverage.
2. Treat [docs/spec-alignment-execution-plan.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-alignment-execution-plan.md) as the active execution order.
3. Shift the main implementation focus to Wave 2 while keeping remaining Wave 1 polish tracked as a tail item, not as an unbounded design rewrite.
4. Keep progress tracking, readiness rules, ADRs, risk tracking, and quality gates enforced through repo artifacts rather than memory.
5. Use sidecar agents by default for non-overlapping slices so the main thread stays focused on orchestration, integration, and final gates.

## Next

1. Execute Wave 2 from the alignment plan: ChatAdapter acceptance for conversation identity, full available history scan, completion detection, and restoration.
2. Continue Wave 3 preparation in parallel: provider-backed AI structuring baseline with `DeepSeek` in the first candidate batch.
3. Finish the remaining Wave 1 parity tail: align the collapse affordance more directly with header-owned controls if the product spec still requires it after the page-level split-pane lands.
4. Realign acceptance testing around layout, history, completion detection, semantic fixtures, and privacy-boundary checks.

## Blocked

1. No hard blocker right now.
2. Product-completion reporting is intentionally constrained until the alignment-plan waves land.

## Risks

1. The current `content.js` production bundle is above Vite's default chunk warning threshold at roughly `538 kB` minified, so bundle-splitting or dependency trimming should be scheduled before the extension grows much further.
2. ChatGPT DOM selectors and source anchors are better than the first cut, but they are still heuristic and need stronger identity handling before the runtime spine can be treated as robust.
3. The current implementation still diverges from the product spec on default layout mode, ChatAdapter completeness, semantic extraction quality, and privacy storage boundaries; see [docs/spec-gap-assessment-2026-05-12.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-gap-assessment-2026-05-12.md).

## Done

1. Bootstrapped a Vite + React + TypeScript + MV3 project skeleton.
2. Added manifest, background worker, content entry, and Shadow DOM mounting.
3. Implemented a first-pass chat scanner, heuristic draft generator, React Flow canvas, Zustand store, and Dexie persistence.
4. Established repository-level process guardrails: execution board, definition of done, and CI quality gate.
5. Added repo-level readiness, multi-agent governance, ADR, risk, and traceability artifacts for autonomous execution.
6. Added repo-level git workflow and local pre-commit gate so version-control discipline is tool-backed too.
7. Added incremental chat observation via `MessageObserver`, safer regeneration merging, and stronger source anchors.
8. Added a first automated test layer for stable services and store behavior, and wired it into `verify` / `ci`.
9. Added local runtime black-box validation with a mock host and a real-browser smoke script via `npm run runtime:validate`.
10. Added logical delete, latest-removal undo, and source-lost persistence/feedback in the canvas editing flow.
11. Upgraded runtime validation so `ci` now proves the unpacked extension can be loaded and auto-inject in a real browser.
12. Added editable edge relations in the canvas and taught regeneration to keep user-curated draft edges authoritative on the same node pair.
13. Added a repo-level frontend UI contract so user-facing slices now carry explicit UI acceptance and parallel delivery rules.
14. Expanded runtime validation so the smoke harness now proves `Jump to source` works against dynamically added messages without relying on DOM ids.
15. Reworked the panel and canvas presentation toward the product specs with a workspace-style header, node toolbar actions, stronger empty state, and calmer canvas chrome.
16. Added node-level `source_lost` iconography and a light tooltip/hint treatment without introducing heavy status chrome.
17. Expanded runtime validation again so the smoke harness now proves a degraded source-lost feedback path after the indexed assistant message disappears from the host DOM even while other assistant messages remain.
18. Hardened regeneration merging so removed concepts no longer suppress sibling concepts and reordered same-source concepts keep their prior ids and positions by title identity.
19. Tightened source reveal fallback and observer noise handling so missing assistant sources now degrade to `source_lost` instead of highlighting the wrong remaining message, and non-message text churn no longer triggers runtime refresh.
20. Added a repo-level design-system documentation layer that makes Notion the visual baseline, keeps `shadcn/ui` and `Radix UI` as implementation primitives, and defines foundations, component patterns, and implementation guidance for future frontend slices.
21. Added a node `More` menu with low-frequency role conversion and property inspection, and preserved manual role edits through regeneration.
22. Added persisted settings defaults plus store/repository groundwork for `autoGenerate`, language metadata, and `clearCurrentMap`, and wired runtime observation to respect `autoGenerate`.
23. Added the first code-level design-system token pass in `content.css` and moved the shared shell toward the documented Notion-derived baseline.
24. Simplified the panel information hierarchy by removing repeated stats and always-on guidance, and downgraded the top-right regenerate CTA into a lighter `Refresh` action.
25. Tightened repo governance so automatic delegation triggers now require the main thread to spawn sidecars proactively for naturally parallel slices.
26. Fixed the canvas first-load viewport so persisted or freshly generated maps auto-frame reliably after async hydration, corrected the panel layout chain so the canvas no longer collapses when the status bar is absent, and added an explicit `Reset view` recovery action plus a runtime-validation guard for collapsed canvas height.
27. Added a lightweight header settings surface for `auto-refresh from chat` and `Clear current map`, wired to the persisted settings/repository groundwork with an in-panel confirmation flow.
28. Added a complete spec-gap assessment and turned the alignment phase into repo-backed contracts for layout fidelity, ChatAdapter acceptance, AI structuring baseline, and test-alignment baseline.
29. Landed the first Wave 1 layout-fidelity slice: the extension now prefers a real page-level split-pane workspace, falls back to overlay only when no safe page shell can be established, exposes a collapse/expand rail, and proves the behavior through strengthened runtime validation.

## Quality Gate

For a feature slice to move to `done`, it must satisfy every item in [docs/definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md).

## Governance Artifacts

1. Ready gate: [docs/definition-of-ready.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-ready.md)
2. Done gate: [docs/definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md)
3. Document sync policy: [docs/document-sync-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/document-sync-policy.md)
4. Multi-agent rules: [docs/multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md)
5. Active risks: [docs/risk-register.md](/Users/qyx/Desktop/project/thinking-ide/docs/risk-register.md)
6. Requirement coverage: [docs/traceability-matrix.md](/Users/qyx/Desktop/project/thinking-ide/docs/traceability-matrix.md)
7. Architecture decisions: [docs/architecture-decisions/ADR-0001-runtime-spine.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0001-runtime-spine.md), [docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md)
8. Git workflow: [docs/git-workflow.md](/Users/qyx/Desktop/project/thinking-ide/docs/git-workflow.md)
9. Local hook setup: run `npm run setup:hooks`
10. Runtime validation: [docs/runtime-validation.md](/Users/qyx/Desktop/project/thinking-ide/docs/runtime-validation.md), run `npm run runtime:validate` or `npm run runtime:validate:built`
11. Bundle notes: [docs/bundle-reduction-notes.md](/Users/qyx/Desktop/project/thinking-ide/docs/bundle-reduction-notes.md)
12. Debug triage policy: [docs/debug-triage-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/debug-triage-policy.md)
13. Frontend UI contract: [docs/frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md)
14. Design system: [docs/design-system/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/README.md)
15. Alignment plan: [docs/spec-alignment-execution-plan.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-alignment-execution-plan.md)

## Notes

1. This board should stay short and operational. Product detail belongs in the spec documents already in the repo.
2. Update this file whenever the active milestone, next slice, or blocker state changes.
