# Worktree Hygiene Policy

Use this policy before starting a new slice in Thinking IDE.

It exists to keep the repo buildable, keep write-set ownership legible, and prevent one agent from hiding another agent's in-flight work behind a "quick cleanup."

## Core Rules

1. Treat worktree hygiene as part of readiness, not post-hoc cleanup.
2. Classify the current worktree before starting a new slice.
3. Do not use hygiene work as a reason to expand the declared write set.
4. Prefer small, explicit checkpoints over long-lived mixed diffs.
5. Do not report a slice as `acceptance` if unrelated or unclassified worktree noise makes the real completion state ambiguous.

## Dirty-Tree Budget

Use this budget at task intake:

1. `clean`
   No tracked or untracked changes outside the declared slice.
   This is the preferred starting state.
2. `lane-local dirty`
   Existing changes are present, but they are clearly owned by the same active slice or lane and do not obscure the new task.
   Work may continue if the write set stays explicit.
3. `mixed dirty`
   The worktree contains changes from multiple lanes, unclear ownership, or unrelated experiments.
   Do not start a new slice until the changes are classified and a sweep decision is made.
4. `boundary-risk dirty`
   The worktree includes uncommitted changes touching shared runtime boundaries, verification scripts, or repo-level governance entry points.
   Escalate before starting another slice, even if your own write set is narrow.

The practical budget for a new slice is `clean` or well-classified `lane-local dirty`. Treat `mixed dirty` and `boundary-risk dirty` as not-ready states.

## Classify The Current Worktree First

Before starting a new slice:

1. Review `git status` and group changes by lane, owner, and write set.
2. Mark each change as one of:
   `active slice`, `safe carry-forward`, `needs checkpoint`, `needs handoff`, or `unknown`.
3. If any change is `unknown`, do not proceed as if the tree were clean.
4. If any unrelated change falls inside your intended write set, re-read the file and re-confirm ownership before editing.
5. If the classification shows multiple unrelated lanes in flight, treat the tree as `mixed dirty` even if each change is individually understandable.

## Pre-New-Slice Sweep

Run a sweep before opening a new slice when the tree is not clean.

1. Finish or hand off any already-complete local change that can be checkpointed cleanly.
2. Remove abandoned scratch output, debug files, and local-only artifacts that are not part of any declared slice.
3. Re-check that the remaining diff still maps to explicit owners and write sets.
4. If the remaining diff still mixes unrelated slices, defer the new slice or narrow it further.

The sweep is a classification and containment pass, not a broad refactor or opportunistic tidy-up pass.

## Long-Running Slice Checkpoint Cadence

For a slice expected to live longer than one focused session:

1. Re-classify the worktree before adding a second independent sub-problem.
2. Cut a checkpoint when the diff reaches one coherent, reviewable outcome.
3. Do not let "I'll clean it up later" become a pile of UI, runtime, persistence, and governance edits in one local tree.
4. If a slice accumulates enough residue that a new teammate could not name the active write set quickly, checkpoint or split it before continuing.

## Mixed Write-Set Cleanup Expectations

When a worktree contains changes from more than one slice:

1. Cleanup is required only for files you own or for obvious throwaway artifacts.
2. Do not rewrite or reorganize another lane's in-flight diff just to make the tree look cleaner.
3. Convert ambiguous local residue into one of three states:
   checkpointed, handed off, or explicitly deferred.
4. If unrelated changes remain, report them in the completion summary instead of pretending the slice started from a clean tree.

## Checkpoint Vs Acceptance

Worktree hygiene affects reporting semantics:

1. A slice may still be reported as `checkpoint` when the repo state is safe, the slice is coherent, and remaining unrelated diffs are classified.
2. A slice should not be reported as `acceptance` when mixed or boundary-risk local changes make it unclear whether the claimed product gap is actually closed.
3. Hygiene alone does not upgrade a slice from `checkpoint` to `acceptance`; the governing spec and acceptance evidence still control that decision under [docs/spec-acceptance-commit-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-acceptance-commit-policy.md).
4. If hygiene gaps forced a narrower report, say so directly in the completion summary.

## Example

Example: during a sidePanel migration, the worktree may contain `src/extension` bridge edits, `src/components` shell changes, and a new governance doc. If the runtime bridge work is still in progress and the docs slice is ready, classify the tree as `mixed dirty`, checkpoint the finished docs work separately if possible, and avoid folding the migration residue into a new unrelated slice. The same rule applies to any repo phase where one architectural migration is active and smaller follow-up slices still need to land around it.

## Minimum Review

For a docs-only hygiene slice, the minimum gate is terminology and consistency review against:

1. [docs/definition-of-ready.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-ready.md)
2. [docs/multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md)
3. [docs/git-workflow.md](/Users/qyx/Desktop/project/thinking-ide/docs/git-workflow.md)
4. [docs/spec-acceptance-commit-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-acceptance-commit-policy.md)
