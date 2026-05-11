# Document Sync Policy

This repo treats documentation synchronization as a governed engineering activity, not as an optional cleanup step.

## Purpose

Use this policy to decide:

1. Which documents must be updated when a slice lands.
2. Which documents are secondary and may lag briefly.
3. What repo gate applies before a slice can be called `done`.

## Document Tiers

### P0: Required Sync Documents

These documents must be updated in the same slice whenever their trigger conditions are met:

1. [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md)
2. [docs/risk-register.md](/Users/qyx/Desktop/project/thinking-ide/docs/risk-register.md)
3. [docs/traceability-matrix.md](/Users/qyx/Desktop/project/thinking-ide/docs/traceability-matrix.md)
4. The governing topic doc for the slice when one exists.
   Example: [docs/runtime-validation.md](/Users/qyx/Desktop/project/thinking-ide/docs/runtime-validation.md) for runtime smoke work.

### P1: Required Entry-Point Sync Documents

These documents must be updated when their summaries or operating instructions become stale:

1. [AGENTS.md](/Users/qyx/Desktop/project/thinking-ide/AGENTS.md)
2. [docs/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/README.md)
3. [docs/git-workflow.md](/Users/qyx/Desktop/project/thinking-ide/docs/git-workflow.md)
4. [docs/definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md)

### P2: Reference And Planning Notes

These documents should be updated when they are directly affected, but they are not always mandatory for every slice:

1. [docs/bundle-reduction-notes.md](/Users/qyx/Desktop/project/thinking-ide/docs/bundle-reduction-notes.md)
2. [docs/document-system-map.md](/Users/qyx/Desktop/project/thinking-ide/docs/document-system-map.md)
3. ADRs under [docs/architecture-decisions](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions)
4. Root product/spec docs in the repository

## Trigger Matrix

Use this matrix before marking a slice `done`.

### Runtime Behavior Change

Examples:

1. content script boot
2. host matching
3. observer logic
4. regeneration flow
5. source jumping
6. runtime validation scripts

Must update:

1. `PROJECT_STATUS.md`
2. `docs/risk-register.md`
3. `docs/traceability-matrix.md`
4. `docs/runtime-validation.md` if the runtime gate or its guarantees changed
5. `AGENTS.md` if current focus or default verification guidance changed

### Verification Or Build Pipeline Change

Examples:

1. `package.json` scripts
2. CI workflow
3. pre-commit checks
4. build output guarantees

Must update:

1. `PROJECT_STATUS.md`
2. `docs/README.md`
3. `docs/definition-of-done.md`
4. `docs/git-workflow.md`
5. Topic-specific docs such as `docs/runtime-validation.md`

### Current Focus Or Milestone Shift

Examples:

1. next slices changed
2. a milestone concern moved from `next` to `done`
3. the main integration focus changed

Must update:

1. `PROJECT_STATUS.md`
2. `AGENTS.md`

### Risk Or Coverage Change

Examples:

1. a known limitation was reduced
2. a new active risk appeared
3. a quality gate became stronger

Must update:

1. `docs/risk-register.md`
2. `docs/traceability-matrix.md`
3. `PROJECT_STATUS.md` if the operational summary changed

### Reference-Note Invalidation

Examples:

1. a planning note names a build artifact that no longer exists
2. an analysis note claims a repo command fails when it now passes
3. a bundle note references an outdated output shape

Must update:

1. The stale reference note itself
2. `PROJECT_STATUS.md` only if the stale note affected the active milestone summary

### Root Spec Contract Change

Examples:

1. product promise changed
2. interaction contract changed
3. data model or persistence contract changed
4. runtime architecture changed
5. validation strategy changed

Must update:

1. The affected root spec document or documents
2. `docs/traceability-matrix.md` if implementation coverage meaning changed
3. `PROJECT_STATUS.md` if the active milestone narrative or next slices changed

Use [document-system-map.md](/Users/qyx/Desktop/project/thinking-ide/docs/document-system-map.md) to decide which root spec family owns the change.

## Done Gate

If a slice triggers this policy and the required documents are not updated, the slice does not satisfy repository done criteria unless the gap is explicitly recorded in `PROJECT_STATUS.md`.

## Minimum Review Checklist

Before committing a slice:

1. Name the governing spec or topic doc.
2. Check whether the slice changed runtime behavior, verification, current focus, risk posture, or reference-note validity.
3. Update the required P0 and P1 docs from the trigger matrix.
4. Verify that `AGENTS.md` and `PROJECT_STATUS.md` do not point to different current priorities.
5. Verify that any topic doc describing a gate or script still matches `package.json` and the current implementation.
