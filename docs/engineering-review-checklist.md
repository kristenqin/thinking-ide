# Engineering Review Checklist

Use this checklist during review for implementation slices, especially user-visible or runtime-facing changes.

It complements [definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md), [frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md), and [debug-triage-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/debug-triage-policy.md).

## Scope And Contract

1. Is the slice still inside the declared write set?
2. Does the change name its governing spec or repo policy explicitly?
3. If the slice is user-visible, is it classified correctly as `logic-only`, `UI-coupled`, `UI-alignment`, or `Design-system`?
4. If the slice is only a checkpoint, does the report avoid sounding like full acceptance?

## Layer Ownership

1. Does each changed file keep one clear owner layer: extension, services, stores, components, or db?
2. Did any component gain DOM-scanning, persistence, or product-logic ownership it should not have?
3. Did any store gain parsing, normalization, or runtime-bridge work better owned elsewhere?
4. Did any service start owning presentation structure or React-specific behavior?
5. Did background, content runtime, and sidePanel keep their responsibilities distinct?

## SidePanel-First Architecture

Apply this section to Wave 1 shell, bootstrap, or runtime slices:

1. Does the change strengthen the sidePanel-first shell instead of reviving the old split-pane mental model?
2. Is the content script still acting as a runtime bridge rather than a primary layout engine?
3. Is the panel app more self-sufficient in startup, empty, restored, waiting, and failed states?
4. Did the change isolate any compatibility patch instead of letting it become the default architecture?

## Runtime And User-Visible Behavior

Apply this section to runtime or user-visible slices:

1. Does the implementation cover more than the happy path, especially empty, generating, restored, failed, and source-lost states when relevant?
2. If a flow crosses content runtime, background, and sidePanel, is the contract still singular and understandable?
3. If the slice changes what the user sees or clicks, is the UI treatment landing with the behavior rather than being silently deferred?
4. If the task is an investigation or regression fix, was rendered evidence or runtime-validation evidence used before code-first guessing?

## Temporary Versus Durable Code

1. Is any temporary code clearly bounded and obviously temporary?
2. Did the slice accidentally make a temporary fallback more central than the intended durable path?
3. Would another feature now have to build on the temporary branch to keep moving?
4. If the answer is yes, should the review ask for a refactor before merge?

## Refactor Signals

1. Did the change duplicate a runtime, state, or persistence contract across layers?
2. Did it add another boolean mode or branching path where a state-model cleanup is overdue?
3. Did it rely on a vague helper or catch-all file instead of a clear owner layer?
4. If a refactor trigger fired, is that called out explicitly in the review?

## Verification And Reporting

1. Did the slice use the smallest valid gate for its risk level?
2. For user-visible or runtime slices, is the verification evidence appropriate to the claim being made?
3. Are known gaps stated plainly?
4. Does the completion summary include status, files changed, checks run, and whether document-sync follow-up is needed?

## Minimum Reviewer Outcome

Before approving, the reviewer should be able to say:

1. the layer ownership still makes sense
2. the sidePanel-first direction is clearer, not muddier
3. temporary code did not quietly become architecture
4. the reported status matches the real level of product completion
