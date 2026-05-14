# Testing Findings Log

Use this log to track unresolved or recently resolved testing discoveries that need structured handoff.

## Test Run Template

```text
### TR-XXXX Short checkpoint title

- Date:
- Spec / governing doc:
- Environment:
- Status:
- Passed cases:
- Blocked cases:
- Failed or gap cases:
- Notes:
```

## Test Run Summaries

### TR-0001 Real-host checkpoint for `TC-SRC` / `TC-ADP` / `TC-GEN`

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Environment: current frontmost Chrome session on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442` with the unpacked Thinking IDE extension loaded in the same browser session
- Status: `checkpoint`
- Passed cases: `TC-SRC-001`, `TC-ADP-001`, `TC-ADP-002`, `TC-ADP-003`, `TC-ADP-004`, `TC-ADP-005`, `TC-ADP-006`, `TC-GEN-001`, `TC-GEN-002`, `TC-GEN-004`, `TC-GEN-005`
- Blocked cases: `TC-ADP-007` because the current real-host path does not expose runtime `MessageRef.textHash / textPreview`; `TC-GEN-003` because the current no-code-change test path cannot reliably force the "official generation-state DOM unavailable" precondition
- Failed or gap cases: `TC-SRC-002`, `TC-SRC-003`, and `TC-SRC-006` remain open real-host gaps; see `TF-0001`, `TF-0002`, and `TF-0003`
- Notes: the `TC-ADP / TC-GEN` runtime spine is broadly healthy on the real host, including refresh recovery, new user-message pickup, new assistant-message pickup, automatic parse after reply completion, duplicate-suppression for the same reply, and manual reparse via header `Refresh`; the current highest-value product gaps remain concentrated in source reveal semantics rather than conversation detection or draft generation

### TR-0002 Real-host checkpoint for `TC-DB`

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Environment: current frontmost Chrome session on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442` with the unpacked Thinking IDE extension loaded in the same browser session
- Status: `checkpoint`
- Passed cases: `TC-DB-006` because an existing local map reopened for the same historical conversation after refresh; `TC-DB-005` on a low-risk bottom `test` node because deleting the node removed it from the runtime graph and the node stayed hidden after a full page refresh and restored-map reopen
- Blocked cases: `TC-DB-007` because the current frontmost-Chrome path does not expose IndexedDB contents directly; `TC-DB-004` not yet run because drag-position persistence needs more precise interaction control than this checkpoint slice has taken on
- Failed or gap cases: `TC-DB-003`; see `TF-0004`
- Notes: the historical-conversation recovery path is working on the real host, but user edit persistence is at least partially inconsistent because a runtime rename succeeded before refresh and then reverted when the saved draft reopened

### TR-0003 Real-host checkpoint for `TC-NODE`

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Environment: current frontmost Chrome session on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442` with the unpacked Thinking IDE extension loaded in the same browser session
- Status: `checkpoint`
- Passed cases: `TC-NODE-001` because clicking the bottom `test` node selected it and opened the floating toolbar without triggering a source jump in the left chat; `TC-NODE-003` because only one node presented `SELECTED NODE` state at a time during the exercised interactions; `TC-NODE-010` because deleting the selected bottom `test` node hid it from the runtime canvas and showed the undo toast; `TC-NODE-011` because clicking `Undo` restored the deleted node and its `answers` edge
- Blocked cases: `TC-NODE-002` because the current frontmost-Chrome click path did not give a clean enough "definitely blank canvas" hit to distinguish a product gap from an imprecise automation click; `TC-NODE-004/005/006/007/008/009` not fully re-run as standalone node cases in this checkpoint because the higher-value persistence and delete paths were prioritized
- Failed or gap cases: none newly confirmed in this checkpoint slice
- Notes: the low-risk runtime node interactions are broadly working on the real host, but "click blank canvas to clear selection" still needs a cleaner manual or higher-fidelity replay before being treated as pass/fail evidence

### TR-0004 Real-host checkpoint for `TC-REGEN`

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Environment: current frontmost Chrome session on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442` with the unpacked Thinking IDE extension loaded in the same browser session
- Status: `checkpoint`
- Passed cases: none newly confirmed in this checkpoint slice
- Blocked cases: `TC-REGEN-002` and `TC-REGEN-003` not run in this slice because the higher-value low-risk edit-preservation and delete-preservation paths were prioritized first
- Failed or gap cases: `TC-REGEN-001` and `TC-REGEN-004`; see `TF-0005` and `TF-0006`
- Notes: manual sidepanel `Refresh` is currently not preserving low-risk user edits. A bottom answer node renamed to `regen edited` reverted to `test` after reparse, and deleting the same node before reparse did not keep it removed because the node reappeared once the refreshed draft rebound against visible history

