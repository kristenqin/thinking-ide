# Spec Acceptance Commit Policy

This policy governs commit semantics during spec-alignment work.

It exists to prevent a user-visible slice from looking "done in git" when it has only reached an engineering checkpoint and still visibly diverges from the governing product spec.

## Why This Policy Exists

During alignment work, a commit can mean two different things:

1. The repository reached a safe engineering checkpoint.
2. The product behavior reached an acceptable spec-aligned state.

Those are not the same.

Without an explicit policy, checkpoint commits can be mistaken for acceptance commits, especially on user-visible layout, interaction, and semantic-quality slices.

## Commit Classes

Alignment-phase commits must be treated as one of these classes:

1. `checkpoint`
   The slice is integrated, bounded, and safe to build on, but it does not yet satisfy the governing spec at an acceptable product level.
2. `acceptance`
   The slice satisfies the governing spec well enough to be reported as aligned for that scope.
3. `blocked`
   The intended slice cannot safely proceed without a contract decision, missing dependency, or contradictory spec input.

Do not describe a user-visible slice as complete unless it qualifies as `acceptance`.

## When `checkpoint` Is Allowed

Use `checkpoint` when all of the following are true:

1. The slice is coherent and does not leave the repo in a half-broken state.
2. Required repo gates for the slice have passed.
3. The remaining gap is explicit in [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md) or the governing alignment doc.
4. The completion summary names the slice as `partial` or `checkpoint`, not `done`.
5. The commit message does not imply the product mismatch is fully resolved.

## When `acceptance` Is Required

User-visible spec alignment must reach `acceptance` before the slice may be reported as aligned.

This is required for:

1. Layout fidelity slices
2. Workspace chrome and information hierarchy slices
3. Adapter behavior that changes what conversation content is available to the product
4. Semantic extraction quality slices
5. Privacy-boundary correction slices

For these slices, passing repo scripts is necessary but not sufficient.

## Acceptance Requirements

An alignment slice qualifies as `acceptance` only when all of the following are true:

1. The governing spec is named explicitly.
2. The key visible mismatch for that slice is no longer obvious in the rendered result.
3. Required repo gates pass.
4. Required sync docs are updated.
5. Any remaining gap is secondary rather than contradicting the slice's core product claim.

## Required Evidence For User-Visible Acceptance

For UI or runtime alignment slices, record result-oriented evidence before calling the slice accepted:

1. Screenshot, browser observation, or runtime-validation evidence of the actual rendered state
2. The governing spec/doc used for comparison
3. A short statement of what visible mismatch was closed

Follow [debug-triage-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/debug-triage-policy.md) for issue investigation and treat that same evidence discipline as the default for acceptance claims.

## Commit Message Guidance

Prefer commit messages that reveal whether a slice is still intermediate.

Safer for partial alignment work:

1. `feat(layout): land split-pane workspace baseline`
2. `feat(adapter): add stable conversation and message refs`
3. `docs(alignment): establish spec-parity execution baseline`

Unsafe for partial alignment work:

1. `feat(layout): align workspace with spec`
2. `feat(adapter): fix history loading`
3. `feat(ai): implement concept extraction`

If the product gap is still open, do not write the commit message as if the final claim is already true.

## Reporting Rule

For alignment-phase slices, every completion summary must say one of:

1. `Status: checkpoint`
2. `Status: acceptance`
3. `Status: blocked`

If the repo artifact format elsewhere uses `done | partial | blocked`, map them as:

1. `done` -> `acceptance`
2. `partial` -> `checkpoint`
3. `blocked` -> `blocked`

## Interaction With Other Repo Gates

This policy supplements, not replaces:

1. [definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md)
2. [git-workflow.md](/Users/qyx/Desktop/project/thinking-ide/docs/git-workflow.md)
3. [spec-alignment-execution-plan.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-alignment-execution-plan.md)
4. [frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md)

The repo may still take small safe commits during alignment work, but those commits must not be reported as product acceptance unless the visible spec gap for that slice is genuinely closed.
