# Thinking IDE Risk Register

Current scope: `M1 - MVP runtime spine`

This register tracks active, repo-specific risks for the current MVP slice, not long-range product risks.

| ID | Risk | Why it is active now | Impact | Mitigation in repo / next action | Owner | Status |
|---|---|---|---|---|---|---|
| R-01 | ChatGPT DOM selectors are brittle | `src/services/chatAdapter.ts` relies on `[data-message-author-role="user|assistant"]` and `element.textContent`, while `PROJECT_STATUS.md` already calls out selector variance risk | Message scan can miss messages or generate the wrong draft on real pages | Keep selectors centralized in `chatAdapter`; add incremental `MessageObserver`; expand fallback selectors and DOM fixture tests before adding more features | Runtime spine | Active |
| R-02 | Source jump can land on the wrong message | `src/services/sourceLocator.ts` matches by selector plus truncated preview text and falls back to the first matched element | Clicking "Jump to source" may scroll to the wrong chat block, weakening trust in the map | Harden anchors with stable message identity when available; add source-lost handling instead of silent fallback; verify against long and repeated chats | Runtime spine | Active |
| R-03 | Regeneration overwrites user-curated map state | `src/app/App.tsx` rebuilds the whole `ThinkingDocument` from the latest scan and generated draft, while the spec says user edits should win over AI regeneration | User renames, layout work, and manual connections can be lost after refresh or re-scan | Move from full replace to merge-by-conversation and merge-by-source rules; do not overwrite edited nodes/positions on regenerate | Runtime spine | Active |
| R-04 | Heuristic draft quality is too shallow for the PRD target | `src/services/generator.ts` only uses the latest question, latest answer, and concept splitting from one answer | The panel may feel like a demo spine rather than useful concept-map assistance | Keep the heuristic generator explicitly scoped as MVP scaffold; add tests around current behavior; defer richer structuring until after observation and merge stability | Product + runtime | Active |
| R-05 | Persistence schema is not migration-ready yet | Dexie currently stores `documents: "conversation.id, updatedAt"` with version `1`, but the data model docs call for schema evolution over time | Future document shape changes can strand existing local data or require manual reset | Introduce explicit schema versioning in stored documents and a Dexie migration path before broadening the document model | Persistence | Active |
| R-06 | Runtime has no automated behavior tests yet | `package.json` quality gates run typecheck and build, but there are no unit tests for scan/generate/store flows | Regressions in chat parsing, persistence, and source reveal can slip through CI | Add a small pure-test layer for `chatAdapter` parsing helpers, `generator`, and store update semantics as called out in `PROJECT_STATUS.md` | Engineering | Active |
| R-07 | Content bundle size will become a delivery constraint | `PROJECT_STATUS.md` notes the current `content.js` bundle is already above Vite's warning threshold | Extension startup and future iteration speed can degrade as UI and parsing logic grow | Schedule bundle split / dependency trimming before adding heavier UI or parsing logic; keep runtime services lean | Engineering | Active |
| R-08 | Product-spec drift is growing around interaction details | Current UI supports regenerate, drag/connect, rename-on-double-click, and source jump, but not the full toolbar, delete flow, undo, source status, or i18n promised in specs | The team can overestimate MVP completeness and build on unstable assumptions | Use the traceability matrix as the implementation baseline; record partial coverage explicitly before marking slices done | Team | Active |

## Review Trigger

Review this file when any of the following changes:

1. `chatAdapter` selectors or observation strategy.
2. Regeneration behavior or merge rules.
3. Dexie schema or persistence shape.
4. CI/test coverage expectations.
