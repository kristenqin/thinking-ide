# Spec Alignment Execution Plan

## Purpose

This document converts the 2026-05-12 gap assessment and the new alignment contracts into one executable work order.

It exists so the repo can move from:

`runtime-spine-first delivery`

to:

`spec-parity-first delivery`

without losing the engineering guardrails already in place.

## Inputs

This plan is derived from:

1. [spec-gap-assessment-2026-05-12.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-gap-assessment-2026-05-12.md)
2. [layout-fidelity-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/layout-fidelity-contract.md)
3. [adapter-acceptance-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/adapter-acceptance-contract.md)
4. [ai-structuring-baseline.md](/Users/qyx/Desktop/project/thinking-ide/docs/ai-structuring-baseline.md)
5. [test-alignment-baseline.md](/Users/qyx/Desktop/project/thinking-ide/docs/test-alignment-baseline.md)

## Alignment Principle

From this point, the repo should judge progress by:

1. layout fidelity
2. adapter acceptance
3. semantic extraction quality
4. privacy-boundary compliance
5. spec-based acceptance coverage

not primarily by the number of runtime subsystems already wired together.

## Work Order

### Wave 1: Layout Fidelity

Goal:

Make the product look and behave like the spec-defined workspace while using the adopted `sidePanel` shell strategy.

Current status:

1. The first implementation slice is landed.
2. The repo previously pursued a page-level split-pane model, but the active architecture is now being redirected toward a `sidePanel-first` shell.
3. The remaining Wave 1 work should be judged against [sidepanel-first-refactor-checklist.md](/Users/qyx/Desktop/project/thinking-ide/docs/sidepanel-first-refactor-checklist.md), not against deeper host-layout surgery.
4. Remaining Wave 1 work is now a bounded shell migration and sidePanel-productization tail, not an unbounded layout rewrite.

Must include:

1. Stable Chrome `sidePanel` shell as the default success path
2. Header control parity inside the docked panel shell
3. SidePanel-native empty, waiting, restored, and failed states
4. Bootstrap acceptance coverage for the panel app and host runtime bridge
5. Minimal host-DOM coupling

Reason this comes first:

1. It is the most visible product mismatch.
2. Later UI alignment work will keep drifting if the shell model itself is wrong.

### Wave 2: ChatAdapter And History Recovery

Goal:

Make the adapter satisfy the historical conversation, completion-detection, and recovery contract.

Must include:

1. Stable `conversationKey`
2. Full available history scan
3. Assistant completion detection
4. Stable privacy-safe `MessageRef` / `SourceRef`
5. Refresh and historical reopen recovery

Reason this comes second:

1. Semantic generation quality cannot be trusted if the adapter only sees partial or incorrectly timed inputs.

### Wave 3: AI Structuring Baseline

Goal:

Replace heuristic-only structuring with a real provider-backed MVP structuring path.

Current status:

1. Planning assets are now implementation-ready at the repo level.
2. The repo now has a fixed Wave 3 fixture set, a tightened provider-draft contract, and a first-batch provider plan that explicitly includes `DeepSeek`.
3. Runtime wiring, schema validation, and provider adapter code are still open.

Must include:

1. Background-worker service boundary
2. Provider evaluation fixture set
3. First provider batch including `DeepSeek`
4. Validated normalized JSON contract
5. Failure handling that preserves the old map

Reason this comes third:

1. Once layout and adapter inputs are stable, the semantic quality problem should be solved at the right layer.

### Wave 4: Semantic Node Quality

Goal:

Reach spec-level node and relation quality.

Must include:

1. `question` and `answer` abstraction quality
2. real `answer_outline`
   `answer_outline` must come from the rendered answer heading tree first, not from flattened `textContent` heuristics
3. no-heading answers return an empty outline instead of paragraph/ sentence fallback guesses
4. short concept extraction
5. bounded concept counts
6. relation vocabulary alignment

Reason this is separated from Wave 3:

1. The service boundary and provider decision must be stable first.
2. Then prompts, normalization, and fixtures can iterate against a real contract.

### Wave 5: Privacy Boundary Correction

Goal:

Bring storage behavior back inside the PRD and test-spec privacy boundary.

Must include:

1. stop long-term storage of full prompt/reply bodies
2. move to hash/preview/reference-based recovery fields
3. preserve restore behavior while shrinking stored transcript exposure

Reason this remains P0:

1. The current implementation is contractually wrong, not just incomplete.

### Wave 6: Acceptance-Test Realignment

Goal:

Make test reporting reflect actual MVP acceptance.

Must include:

1. layout acceptance
2. history-chat acceptance
3. completion-detection acceptance
4. semantic fixture checks
5. privacy-boundary checks

Reason this comes after the earlier waves:

1. The first five waves establish the real product baseline the tests should verify.

## Reporting Rule

During this alignment phase:

1. A slice that improves only engineering scaffolding does not increase reported product completion.
2. A slice increases reported product completion only when it closes one of the work-order gaps above.
3. Completion reporting should reference the affected wave explicitly.
4. User-visible slices must also follow [spec-acceptance-commit-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-acceptance-commit-policy.md): safe `checkpoint` commits are allowed, but they do not count as alignment acceptance unless the visible mismatch for that wave is actually closed.

## Default Main-Thread Priorities

Until the alignment phase ends, the main thread should default to:

1. integrating the highest-priority wave
2. spawning sidecars for bounded supporting work
3. updating spec-based progress reporting
4. refusing to describe the repo as “mostly complete” until Waves 1 through 5 have substantially landed

## Current Recommendation

The next implementation wave should be:

1. **Wave 1: Layout Fidelity**
2. **Wave 2: ChatAdapter And History Recovery**

The next decision/prep wave that can continue in parallel is:

1. **Wave 3: AI Structuring Baseline**

Wave 3 is now ready for a bounded runtime implementation slice, but it is still not counted as landed product capability until provider-backed structuring actually runs through the background-worker path.

The remaining waves depend on those foundations.
