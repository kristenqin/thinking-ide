# ChatAdapter Acceptance Contract

This document defines the repo-level acceptance contract for the `ChatAdapter` slice in Thinking IDE.

It exists to turn the adapter requirements from the MVP, technical design, data model, component, and test specs into hard acceptance gates, and to close the contract gap called out in [spec-gap-assessment-2026-05-12.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-gap-assessment-2026-05-12.md).

## Scope

This contract governs:

1. conversation identity
2. historical message scan
3. completion detection for assistant replies
4. `MessageRef` and `SourceRef` stability
5. refresh and history restoration expectations
6. degraded failure behavior

This contract does not define:

1. layout fidelity
2. semantic extraction quality
3. AI structuring service design
4. reusable UI presentation rules outside adapter-facing failure feedback

## Governing Sources

The adapter acceptance bar in this repo is governed by these source documents:

1. [thinking_ide_mvp_项目文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_mvp_项目文档.md)
2. [thinking_ide_技术方案文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_技术方案文档.md)
3. [thinking_ide_数据模型详细设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_数据模型详细设计文档.md)
4. [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)
5. [thinking_ide_交互设计规范文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_交互设计规范文档.md)
6. [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
7. [spec-gap-assessment-2026-05-12.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-gap-assessment-2026-05-12.md)

## Why This Contract Exists

The current repo already has a runtime spine, but the gap assessment identifies missing hard constraints around:

1. stable conversation identity
2. full historical scan instead of latest-round bias
3. reliable assistant completion detection
4. durable `MessageRef` / `SourceRef` recovery
5. explicit degraded behavior when the host DOM cannot satisfy the ideal path

No adapter-alignment slice may be called `done` unless it satisfies this contract or records the remaining gap explicitly in repo governance artifacts.

## Contract Statements

### 1. Conversation Identity

The adapter must bind all recovered and newly scanned message state to a stable `conversationKey`.

Hard requirements:

1. The adapter must use the priority order defined by the technical design and data model:
   official URL conversation id -> page-detectable conversation id -> URL plus title hash -> local generated session id.
2. The same host conversation must resolve to the same `conversationKey` across page refreshes when the underlying host identity has not changed.
3. The adapter must persist enough metadata to explain how the `conversationKey` was derived.
4. The adapter must not silently re-key an existing conversation during ordinary DOM churn.
5. If host evidence becomes weaker after a stronger key was already established, the stronger existing identity remains authoritative until a real conversation change is detected.

Acceptance criteria:

1. Reloading the same ChatGPT conversation preserves the same `conversationKey`.
2. Opening a different ChatGPT conversation produces a different `conversationKey`.
3. Fallback identity sources are observable in adapter output or logs for diagnosis.
4. A missing canonical URL id does not block operation if the fallback chain can still derive a stable key.

### 2. Historical Message Scan

The adapter must treat the current conversation as a history-bearing thread, not only as the most recent user and assistant pair.

Hard requirements:

1. Initial scan must enumerate all host messages currently available to the page for the active conversation, not only the latest round.
2. The adapter must classify each recovered message as `user` or `assistant`.
3. The adapter must assign monotonic `orderIndex` values in rendered conversation order.
4. Incremental observation must preserve prior stable ordering for already-known messages while appending or reconciling newly available messages.
5. Long or virtualized conversations may degrade on scan completeness, but that degradation must be explicit and must not be misreported as full history coverage.
6. The adapter must not trigger a full re-parse on non-message DOM churn when no message-level change occurred.

Acceptance criteria:

1. A multi-turn historical conversation yields a `NormalizedMessage[]` containing all currently available user and assistant messages.
2. `orderIndex` is stable and increasing for a fixed conversation snapshot.
3. New user and assistant messages can be observed after initialization without duplicating already-known messages.
4. If the host only exposes a partial window of history, the adapter reports partial recovery rather than claiming success silently.

### 3. Assistant Completion Detection

The adapter must not treat a streaming assistant reply as ready for final structuring until completion is established.

Hard requirements:

1. Completion detection must prefer host-native generation-state DOM signals when they are available and trustworthy.
2. If host-native signals are unavailable, the adapter must use a text-stability fallback.
3. The text-stability fallback must require a quiet window of approximately `1.5-2` seconds, matching the technical design and test spec.
4. The adapter must prevent final-generation triggers while the assistant reply is still streaming.
5. The adapter must guarantee that one completed assistant message produces at most one automatic final-generation trigger unless the user explicitly requests regeneration.
6. Completion detection must distinguish meaningful message growth from unrelated DOM updates.

Acceptance criteria:

1. No final parse is triggered while assistant text is still changing.
2. Final parse is triggered after the assistant reply is complete.
3. The fallback strategy works when completion-specific DOM markers are unavailable.
4. The same completed assistant message does not auto-trigger duplicate final parses.

### 4. MessageRef Stability

`MessageRef` is a locator contract, not a transcript store.

Hard requirements:

1. Every adapter-recognized host message must produce a stable `MessageRef`.
2. `MessageRef` must include, at minimum, `id`, `conversationKey`, `role`, `orderIndex`, and schema/version metadata.
3. `MessageRef` recovery support must include short-form locator evidence equivalent to `textHash` and `textPreview`, plus optional fast-path DOM selectors or paths when available.
4. The adapter must not persist full raw user or assistant message bodies as the long-term `MessageRef` contract.
5. `textPreview` must remain a short locator aid, not a full transcript copy.
6. Re-scanning the same unchanged message should preserve its logical identity instead of manufacturing a different `MessageRef` without cause.

Acceptance criteria:

1. `MessageRef` records are sufficient to support refresh-time recovery through the spec-defined fallback chain.
2. Stored locator fields stay inside the privacy boundary: short preview and hash are allowed; full long-term transcript storage is not.
3. Repeated scans of the same unchanged snapshot do not cause unnecessary `MessageRef` churn.

### 5. SourceRef And SourceAnchor Stability

`SourceRef` must remain durable enough to support node-to-source recovery across refresh and host DOM drift.

Hard requirements:

1. Node sources must be represented as `SourceRef[]`, not as a single implicit source.
2. `SourceRef` may target whole messages, message blocks, manual nodes, or derived nodes as defined by the data model.
3. When a source depends on a specific portion of an assistant message, the adapter-facing contract must allow `SourceAnchor`.
4. Anchor recovery priority must follow the data model:
   `blockId -> headingText -> textHash/textQuote -> offset`.
5. Derived or multi-source nodes must preserve their source list instead of collapsing to one arbitrary source.
6. When an anchor can no longer be recovered precisely, the adapter must degrade to an explicit source-lost result instead of jumping to the wrong surviving content.

Acceptance criteria:

1. Whole-message nodes can recover their backing message via `messageRefId`.
2. Block-level or outline-level nodes can attempt anchor recovery using the priority chain above.
3. Multi-source concepts retain multiple sources.
4. Failed anchor recovery does not silently redirect to an incorrect message or block.

### 6. Restoration Expectations

Refresh and historical conversation revisit flows are part of the adapter acceptance surface, not a later enhancement.

Hard requirements:

1. On page reload, the adapter must attempt to rebind persisted map data to the active host conversation through `conversationKey`.
2. On successful conversation rebind, the adapter must attempt to recover `MessageRef` and `SourceRef` targets through the spec-defined locator chain.
3. Restoration must support both:
   same-tab refresh of the current conversation
   reopening an older conversation with persisted local map data
4. Restoration must preserve user-owned map state when locator recovery succeeds.
5. When recovery is partial, unrecoverable sources must be marked degraded while recoverable parts remain usable.
6. Restoration must not require long-term storage of full original user or assistant transcripts.

Acceptance criteria:

1. A saved conversation restores its map after refresh.
2. A previously visited conversation restores its map when reopened later.
3. Recovered nodes keep working source jumps where recovery succeeds.
4. Unrecoverable nodes surface degraded source status without destroying the rest of the document.

### 7. Failure And Degradation Behavior

The adapter must fail softly because it depends on a third-party host DOM.

Hard requirements:

1. If the adapter cannot confidently identify the conversation structure, it must surface adapter degradation instead of pretending the scan succeeded.
2. If history scan is incomplete because of host virtualization or selector failure, the adapter must expose partial coverage semantics.
3. If completion detection cannot confidently establish a completed assistant message, it must prefer waiting over premature final parse.
4. If source recovery fails, the system must mark the node `sourceStatus = lost` or equivalent degraded state instead of jumping to the wrong source.
5. Adapter failure must not break normal ChatGPT page usage, matching the MVP technical boundary.
6. Failure feedback must be actionable enough for runtime debugging and user understanding, even if visually lightweight.

Acceptance criteria:

1. Missing or changed host selectors do not produce false-positive success.
2. Source jump failure yields an explicit degraded result.
3. Partial history availability is distinguishable from full history recovery.
4. The extension remains non-destructive to host chat behavior under adapter failure.

## Minimum Verification Expectations

This contract is satisfied only when verification proves the adapter behavior at the right level. `npm run check` alone is never sufficient for an adapter-acceptance slice because the contract covers runtime behavior and restoration semantics.

Minimum verification floor for code changes that claim this contract:

1. Run `npm run runtime:validate`.
2. Run `npm run verify`.
3. Add or update focused automated coverage for adapter behavior, completion detection, restoration, or degraded failure handling when the slice changes those guarantees.
4. Record any uncovered acceptance criteria explicitly in repo governance artifacts before calling the slice `done`.

Required acceptance coverage to claim adapter parity:

1. Conversation identity stability:
   equivalent to `TC-ADP-001`.
2. Historical scan coverage for both roles:
   equivalent to `TC-ADP-002`, `TC-ADP-003`, `TC-ADP-004`, `TC-ADP-005`, and `TC-ADP-006`.
3. `MessageRef` privacy-safe locator fields:
   equivalent to `TC-ADP-007`.
4. Completion detection:
   equivalent to `TC-GEN-001`, `TC-GEN-002`, `TC-GEN-003`, and `TC-GEN-004`.
5. Source recovery and degraded path handling:
   equivalent to the `SourceLocator` and refresh/recovery test groups in [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md).
6. Refresh and history restoration:
   equivalent to the persistence and restoration cases under the same test spec, including historical conversation recovery and privacy-boundary checks.

## Done Gate For Adapter Slices

An adapter-alignment slice may be reported as `done` only when:

1. the implementation satisfies the hard requirements above, or the remaining gaps are explicitly recorded
2. the verification floor above has been met
3. the slice does not silently violate the privacy boundary by turning `MessageRef` into long-term transcript storage
4. the slice does not silently regress degraded behavior into wrong-source success

If a slice improves only part of this contract, it must be reported as `partial`, not `done`.
