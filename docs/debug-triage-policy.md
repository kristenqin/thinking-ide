# Debug Triage Policy

This repo treats UI and runtime debugging as an evidence-first workflow, not a code-first guessing exercise.

## Purpose

Use this policy when a slice is primarily about investigating, reproducing, or narrowing a user-visible UI or runtime issue.

This policy defines:

1. What evidence should be collected before changing code.
2. Why screenshot or render-result inspection comes before implementation guesses.
3. How to split debugging work across main-thread and sidecar agents.
4. When code-first debugging is allowed as an exception.

## Scope

Apply this policy to issues such as:

1. Panel layout regressions.
2. Canvas rendering defects.
3. Incorrect state presentation.
4. Extension injection failures that are visible in the host page.
5. Runtime validation failures with visible UI output.
6. Mismatches between expected UI behavior and the rendered result.

This policy does not replace normal implementation flow for clearly scoped code changes that already have a known cause.

## Core Rule

For UI or runtime issues, inspect the rendered result first.

That means debugging should start from the strongest visible evidence available, in this order:

1. Screenshot, video capture, or rendered browser state.
2. Reproduction steps and observed behavior.
3. Runtime validation output or browser-console evidence tied to the visible failure.
4. Code inspection and code changes.

Do not start by changing code just because a likely cause seems familiar.

## Required Triage Sequence

### 1. Capture The Failure Surface

Before editing code, collect at least one of:

1. A screenshot of the broken UI state.
2. A render result from runtime validation or browser automation.
3. A precise textual description of what is visible when screenshot capture is unavailable.

The capture should make the user-visible symptom concrete enough that another agent can reason about it without re-deriving the failure from source alone.

### 2. Name The Observable Gap

Write down:

1. What was expected to render or happen.
2. What actually rendered or happened.
3. Which governing doc or validation artifact defines the expected result.

For UI issues, name the governing doc explicitly, such as:

1. [docs/frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md)
2. [thinking_ide_交互设计规范文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_交互设计规范文档.md)
3. [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)
4. [docs/design-system/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/design-system/README.md)

### 3. Reproduce Before Explaining

Prefer a stable reproduction path before forming implementation hypotheses.

Good reproduction evidence includes:

1. A runtime-validation step that fails consistently.
2. A browser-driven path that reproduces the same rendered defect.
3. A host-state precondition that explains when the issue appears and when it does not.

### 4. Only Then Move To Code-Level Narrowing

Once the failure surface is captured and reproducible:

1. Trace the issue inward from rendered symptom to state, service, runtime, or style cause.
2. Change the narrowest plausible layer first.
3. Re-run the same visual or runtime evidence path after the change.

## Evidence Priority

When multiple debugging inputs are available, prefer them in this order:

1. Current rendered result from the app or runtime harness.
2. Deterministic reproduction from `npm run runtime:validate` or another repo gate.
3. Console errors and logs that directly correspond to the captured failure.
4. Historical assumptions, memory of similar bugs, or speculative code reading.

If rendered evidence and code intuition disagree, trust the rendered evidence until a reproduction gap is explained.

## Multi-Agent Debugging Rule

For non-trivial UI or runtime investigations:

1. Keep the main thread focused on reproduction, evidence review, and final integration.
2. Use sidecars for bounded supporting work such as screenshot capture, runtime validation, or targeted code inspection when write sets do not overlap.
3. Share the captured failure artifact or its concise summary so the main thread does not become the only place holding debugging context.

## Allowed Exceptions

Code-first debugging is allowed only when at least one of these is true:

1. The issue is non-visual and already narrowed to a single internal contract.
2. The relevant UI or runtime surface cannot be rendered in the current environment.
3. The failure is a build, type, or syntax break that prevents any render from occurring.
4. A prior screenshot or render-result investigation already established the symptom and the agent is continuing the same slice.

When using an exception, name it explicitly in the task notes or completion summary.

## Completion Expectation For Debug Slices

A debug-focused slice should report:

1. The observed failure symptom.
2. The evidence source used first.
3. The governing doc or validation artifact used to judge correctness.
4. The verification path used after the fix.

## Minimum Review For Docs Consistency

If this policy changes, update the smallest relevant governance entrypoints so agents can discover it from:

1. [AGENTS.md](/Users/qyx/Desktop/project/thinking-ide/AGENTS.md)
2. [docs/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/README.md)
3. [docs/multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md)