### TR-0005 Real-host checkpoint for `TC-CANVAS`

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Environment: current frontmost Chrome session on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442` with the unpacked Thinking IDE extension loaded in the same browser session
- Status: `checkpoint`
- Passed cases: `TC-CANVAS-001` because the canvas rendered visible nodes whose main-view content was title-only text; `TC-CANVAS-002` because visible edges connected rendered nodes and displayed labels including `answers`, `contains`, and `next`; `TC-CANVAS-003` because deleting the low-risk bottom answer node removed it from the main canvas view until undo; `TC-CANVAS-004` because deleting that node also removed its visible `answers` edge from the main canvas view until undo; `TC-CANVAS-005` because zoom-in, zoom-out, manual pan, and `Fit View` all produced visible viewport changes while keeping the canvas interactive
- Blocked cases: none in this checkpoint slice
- Failed or gap cases: none newly confirmed in this checkpoint slice
- Notes: main-view rendering and filtering are behaving correctly on the real host even though separate persistence and reparse checkpoints remain open. The `removed` filtering path worked in live runtime, and the basic React Flow viewport controls responded with visible motion and framing changes

### TR-0006 Real-host checkpoint for `TC-EDGE`

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Environment: current frontmost Chrome session on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442` with the unpacked Thinking IDE extension loaded in the same browser session
- Status: `checkpoint`
- Passed cases: `TC-EDGE-004` because clicking a visible `answers` edge label opened edge-selected state and the inline edge editor; `TC-EDGE-005` because pressing `Delete` while the edge was selected removed the relation from the main view and showed `Edge deleted.` with an undo affordance, and `Undo` restored the edge
- Blocked cases: `TC-EDGE-001`, `TC-EDGE-002`, and `TC-EDGE-003` because the current frontmost-Chrome path did not provide a reliable handle-drag workflow for edge creation or a stable enough creation/edit session to verify self-connect rejection and saved relation metadata without turning the checkpoint into a noisy automation fight
- Failed or gap cases: none newly confirmed in this checkpoint slice
- Notes: existing-edge selection and deletion behavior are working on the real host. The remaining open edge cases are about connection creation and relation editing, not about basic edge click or edge removal behavior

