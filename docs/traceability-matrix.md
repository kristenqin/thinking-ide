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
| TR-01 | Inject a right-side Thinking Panel into the official chat page as a Chrome Extension MVP | `thinking_ide_prd_产品需求文档.md`, `thinking_ide_mvp_项目文档.md` | MV3 manifest in `public/manifest.json`; content runtime and mounted app entry are referenced in `PROJECT_STATUS.md` as done | Implemented | Current artifact proves the extension runtime spine exists |
| TR-02 | Mount the UI in an isolated Shadow DOM container | `thinking_ide_组件设计文档.md` | `PROJECT_STATUS.md` explicitly records Shadow DOM mounting as done | Implemented | Good enough for MVP traceability; implementation detail already captured in status board |
| TR-03 | Read user and assistant messages from the chat area | PRD MVP goals; task breakdown phases 3 and 6 | `src/services/chatAdapter.ts` scans `[data-message-author-role="user"]` and `[data-message-author-role="assistant"]` into `MessageRef[]` | Implemented | Selector strategy is heuristic and fragile |
| TR-04 | Identify the current conversation and bind map data to it | Data model doc; task breakdown phase 2 | `src/services/chatAdapter.ts#getConversationRef`; Dexie key uses `conversation.id` via `src/services/repository.ts` and `src/db/database.ts` | Implemented | Current conversation identity is pathname-based |
| TR-05 | Generate a concept-map draft after scanning chat content | PRD MVP goals; MVP project doc | `src/app/App.tsx` calls `scanMessages()` then `generateDraftMap()` and persists the resulting document | Implemented | Trigger exists on initial load and manual regenerate |
| TR-06 | Create question and answer seed nodes from the chat | PRD sections on question node and answer node | `src/services/generator.ts` creates one latest-question node and one latest-answer node | Partial | Uses only the latest pair, not a full conversation model |
| TR-07 | Create concept nodes and suggested relations from assistant output | PRD sections on concept extraction and relation suggestion | `src/services/generator.ts` splits the latest answer into concept nodes and links them with `answers` / `expands` edges | Partial | Heuristic only; no richer semantic extraction |
| TR-08 | Render the draft as an interactive concept map canvas | PRD, component spec, low-fi wireframes | `src/components/canvas/ConceptMapCanvas.tsx` renders React Flow with nodes, edges, minimap, controls, and background | Implemented | Core canvas spine is present |
| TR-09 | Support direct manipulation: drag nodes and create connections | PRD, interaction spec, task breakdown phase 5 | `src/stores/useThinkingStore.ts` handles `onNodesChange`, `onEdgesChange`, and `addConnection`; canvas wires these handlers into React Flow | Implemented | Connection labels are generic draft relations today |
| TR-10 | Support node rename by direct edit | PRD, interaction spec | `src/components/canvas/ConceptMapCanvas.tsx` opens an edit panel from node double-click and saves through `renameNode()` | Partial | Rename exists, but not full selected-toolbar behavior from the spec |
| TR-11 | Support deleting nodes and edges | PRD, interaction spec, task breakdown phase 5 | No explicit delete action found in store or canvas | Gap | Logical delete / undo behavior from spec is not present yet |
| TR-12 | Let users jump from a node back to the original chat source | PRD MVP goals; interaction spec; task breakdown phase 7 | `src/services/sourceLocator.ts` scrolls to a matched DOM element; `ConceptMapCanvas.tsx` exposes "Jump to source" | Partial | Works via heuristic selector + preview text, without durable anchoring |
| TR-13 | Persist concept-map state locally and restore after refresh | PRD MVP goals; task breakdown phases 2 and 8 | Dexie repository in `src/db/database.ts` and `src/services/repository.ts`; `useThinkingStore.ts#hydrate`; `App.tsx` calls `hydrate()` on load | Implemented | Current restore path exists for a saved conversation document |
| TR-14 | Preserve user edits across future parsing/regeneration | Interaction spec (`用户编辑优先`), data model doc | Rename, drag, and added edges are persisted, but `App.tsx` full regeneration replaces the document | Partial | Persistence works, but merge semantics do not yet protect user edits on regenerate |
| TR-15 | Refresh the map when chat content changes without full reload | `PROJECT_STATUS.md`, task breakdown phase 3 | No `MessageObserver` or incremental refresh implementation found | Gap | Explicitly listed as next work in `PROJECT_STATUS.md` |
| TR-16 | Handle source-lost / adapter errors / empty and generation states clearly | Interaction spec, component spec, test docs | Store has `status: idle | scanning | ready | error`; canvas has a simple empty state | Partial | Rich state views and source-status handling are not implemented yet |
| TR-17 | Keep architecture separated across UI, state, services, and persistence | Component spec; Definition of Done | Current repo separates `components/`, `stores/`, `services/`, `db/`, and `models/` | Implemented | Matches the documented MVP architecture direction |
| TR-18 | Enforce repository quality gates for the MVP slice | `docs/definition-of-done.md`, CI workflow | `package.json` defines `check`, `build`, `verify`, `ci`; `.github/workflows/ci.yml` runs `npm run ci` | Implemented | Quality gate exists, but it currently covers type/build only |

## Immediate Coverage Summary

1. The MVP spine is real for injection, chat scan, heuristic generation, canvas rendering, Zustand state, and Dexie persistence.
2. The biggest requirement gaps are incremental observation, safe regeneration/merge behavior, explicit delete flows, and stronger source anchoring.
3. The broader PRD describes a richer MVP than the current runtime spine; this matrix should be treated as the implementation baseline until the next slice lands.
