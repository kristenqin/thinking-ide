# Thinking IDE Lightweight Traceability Matrix

Baseline used for this matrix:

- PRD / MVP docs in the repo root
- `PROJECT_STATUS.md`
- Current runtime spine in `src/`

Status legend:

- `Implemented`: present in the repo today
- `Partial`: thin or incomplete implementation exists
- `Gap`: specified, but not implemented in the current spine

| Req ID | Requirement | Primary spec source | Current implementation evidence | Status | Notes / gap |
|---|---|---|---|---|---|
| TR-01 | Inject a right-side Thinking Panel into the official chat page as a Chrome Extension MVP | [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md), [thinking_ide_mvp_项目文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_mvp_项目文档.md) | MV3 manifest in `public/manifest.json`; content runtime and mounted app entry are referenced in `PROJECT_STATUS.md` as done | Implemented | Current artifact proves the extension runtime spine exists |
| TR-02 | Mount the UI in an isolated Shadow DOM container | [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md) | `PROJECT_STATUS.md` explicitly records Shadow DOM mounting as done | Implemented | Good enough for MVP traceability; implementation detail already captured in status board |
| TR-03 | Read user and assistant messages from the chat area | PRD MVP goals; task breakdown phases 3 and 6 | `src/services/chatAdapter.ts` scans `[data-message-author-role="user"]` and `[data-message-author-role="assistant"]` into `MessageRef[]` | Implemented | Selector strategy is heuristic and fragile |
| TR-04 | Identify the current conversation and bind map data to it | Data model doc; task breakdown phase 2 | `src/services/chatAdapter.ts#getConversationRef`; Dexie key uses `conversation.id` via `src/services/repository.ts` and `src/db/database.ts` | Implemented | Current conversation identity is pathname-based |
| TR-05 | Generate a concept-map draft after scanning chat content | PRD MVP goals; MVP project doc | `src/app/App.tsx` calls `scanMessages()` then `generateDraftMap()` and persists the resulting document | Implemented | Trigger exists on initial load and manual regenerate |
| TR-06 | Create question and answer seed nodes from the chat | PRD sections on question node and answer node | `src/services/generator.ts` creates one latest-question node and one latest-answer node | Partial | Uses only the latest pair, not a full conversation model |
| TR-07 | Create concept nodes and suggested relations from assistant output | PRD sections on concept extraction and relation suggestion | `src/services/generator.ts` splits the latest answer into concept nodes and links them with `answers` / `expands` edges | Partial | Heuristic only; no richer semantic extraction |
| TR-08 | Render the draft as an interactive concept map canvas | PRD, component spec, low-fi wireframes | `src/components/canvas/ConceptMapCanvas.tsx` renders React Flow with nodes, edges, minimap, controls, and background | Implemented | Core canvas spine is present |
| TR-09 | Support direct manipulation: drag nodes and create connections | PRD, interaction spec, task breakdown phase 5 | `src/stores/useThinkingStore.ts` handles `onNodesChange`, `onEdgesChange`, and `addConnection`; canvas wires these handlers into React Flow | Implemented | Connection labels are generic draft relations today |
| TR-10 | Support node rename by direct edit | PRD, interaction spec | `src/components/canvas/ConceptMapCanvas.tsx` opens an edit panel from node double-click and saves through `renameNode()` | Partial | Rename exists, but not full selected-toolbar behavior from the spec |
| TR-11 | Support deleting nodes and edges, and editing edge relations | PRD, interaction spec, task breakdown phase 5 | `useThinkingStore` now supports logical delete for nodes/edges, latest-removal undo, and `updateEdgeRelation()`; `ConceptMapCanvas.tsx` exposes delete actions, Delete/Backspace handling, and an editable relation selector for selected edges | Partial | Core delete and relation-edit flows exist, but the broader toolbar/popover flow is still thinner than the full interaction spec |
| TR-12 | Let users jump from a node back to the original chat source | PRD MVP goals; interaction spec; task breakdown phase 7 | `src/services/sourceLocator.ts` now resolves by role, dom id, occurrence index, and preview slices; `ConceptMapCanvas.tsx` exposes "Jump to source"; the store persists `lost` source status and notice feedback | Partial | Stronger than the first cut, but still heuristic and missing richer source-lost iconography/tooltip treatment |
| TR-13 | Persist concept-map state locally and restore after refresh | PRD MVP goals; task breakdown phases 2 and 8 | Dexie repository in `src/db/database.ts` and `src/services/repository.ts`; `useThinkingStore.ts#hydrate`; `App.tsx` calls `hydrate()` on load | Implemented | Current restore path exists for a saved conversation document |
| TR-14 | Preserve user edits across future parsing/regeneration | Interaction spec (`用户编辑优先`), data model doc | `src/services/documentBuilder.ts` now merges regenerated documents with prior node ids, positions, titles, preserved settings, removed-node groups, and user-curated draft edges that should override regenerated edges on the same node pair | Partial | Safer than full replace, but broader merge behavior is still heuristic |
| TR-15 | Refresh the map when chat content changes without full reload | `PROJECT_STATUS.md`, task breakdown phase 3 | `src/services/messageObserver.ts` observes chat mutations and `App.tsx` re-runs regeneration through a debounced observer path | Partial | Incremental refresh now exists, but still depends on heuristic DOM signals |
| TR-16 | Handle source-lost / adapter errors / empty and generation states clearly | Interaction spec, component spec, test docs | Store now persists `lost` source status and raises notice feedback when jump-to-source fails; panel still uses a lightweight notice model for feedback | Partial | Source-lost persistence exists, but iconography, tooltip treatment, and richer state views are still incomplete |
| TR-17 | Keep architecture separated across UI, state, services, and persistence | Component spec; Definition of Done | Current repo separates `components/`, `stores/`, `services/`, `db/`, and `models/` | Implemented | Matches the documented MVP architecture direction |
| TR-18 | Enforce repository quality gates for the MVP slice | `docs/definition-of-done.md`, CI workflow | `package.json` defines `check`, `test`, `test:run`, `build`, `verify`, `ci`, `runtime:validate`, and `runtime:validate:built`; `.github/workflows/ci.yml` runs `npm run ci` | Implemented | Quality gate now covers typecheck, focused automated tests, build, and unpacked-extension runtime validation |

## Immediate Coverage Summary

1. The MVP spine is real for injection, chat scan, heuristic generation, canvas rendering, Zustand state, and Dexie persistence.
2. The biggest remaining requirement gaps are richer regeneration/merge behavior across more edit patterns, deeper toolbar/edit ergonomics, and stronger source identity handling.
3. The broader PRD describes a richer MVP than the current runtime spine; this matrix should be treated as the implementation baseline until the next slice lands.