### TR-0007 Real-host checkpoint for `TC-TOOLBAR`

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Environment: current frontmost Chrome session on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442` with the unpacked Thinking IDE extension loaded in the same browser session
- Status: `checkpoint`
- Passed cases: `TC-TOOLBAR-001` because selecting a visible node showed the floating toolbar next to the node; `TC-TOOLBAR-002` because clicking `Rename` opened the title-edit state and hid the floating toolbar until exit; `TC-TOOLBAR-003` because clicking `Source` from the floating toolbar clearly triggered the source-locator path and updated the selected-node copy/tooltip state even though the underlying source target for that node was unavailable; `TC-TOOLBAR-004` because clicking a visibly blank canvas region cleared the node selection and removed the floating toolbar; `TC-TOOLBAR-005` because selecting a node near the upper edge still kept the full toolbar inside the visible canvas instead of clipping it above the panel
- Blocked cases: none in this checkpoint slice
- Failed or gap cases: none newly confirmed in this checkpoint slice; the `TC-TOOLBAR-003` interaction reused an already-known source gap on the selected answer node, but the toolbar entrypoint itself behaved correctly
- Notes: toolbar presence, entry actions, and basic overlay avoidance are working on the real host. Current source-related instability should continue to be tracked under `TF-0001` through `TF-0003` rather than duplicated as a toolbar-specific issue

### TR-0008 Real-host regression sample for previously passed cases

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Environment: current frontmost Chrome session on `https://chatgpt.com/c/6a0056a1-5d74-83a4-b767-b8a105284575` with the unpacked Thinking IDE extension loaded in the same browser session
- Status: `checkpoint`
- Passed cases: `TC-EXT-001` because the sidepanel still injected on the target ChatGPT conversation page; `TC-ADP-001` because a full browser refresh kept the same conversation URL and the panel reattached to the same conversation shell; `TC-GEN-005` because clicking browser refresh and waiting through the panel lifecycle showed the runtime moving through `REFRESHING` and then settling back into a guarded steady state without crashing the host page
- Blocked cases: `TC-SRC-001`, `TC-ADP-002`, `TC-ADP-003`, `TC-ADP-004`, `TC-CANVAS-001`, `TC-CANVAS-002`, `TC-NODE-001`, `TC-EDGE-004`, and `TC-TOOLBAR-001` are blocked on this sample because the sidepanel stayed in a protected `VISIBLE HISTORY ONLY` hold with a blank canvas, so the previously used graph-level evidence for message recognition, rendered nodes, node selection, edge selection, toolbar display, and question-node source jump was unavailable in the current visible state
- Failed or gap cases: none newly confirmed as standalone product failures in this checkpoint slice; the important regression signal is that several earlier real-host passes do not generalize cleanly to this new history sample because the runtime falls back to partial-history protection before exposing a usable graph surface
- Notes: this sample is useful precisely because it weakens the earlier assumption that a single real-host pass generalizes across conversation shapes. The same repo build that previously produced usable restored graphs on `6a049933-5204-83ec-ae8a-628b87d50442` now oscillates between `VISIBLE HISTORY ONLY` and `REFRESHING/RESTORED LOCALLY` on `6a0056a1-5d74-83a4-b767-b8a105284575`, while the canvas remains visually blank. Treat prior `pass` conclusions as sample-bounded checkpoints unless they are revalidated on additional host conversations.

## Entry Template

```text
### TF-XXXX Short title

- Date:
- Spec / governing doc:
- Case or scope:
- Environment:
- Status:
- Severity:
- Observed behavior:
- Expected behavior:
- Evidence:
- Development handoff notes:
```

## Active Findings

