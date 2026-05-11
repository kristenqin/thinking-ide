# Test Alignment Baseline

## Purpose

This file resets the repo test baseline from:

`engineering smoke coverage`

to:

`spec-aligned MVP acceptance coverage`

Use this document together with:

1. [spec-gap-assessment-2026-05-12.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-gap-assessment-2026-05-12.md)
2. [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
3. [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md)
4. [thinking_ide_技术方案文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_技术方案文档.md)

## Reset In Measurement

Current repo gates prove:

1. Type safety
2. Focused service/store correctness
3. Build correctness
4. Mock-host runtime injection

They do **not** yet prove the MVP described in the spec docs.

From this alignment phase onward, user-visible progress should be judged against the suites below.

## P0 Acceptance Suites

### Suite A: Injection And Layout

Must prove:

1. Thinking Panel injects on target ChatGPT pages.
2. Default mode is real `4:6` split-pane, not overlay.
3. Overlay exists only as fallback when layout mode cannot be established.
4. The official chat input remains usable.
5. The panel can collapse and expand.

Current status:

1. Injection: partial pass
2. Real split-pane: fail
3. Overlay fallback contract: fail
4. Collapse/expand: fail

### Suite B: ChatAdapter And History Recovery

Must prove:

1. Stable `conversationKey`
2. Full historical user-message scan
3. Full historical assistant-message scan
4. Stable per-message identity with recovery fields
5. Reliable new-message observation
6. Historical chat reopen + map restore

Current status:

1. Basic DOM scan exists
2. Full historical reliability is unproven
3. Stable recovery fields are incomplete
4. Real historical reopen acceptance is missing

### Suite C: Reply Completion And Parsing Trigger

Must prove:

1. No final parse during streaming
2. One final parse after reply completion
3. Manual reparse remains available
4. No duplicate auto-parse for one assistant reply

Current status:

1. Debounced mutation observation exists
2. Reply-complete detection contract is not implemented
3. Real pass/fail coverage is missing

### Suite D: AI Structuring

Must prove:

1. Structuring request is sent through the background path
2. Only the current turn is sent
3. Stable JSON nodes/edges come back
4. Failure and timeout do not corrupt the existing map
5. The structuring layer can produce `question`, `answer`, `answer_outline`, and short `concept` nodes

Current status:

1. No real AI structuring service yet
2. Heuristic generator stands in for the service
3. This suite is currently a fail

### Suite E: Semantic Output Quality

Must prove:

1. `question` node abstracts the user question
2. `answer` node abstracts the answer
3. `answer_outline` nodes come from headings, sections, steps, or paragraph themes
4. `concept` nodes are short concepts, not long sentences
5. Concept count stays within a reasonable range per turn

Current status:

1. Basic `question` and `answer` exist
2. `answer_outline` is missing
3. Concepts are currently sentence fragments, not short concepts

### Suite F: Canvas Editing And Persistence

Must prove:

1. Drag, rename, relation-edit, delete, and undo work
2. User edits survive regeneration
3. User edits survive refresh
4. Source failures degrade without data loss

Current status:

1. Large parts of the editing spine exist
2. Persistence and merge protection are partial pass
3. This suite is the strongest current area, but still not fully spec-complete

### Suite G: Source Jump

Must prove:

1. `question` jumps to the user message
2. `answer` jumps to the full assistant reply
3. `answer_outline` jumps to the assistant paragraph/block
4. Multi-source concept nodes offer source choice
5. Failed source recovery degrades to `source_lost`

Current status:

1. Message-level single-source jump exists
2. `answer_outline` paragraph jump is missing
3. Multi-source popover is missing

### Suite H: Privacy Boundary

Must prove:

1. The repo does not long-term store full user prompts
2. The repo does not long-term store full assistant replies
3. Recovery uses reference fields rather than complete persisted chat text

Current status:

1. Current persistence still stores full `MessageRef.text`
2. This suite is currently a fail

## Current Reality

Against the spec-defined MVP, the repo currently has:

1. Strong engineering scaffolding
2. Partial editing and runtime spine coverage
3. Weak product-acceptance coverage

That is why the practical completion estimate is closer to `40%` than `60%-70%`.

## Required Test Realignment

Before the next major feature wave is considered healthy, the repo needs at least:

1. A real-host layout acceptance path
2. A real-host history-chat acceptance path
3. A parsing/semantic fixture set for Markdown and non-Markdown answers
4. AI structuring integration verification
5. Privacy-boundary verification

## Next Test Work Order

1. Add a `layout acceptance` check for true split-pane behavior.
2. Add `history chat` acceptance cases for pre-existing multi-turn sessions.
3. Add `reply completion` acceptance cases.
4. Add `semantic fixture` checks for outline extraction and short-concept output.
5. Add `privacy boundary` checks around stored message data.

Until these are in place, `npm run ci` should be treated as:

`repo health gate`

not:

`full MVP acceptance gate`
