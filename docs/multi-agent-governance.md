# Multi-Agent Governance

This repo allows concurrent execution, but each agent must stay inside a declared write set and leave a clear trail.

## Operating Rules

1. One task, one owner.
   A task has one directly responsible agent even if others review or unblock.
2. Write-set first.
   Before editing, declare the exact files or directories you may touch.
3. Do not expand scope silently.
   If the fix needs more files, stop and re-declare the write set.
4. Do not revert unrelated work.
   Treat unexpected diffs as active teammate work unless proven otherwise.
5. Prefer additive coordination.
   Update docs/status to record gaps instead of overwriting another agent's partial solution.

## Ownership Model

Use these default lanes unless a task says otherwise:

1. Runtime lane
   `src/extension`, injection flow, ChatGPT DOM scan/observe, boot lifecycle.
2. Mapping lane
   Draft generation, message normalization, source anchoring, map transformation.
3. UI lane
   Panel UI, React Flow canvas, node interactions, view state.
4. Persistence lane
   Dexie, local storage schema, hydration/save flows.
5. Governance lane
   `PROJECT_STATUS.md`, `docs/definition-of-done.md`, `docs/definition-of-ready.md`, `docs/multi-agent-governance.md`.

If a task crosses lanes, name a primary lane and list the borrowed files explicitly.

## Write-Set Discipline

Before editing, report:

```md
Owner:
Task:
Write set:
Out-of-scope files:
Verification plan:
Frontend classification:
```

Rules:

1. Only edit files in the declared write set.
2. Read adjacent files as needed, but do not "cleanup" them opportunistically.
3. If another agent changed a file in your write set after you started, re-read it before patching.
4. If concurrent edits change the same contract, escalate instead of racing.

## Task Flow

1. Confirm the task is ready per [docs/definition-of-ready.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-ready.md).
2. Declare owner, write set, and verification plan.
3. Implement only the assigned slice.
4. Run the smallest meaningful verification set.
5. Report outcome, gaps, and exact files changed.
6. If done, ensure the slice still satisfies [docs/definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md).
7. For user-facing slices, apply [docs/frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md) before calling the slice complete.

## Reporting Format

Use this completion format:

```md
Status: done | partial | blocked
Owner:
Task:
Files changed:
Checks run:
Result:
Known gaps:
Needs handoff:
```

## Escalate Immediately If

1. The task needs files outside the approved write set.
2. The task changes a shared runtime boundary listed in `definition-of-ready`.
3. Repo scripts fail for reasons unrelated to the current slice.
4. Another agent's in-flight edits make the intended change ambiguous.
5. Spec docs disagree on expected behavior.
6. The safest fix would require reverting or restructuring someone else's work.

## Default Conflict Resolution

1. Preserve the narrower change.
2. Document the conflict in the task report.
3. Hand off contract decisions before merging broader refactors.

## Lightweight Check Matrix

1. Docs-only slice
   Verify links, terminology, and consistency with `PROJECT_STATUS.md`.
2. Code slice without runtime behavior change
   Run `npm run check`.
3. Code slice with shipped behavior change
   Run `npm run verify`.
4. High-risk shared-boundary change
   Run `npm run verify` and record any manual extension/UI checks performed.
5. UI-facing slice
   Name the governing UI spec docs and classify the slice as `logic-only`, `UI-coupled`, or `UI-alignment`.
