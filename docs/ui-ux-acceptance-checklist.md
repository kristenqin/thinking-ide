# UI/UX Acceptance Checklist

Use this checklist when a Thinking IDE slice needs user-facing acceptance review beyond functional smoke.

This checklist is intentionally product-facing. It does not replace:

1. [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md) for functional test coverage
2. [frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md) for repo-wide UI acceptance guardrails

Instead, it adds a structured UI/UX review layer on top of functional checks so a slice is not treated as experience-ready just because the buttons work.

## When To Use

Apply this checklist when validating:

1. sidepanel state semantics
2. empty, restore, refresh, partial-history, or source-error states
3. node, edge, or toolbar interaction flows
4. any slice where the product question is "can users understand what the system is doing and what to do next?"

## Output Format

For each reviewed state or task, record two judgments:

1. `Functional`
   Can the feature complete its intended action?
2. `Experience`
   Can users understand, predict, and recover from what happened?

Suggested verdict vocabulary:

1. `pass`
2. `partial`
3. `blocked`
4. `gap`

Functional `pass` does not imply experience `pass`.

## Layer 1: State Expression Review

Run these questions against each user-visible runtime state:

1. Can users tell what state they are in at a glance?
2. Can users tell why the state happened?
3. Can users tell what to do next?
4. Can users predict what the primary action will do?
5. Is the same fact stated only once instead of repeated in multiple UI regions?

Recommended Thinking IDE state set:

1. `entry`
2. `restored locally`
3. `visible history only`
4. `refreshing`
5. `up to date`
6. `source_lost`
7. blank-canvas variants of the above

### Pass Standard

A state is not experience-ready unless all of the following are true:

1. one primary state is visually dominant
2. one short reason explains why the state happened
3. one next-step instruction is explicit when action is needed
4. the UI does not require reading multiple repeated notices to understand the situation

### Common Failure Signals

1. status chip, notice block, footer, and selected-object copy repeat the same fact
2. action wording implies recomputation while the runtime only restored or guarded old state
3. a blank canvas appears without a direct reason
4. users cannot tell whether the current graph is fresh, restored, or temporarily frozen

## Layer 2: Task-Flow Review

Review complete task loops, not just isolated widgets.

### Core Thinking IDE Tasks

1. Open a historical conversation and interpret the current graph state
2. Trigger `Refresh` and understand whether the panel reanalyzed, restored, or deferred
3. Use `Source` and understand whether the jump succeeded
4. Edit a node, then refresh or reload and judge whether the result still feels controllable
5. Continue working when history is incomplete or source recovery fails

For each task, ask:

1. Did the action complete functionally?
2. Did the user know what would happen before clicking?
3. Did the result match that expectation?
4. If it failed or degraded, did the UI keep the user oriented?

## Layer 3: Information Architecture Review

Use this to catch noisy or redundant UI.

### Preferred Three-Part Structure

For any important state, prefer:

1. one primary status
2. one reason
3. one next step

### Review Questions

1. Is the top summary necessary, or is it repeating the notice block?
2. Is the footer necessary, or is it repeating the summary?
3. Does the selected-node copy add new meaning, or only restate global errors?
4. Do tooltips add precision, or only repeat visible warnings?
5. Is the most important action placed near the explanation that justifies it?

### Failure Threshold

Treat the screen as an experience gap if:

1. the same core fact appears in more than one explanatory region without adding new value
2. users must reconcile multiple competing state labels to infer what happened
3. the interface explains system internals but still does not tell users what to do next

## Layer 4: Failure-State Review

Failure handling is acceptance-critical.

For each failure or guarded state, ask:

1. Is the failure reason clear?
2. Is the system still controllable?
3. Is the recovery path explicit?
4. Is the wording specific enough to distinguish "cannot locate source" from "graph is missing" from "history is incomplete"?
5. Is the user protected from mistaking a guarded no-op for a successful refresh?

Focus states:

1. `source_lost`
2. `visible history only`
3. generation or refresh no-op outcomes
4. restored-but-not-recomputed states

## Layer 5: Cross-Sample Stability Review

Do not treat a result as experience-ready if it only holds on one conversation sample.

Minimum sample set:

1. short conversation
2. long conversation
3. conversation with strong Markdown structure
4. conversation with incomplete visible history
5. conversation with existing local draft
6. conversation without existing local draft

If a conclusion only holds on one sample, report it as:

1. `sample-bounded checkpoint`

Not:

1. `acceptance`

## Thinking IDE State-Specific Acceptance Prompts

### `entry`

1. Does the panel avoid pretending it is attached to an active conversation?
2. Does it clearly say how to begin?
3. Does it avoid showing restore or refresh guidance too early?

### `restored locally`

1. Does the UI clearly say the graph came from saved local state?
2. Does it avoid implying that the graph was freshly reanalyzed?
3. Does it explain when a further refresh is still needed?

### `visible history only`

1. Does the UI explain that visible host history is insufficient?
2. Does it clearly state that the system is keeping existing local state rather than confidently recomputing?
3. If the canvas is blank, does the UI explain why the canvas is blank?
4. Is the next step explicit, such as loading more history and trying again?

### `refreshing`

1. Can users tell whether refresh means recomputation, rebind, or both?
2. If recomputation does not actually happen, does the final state say so clearly?

### `source_lost`

1. Does the UI say the node remains editable?
2. Does it avoid duplicating the same lost-source warning across multiple surfaces?
3. Does it preserve a sense of control even though the original anchor was lost?

## Suggested Report Template

```text
### UX-STATE-XXXX Short title

- Date:
- Conversation sample:
- Governing docs:
- Functional verdict:
- Experience verdict:
- Reviewed state or task:
- What users can understand immediately:
- What remains confusing:
- Repetition or information-architecture issues:
- Recovery-path quality:
- Sample-bounded or stable across samples:
- Follow-up recommendation:
```

## Practical Rule

Do not call a Thinking IDE slice UI/UX-ready unless:

1. the functional test case passes
2. the corresponding state or task passes this checklist
3. the result is stable across more than one real-host sample when the slice depends on host-history conditions
