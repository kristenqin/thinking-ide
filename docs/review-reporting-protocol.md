# Review Reporting Protocol

Use this protocol when Thinking IDE review work is delegated across multiple agents or multiple review passes.

This document exists to keep review output structured, mergeable, and reusable. It prevents review context from living only in chat or only inside the main thread.

It complements:

1. [multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md)
2. [testing-findings-log.md](/Users/qyx/Desktop/project/thinking-ide/docs/testing-findings-log.md)
3. [ui-ux-acceptance-checklist.md](/Users/qyx/Desktop/project/thinking-ide/docs/ui-ux-acceptance-checklist.md)
4. [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)

## Purpose

This protocol answers four questions:

1. What is the review unit?
2. How should a side agent report results?
3. Where do review summaries and findings live?
4. Who owns final acceptance language?

## Review Units

Use the following hierarchy.

### 1. Checklist Run

A bounded review pass against one named scope.

Examples:

1. a real-host runtime regression pass
2. a UI/UX acceptance pass on `visible history only`
3. a cross-sample review pass on `Refresh`

Checklist runs are recorded as `TR-xxxx` entries in [testing-findings-log.md](/Users/qyx/Desktop/project/thinking-ide/docs/testing-findings-log.md).

### 2. Review Item

A single state, task, or checklist item inside a run.

Examples:

1. `TC-SRC-001`
2. `restored locally`
3. `Refresh` task flow
4. `source_lost` failure-state review

### 3. Finding

A concrete problem that needs handoff or follow-up.

Examples:

1. duplicate notice copy
2. refresh semantics blur restore and reanalysis
3. source jump lands mid-answer

Findings are recorded as `TF-xxxx` entries in [testing-findings-log.md](/Users/qyx/Desktop/project/thinking-ide/docs/testing-findings-log.md).

## Storage Rules

Do not mix run summaries and findings.

### `TR-xxxx`

Use `TR-xxxx` for:

1. review scope
2. conversation sample
3. verdict summaries
4. evidence summary
5. blocked versus passed versus gap coverage

### `TF-xxxx`

Use `TF-xxxx` for:

1. one concrete issue
2. why it matters
3. evidence
4. development handoff notes

## Verdict Vocabulary

Use only these verdict words unless a governing spec requires something stricter:

1. `pass`
2. `partial`
3. `blocked`
4. `gap`

Interpret them as follows:

1. `pass`
   The reviewed item completed as expected in the reviewed sample.
2. `partial`
   The item worked, but not strongly enough to treat as experience-ready or sample-stable.
3. `blocked`
   The item could not be meaningfully judged because the required precondition or observability was missing.
4. `gap`
   A concrete user-facing or runtime-facing deficiency was observed.

For whole-run reporting:

1. `done` maps to `acceptance` only when the governing acceptance bar is actually met.
2. `partial` maps to `checkpoint`.
3. `blocked` stays `blocked`.

## Side-Agent Reporting Contract

Every side agent performing review work must return a structured report.

Use this template:

```text
Review scope:
Conversation sample:
Governing docs:
Write set:
Checklist items reviewed:

Verdict:
- item A: pass/partial/blocked/gap
- item B: pass/partial/blocked/gap

Evidence:
- ...
- ...

Candidate findings:
- ...
- ...

Carry-forward risks:
- ...
```

## Main-Thread Responsibilities

The main thread owns final normalization.

It must:

1. deduplicate overlapping findings from multiple agents
2. decide whether a result belongs in `TR-xxxx`, `TF-xxxx`, or both
3. decide whether a verdict is sample-bounded or stable across samples
4. decide whether the run can be called `checkpoint` or `acceptance`
5. keep repo artifacts, not chat memory, as the durable source of review context

Side agents must not unilaterally declare a product slice `acceptance`-ready.

## Delegation Rules For Review Work

When parallelizing review:

1. assign one agent to one bounded review scope
2. avoid having multiple agents freely review the same item without explicit comparison intent
3. prefer dividing by review dimension or sample set

Recommended splits:

1. by checklist dimension
   state expression, task flow, information architecture, failure states, cross-sample stability
2. by sample type
   short history, long history, partial-history, restored-draft, no-draft
3. by product slice
   source behavior, refresh behavior, node editing, persistence recovery

## Sample-Bounded Reporting Rule

If a result only holds on one real-host conversation, report it as:

1. `sample-bounded checkpoint`

Do not let one good-looking run silently upgrade a result into broad product acceptance.

## Evidence Standard

A useful review report should contain enough evidence that another session can understand the judgment without replaying everything from scratch.

Minimum evidence should name:

1. the conversation sample or URL
2. the relevant UI state
3. the action taken
4. the observed outcome
5. why the outcome maps to the chosen verdict

## Practical Rule

If review output cannot be merged into repo artifacts without rereading a long free-form chat explanation, the report is not structured enough yet.
