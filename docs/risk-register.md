# Thinking IDE Risk Register

Current scope: `M1 - MVP runtime spine`

This register tracks active, repo-specific risks for the current MVP slice, not long-range product risks.

| ID | Risk | Why it is active now | Impact | Mitigation in repo / next action | Owner | Status |
|---|---|---|---|---|---|---|
| R-01 | ChatGPT DOM selectors are still brittle | `src/services/chatAdapter.ts` now preserves DOM order and `src/services/messageObserver.ts` adds incremental observation, but both still rely on ChatGPT DOM conventions | Message scan can miss messages or refresh at the wrong moments on real pages | Keep selectors centralized in `chatAdapter`; add fallback selectors and DOM fixture tests before adding more features | Runtime spine | Active |
| R-02 | Source jump can still land on the wrong message | `src/services/sourceLocator.ts` now uses role, dom id, occurrence index, and start/end previews, and the UI now records `lost` status when reveal fails, but it still lacks a fully stable message identity | Clicking "Jump to source" may still scroll to the wrong chat block in repeated or edited conversations | Add source-lost icon/tooltip treatment and stronger message identity strategies; verify against long and repeated chats | Runtime spine | Active |
| R-03 | Regeneration still only partially protects user-curated map state | `src/services/documentBuilder.ts` now preserves matched node ids, positions, titles, manual `relates` edges, and respects removed-node groups, but broader merge semantics are still heuristic | Some user edits can still be lost when regenerated concepts no longer line up cleanly with prior structure | Extend merge rules beyond simple source/role grouping and add tests for more edit patterns | Runtime spine | Active |
| R-04 | Heuristic draft quality is too shallow for the PRD target | `src/services/generator.ts` only uses the latest question, latest answer, and concept splitting from one answer | The panel may feel like a demo spine rather than useful concept-map assistance | Keep the heuristic generator explicitly scoped as MVP scaffold; add tests around current behavior; defer richer structuring until after observation and merge stability | Product + runtime | Active |
| R-05 | Persistence schema is not migration-ready yet | Dexie currently stores `documents: "conversation.id, updatedAt"` with version `1`, but the data model docs call for schema evolution over time | Future document shape changes can strand existing local data or require manual reset | Introduce explicit schema versioning in stored documents and a Dexie migration path before broadening the document model | Persistence | Active |
| R-06 | Runtime test coverage is still narrow | `verify` and `ci` now run `tsx --test`, but coverage currently focuses on generator, document merge, and store basics | Regressions in DOM parsing, observation, and source reveal can still slip through CI | Extend tests to `chatAdapter`, source location behavior, and richer merge scenarios as the code is refactored for testability | Engineering | Active |
| R-07 | Content bundle size is now an immediate delivery constraint | `PROJECT_STATUS.md` notes the current `content.js` bundle remains above Vite's warning threshold, and recent editing/runtime features pushed it higher | Extension startup and future iteration speed can degrade as UI and parsing logic grow | Use [docs/bundle-reduction-notes.md](/Users/qyx/Desktop/project/thinking-ide/docs/bundle-reduction-notes.md) to prioritize low-risk split points before the next heavyweight UI/runtime slice | Engineering | Active |
| R-08 | Product-spec drift is growing around interaction details | Current UI supports regenerate, drag/connect, rename-on-double-click, and source jump, but not the full toolbar, delete flow, undo, source status, or i18n promised in specs | The team can overestimate MVP completeness and build on unstable assumptions | Use the traceability matrix as the implementation baseline; record partial coverage explicitly before marking slices done | Team | Active |

## Review Trigger

Review this file when any of the following changes:

1. `chatAdapter` selectors or observation strategy.
2. Regeneration behavior or merge rules.
3. Dexie schema or persistence shape.
4. CI/test coverage expectations.