### TF-0001 TC-SRC-002 lands mid-answer instead of answer start

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Case or scope: `TC-SRC-002` answer node 跳转 AI 回复整体
- Environment: real-host ChatGPT session in the currently open Chrome window, unpacked extension loaded after rebuild and manual extension reload
- Status: `confirmed`
- Severity: `checkpoint-gap`
- Observed behavior: answer-node `Source` behavior is unstable on the real host. In one rebuilt-and-reloaded run it returned to the correct assistant answer block but landed in the middle of the answer instead of the answer start; in the current Chrome-session run, selecting the answer node `“脆脆鲨巧克力大盗”在这段对话里的观点，其实有一个非常明显的核心主线： # 他在用…` and clicking `Source` degrades the node to `source_lost`
- Expected behavior: the reveal should consistently land at or very near the beginning of the target assistant answer, and should not regress into `source_lost`
- Evidence: real-host manual and assisted smoke on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442`; earlier same-day validation after rebuild and extension reload removed the old `source_lost` failure but still landed mid-answer, while the current direct-Chrome validation now shows `Original source could not be located. The node is still editable.` on the selected answer node
- Development handoff notes: treat this as both a source-locator accuracy issue and a runtime consistency issue for assistant answer anchors; verify why the same `TC-SRC-002` case sometimes resolves to the right block and sometimes degrades to `source_lost`

### TF-0002 TC-SRC-003 answer_outline reveal degrades to source_lost

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Case or scope: `TC-SRC-003` answer_outline 节点跳转回答段落
- Environment: real-host ChatGPT session in the currently open Chrome window, unpacked extension loaded in the active browser session
- Status: `confirmed`
- Severity: `checkpoint-gap`
- Observed behavior: selecting the outline node `这里不重点分析“他是什么认知模式”` and clicking `Source` does not reveal the matching paragraph; the panel marks the node as `source_lost` and shows `Original chat location is unavailable, but the node is still editable.`
- Expected behavior: the reveal should scroll to the corresponding paragraph or heading region inside the owning assistant answer instead of degrading to `source_lost`
- Evidence: real-host smoke on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442`; after clicking `Source`, the selected outline node and neighboring outline-derived nodes display the lost-source warning while the left conversation stays in the answer body rather than landing on the referenced outline segment
- Development handoff notes: investigate `answer_outline` anchor materialization and runtime resolution together; preserve the existing ability to keep the node editable after reveal failure, but restore paragraph-level source targeting before treating this case as acceptance-ready

### TF-0003 TC-SRC-006 single-source concept reveal is already source_lost

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Case or scope: `TC-SRC-006` 单来源 concept 节点直接跳转
- Environment: real-host ChatGPT session in the currently open Chrome window, unpacked extension loaded in the active browser session
- Status: `confirmed`
- Severity: `checkpoint-gap`
- Observed behavior: selecting the concept node `是组织结构把风险和成本转嫁给了基层执行者` immediately shows the lost-source state before any successful reveal, and clicking `Source` keeps the node in `source_lost` without moving the left conversation to a more specific source location
- Expected behavior: a single-source concept node should jump directly to its originating source segment instead of opening in a pre-lost state
- Evidence: real-host smoke on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442`; the selected concept node shows `This node still edits normally, but its original source needs review.` and the `Source` button tooltip remains `Original source could not be located. The node is still editable.`
- Development handoff notes: verify whether this concept node is inheriting a broken source from an upstream outline/answer node or failing its own locator resolution; treat this as a direct-source regression for single-source concepts rather than only a popover or multi-source issue

### TF-0004 TC-DB-003 renamed node title reverts after refresh

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Case or scope: `TC-DB-003` 节点重命名刷新后保留
- Environment: real-host ChatGPT session in the currently open Chrome window, unpacked extension loaded in the active browser session
- Status: `confirmed`
- Severity: `checkpoint-gap`
- Observed behavior: renaming the low-risk bottom node `test` to `test renamed` succeeded in the live canvas before refresh, but after a full browser refresh the restored map reopened with the original `test` title instead of the renamed title
- Expected behavior: the user-edited node title should persist across refresh and restored-map reopen for the same conversation
- Evidence: real-host smoke on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442`; the runtime canvas showed `test renamed` immediately after save, then the refreshed sidepanel reopened the saved draft under `RESTORED LOCALLY` with the bottom node title reverted to `test`
- Development handoff notes: treat this as a persistence gap rather than only a UI refresh artifact; check whether rename mutations are failing to reach the saved document path used by restored-map reopen, especially when the session transitions between `rebound` and `restored`

