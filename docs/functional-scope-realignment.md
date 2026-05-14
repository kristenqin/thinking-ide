# Functional Scope Realignment Baseline

## Purpose

This document resets execution focus from local implementation checkpoints back to the MVP feature range defined in the product specs.

Use it when:

1. the repo is making engineering progress but large parts of the documented MVP scope are still unimplemented
2. local Wave checkpoints start obscuring broader product coverage
3. completion reporting needs to be brought back in line with the actual feature scope promised by the specs

## Governing Specs

This baseline is derived primarily from:

1. [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md)
2. [thinking_ide_mvp_项目文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_mvp_项目文档.md)
3. [thinking_ide_开发任务拆解文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_开发任务拆解文档.md)
4. [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
5. [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)

## Why A Reset Is Needed

The repo has been progressing through honest `checkpoint` slices, but too much execution energy has gone into:

1. local shell cleanup
2. runtime honesty details
3. source-anchor refinements
4. code-governance cleanup

before the full MVP feature range was brought to parity.

This created a mismatch:

1. engineering checkpoints kept landing
2. but several P0 product capabilities from the PRD and task breakdown were still only partial or absent

## Current Product-Scope Read

The project should currently be read as:

1. runtime spine: present
2. sidePanel shell: partial
3. full MVP functional range: still substantially incomplete

Do not use the number of landed runtime or governance checkpoints as a proxy for feature completion.

## MVP Feature-Range Baseline

The MVP should be tracked against these functional capabilities first.

### F-01 Stable sidePanel workspace on the official chat page

Spec expectation:

1. persistent right-side workspace
2. stable shell states
3. does not break the host chat

Current state:

`partial`

Notes:

1. browser-owned sidePanel path exists
2. shell honesty has improved
3. acceptance is still open because empty/failed/restored/productized state views are not complete

### F-02 Full conversation capture, not only the latest turn

Spec expectation:

1. identify current conversation
2. read historical user and assistant messages
3. keep stable references for recovery and source linking

Current state:

`partial`

Notes:

1. conversation payload-backed active-branch history exists
2. product behavior is still not fully aligned with “all relevant questions in a long session become usable input”
3. restoration and visible-history semantics still remain open

### F-03 Reliable assistant-completion timing

Spec expectation:

1. do not parse during streaming
2. trigger once per completed assistant reply

Current state:

`partial`

Notes:

1. bounded completion gating is landed
2. broader real-host confidence is still not fully earned

### F-04 Answer structure extraction

Spec expectation:

1. make the primary reading view a structure-first tree
2. root the tree in the current session
3. show `question -> answer -> answer_outline` as the first-class hierarchy
4. generate `answer_outline`
5. use real answer structure rather than flat text only
6. allow users to jump back to relevant source structure
7. if the answer has no heading structure, return an empty outline rather than guessing one from paragraphs

Current state:

`partial`

Notes:

1. a payload-markdown-AST-first `answer_outline` checkpoint is now landed, and it now carries first-pass heading-tree semantics
2. no-heading answers now return an empty outline instead of paragraph or sentence fallback guesses
3. the repo still renders the analyzed content primarily as a graph canvas, not as the new structure-first tree view
4. durable H1 source anchors still exist only as a partial source-semantics checkpoint layered on top of message-level source jumps
5. paragraph/block-level source precision is still open
6. the next acceptance target is a real `Session -> Question -> Answer -> Outline` tree view with paragraph/block anchor precision layered on top of the landed payload-markdown-AST-first heading-tree extraction

### F-05 Structure-first rendering and interaction

Spec expectation:

1. the primary view should privilege comprehension and navigation over graph semantics
2. users should be able to expand and collapse the session tree like a mind map
3. the first rendering target should be `Session -> Question -> Answer -> Outline`
4. graph-style concept relationships can remain a later enhancement

Current state:

`gap`

Notes:

1. the current canvas is still graph-first and does not provide tree-style expand/collapse behavior
2. current answer-structure work is the data foundation for a tree view, but the view itself is not landed
3. this rendering reset is now the preferred frontend direction for the next user-facing slice

### F-06 Short concept extraction

Spec expectation:

1. concept nodes should be concise
2. concept count should stay bounded
3. concepts should not simply mirror long answer sentences

Current state:

`partial`

Notes:

1. shorter heuristic titles now exist
2. short-concept acceptance is still open
3. concept extraction should now be treated as the basis of a later `Concept View`, not as the primary rendering mode for the current MVP reading flow

### F-07 Correct graph semantics

Spec expectation:

1. `question`
2. `answer`
3. `answer_outline`
4. `concept`
5. `answered_by`
6. `contains`
7. `mentions`
8. `follow_up`

Current state:

`partial`

Notes:

1. node coverage is much better than early runtime-spine versions
2. edge semantics still lag the documented vocabulary
3. graph semantics remain important, but they no longer define the first view the user should land in during the current MVP phase

### F-08 Direct node and edge manipulation

Spec expectation:

1. rename
2. drag
3. delete
4. connect
5. relation edit

Current state:

`implemented` for MVP core editing

Notes:

1. this is one of the stronger functional areas already landed
2. it should not dominate priority over still-missing P0 semantic/input features

### F-09 Source jump to original chat content

Spec expectation:

1. click from graph back to source
2. work for question/answer/outline/concept flows
3. be reliable across recovered history

Current state:

`partial`

Notes:

1. message-level and heading-level anchors now exist
2. multi-source and paragraph/block precision remain open

### F-10 Local persistence and refresh recovery

Spec expectation:

1. save user edits
2. restore after refresh
3. preserve structure under reopen/history reload

Current state:

`partial`

Notes:

1. restore path exists
2. recovery honesty and partial-history protection improved
3. privacy-compliant persistence contract is still not finished

### F-11 AI structuring service

Spec expectation:

1. real AI structuring path
2. background-service boundary
3. normalized contract
4. runtime failure handling

Current state:

`gap`

Notes:

1. Wave 3 prep exists
2. real provider-backed runtime capability does not

### F-12 Settings, i18n, and state views

Spec expectation:

1. settings menu
2. language/i18n
3. empty/generating/error/adapter-error views

Current state:

`partial`

Notes:

1. auto-refresh and clear-map controls exist
2. i18n and full state-view coverage do not

### F-13 Privacy-boundary compliance

Spec expectation:

1. do not keep full prompt/reply bodies in long-term storage

Current state:

`gap`

Notes:

1. this is still a direct spec deviation

### F-14 Acceptance-grade test coverage

Spec expectation:

1. test the real MVP scope, not only the engineering spine

Current state:

`partial`

Notes:

1. engineering and harness coverage are decent
2. feature-range acceptance coverage is still substantially behind the specs

## What Went Wrong

The main execution drift came from prioritizing:

1. runtime-spine health
2. shell migration correctness
3. local checkpoint honesty

ahead of the broader functional scope promised by the PRD and task breakdown.

In practice, that meant:

1. we kept improving how the current system behaves
2. before enough of the actual MVP scope existed

## Reset Execution Rule

From this point, when local slice optimization conflicts with unmet MVP feature range, prefer the unmet feature range.

In other words:

1. unfinished P0 functional capabilities beat local refinement work
2. acceptance reporting should be anchored to functional scope closure first
3. further shell/runtime micro-optimizations should only continue when they unblock one of the open functional capabilities above

## Immediate Priority Reset

Use this order until the MVP scope is materially closer to the spec:

1. complete long-session usable input and recovery behavior
2. complete the structure-first tree view for `Session -> Question -> Answer -> Outline`
3. complete real answer structure extraction and source semantics
4. complete short-concept quality uplift as a later `Concept View` foundation
5. land the first real provider-backed AI structuring runtime slice
6. close privacy-boundary storage violations
7. expand acceptance coverage around the actual MVP feature range
8. only then keep deepening secondary shell/state refinements

## Reporting Rule

When summarizing progress:

1. state which MVP functional capability moved
2. state whether it is `implemented`, `partial`, or `gap`
3. do not let a local checkpoint imply broad feature closure

If a slice improves only local engineering quality while leaving the main feature gap unchanged, say so explicitly.