### TF-0005 TC-REGEN-001 manual reparse drops edited node title

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Case or scope: `TC-REGEN-001` 编辑节点后重解析不覆盖
- Environment: real-host ChatGPT session in the currently open Chrome window, unpacked extension loaded in the active browser session
- Status: `confirmed`
- Severity: `checkpoint-gap`
- Observed behavior: after renaming the low-risk bottom answer node from `test` to `regen edited`, clicking the sidepanel header `Refresh` re-entered `REFRESHING` and returned to `VISIBLE HISTORY REBOUND`, but the rebound graph no longer contained `regen edited`; the bottom node title reverted to `test`
- Expected behavior: a user-edited node title should survive manual reparse of the same conversation instead of being overwritten by regenerated structure
- Evidence: real-host smoke on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442`; selected-node state initially showed `regen edited`, then after header `Refresh` the rebound graph again showed `test -> test` on the bottom pair
- Development handoff notes: treat this as a reparse-preservation gap distinct from full browser refresh persistence. The issue reproduces during in-session `Refresh`, so the merge path for regenerated drafts is likely overwriting user edits before any persisted reopen step

### TF-0006 TC-REGEN-004 manual reparse revives deleted node

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Case or scope: `TC-REGEN-004` 删除节点后重解析不自动复活
- Environment: real-host ChatGPT session in the currently open Chrome window, unpacked extension loaded in the active browser session
- Status: `confirmed`
- Severity: `checkpoint-gap`
- Observed behavior: deleting the same low-risk bottom answer node removed it from the live canvas and showed `Node deleted.`, but clicking the sidepanel header `Refresh` regenerated the graph and brought the deleted bottom `test` node back into the rebound draft
- Expected behavior: a node deleted by the user should stay removed after manual reparse of the same conversation unless the user explicitly undoes the deletion
- Evidence: real-host smoke on `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442`; the node disappeared before reparse, then after `REFRESHING -> UP TO DATE` the rebound graph again displayed the bottom `test -> test` pair
- Development handoff notes: treat this as the delete-preservation twin of `TC-REGEN-001`. The runtime reparse path appears to rebuild directly from visible-history generation without honoring local user removal markers

### TF-0007 Refresh semantics blur reanalysis with local-restore safety states

- Date: 2026-05-14
- Spec / governing doc: [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
- Case or scope: refresh / restore runtime semantics observed during `TC-GEN-005`, `TC-DB-006`, and the new real-host regression sample `TR-0008`
- Environment: real-host ChatGPT sessions in the currently open Chrome window, especially `https://chatgpt.com/c/6a049933-5204-83ec-ae8a-628b87d50442` and `https://chatgpt.com/c/6a0056a1-5d74-83a4-b767-b8a105284575`, with the unpacked extension loaded in the active browser session
- Status: `confirmed`
- Severity: `checkpoint-gap`
- Observed behavior: the user-visible `Refresh` action does not read as a single clear concept. In real-host testing it can appear to trigger reanalysis, local-draft reopening, and partial-history safety fallback in one blended flow. On the newer history sample, the panel moved through `REFRESHING`, `RESTORED LOCALLY`, and `VISIBLE HISTORY ONLY` while the canvas stayed blank, which makes it unclear whether the system actually reanalyzed the current conversation or simply restored and re-guarded existing local state.
- Expected behavior: runtime semantics should distinguish at least three concepts clearly: reopening an existing local draft, validating whether enough host history is visible to trust that draft, and actively reanalyzing the current conversation into a refreshed graph. A user-triggered refresh should not look identical to a local restore when the system ultimately declines to recompute.
- Evidence: in earlier runs on `6a049933-5204-83ec-ae8a-628b87d50442`, `Refresh` could lead back to an apparently usable restored graph; on `6a0056a1-5d74-83a4-b767-b8a105284575`, the same action sequence left the panel oscillating between `REFRESHING`, `RESTORED LOCALLY`, and `VISIBLE HISTORY ONLY`, while the canvas remained visually empty.
- Development handoff notes: treat this as a product/runtime-semantics issue, not just copy polish. Separate the concepts of `restore local draft`, `rebind against visible host history`, and `reanalyze current conversation`, and make the panel state + action wording reflect which of those actually happened.
