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
6. Keep the main thread thin.
   The primary thread should prefer orchestration, integration, and final verification over holding every implementation detail locally.
7. Treat delegation as a trigger-based default, not a user-requested extra.
   When a task matches the automatic delegation triggers below, the main thread should spawn sidecars without waiting for the user to ask.

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
2. Split the work into one local blocker and as many non-overlapping sidecar slices as the current agent capacity safely allows.
3. Declare owner, write set, and verification plan.
4. Implement only the assigned slice.
5. Run the smallest meaningful verification set.
6. Report outcome, gaps, and exact files changed.
7. Close or recycle completed sidecar agents promptly so capacity stays available for the next slice.
8. If done, ensure the slice still satisfies [docs/definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md).
9. For user-facing slices, apply [docs/frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md) before calling the slice complete.
10. For UI or runtime issue investigation slices, apply [docs/debug-triage-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/debug-triage-policy.md) before code-first debugging.

## Parallelism Default

Default execution posture for non-trivial work:

1. Keep one immediate blocker on the main thread.
2. Delegate bounded sidecar work by lane whenever the write sets do not overlap.
3. Prefer at least two parallel sidecars when the task naturally decomposes into UI, runtime, mapping, persistence, tests, or docs.
4. Reuse existing agents when possible instead of spawning redundant new ones.
5. Close idle agents after integration to avoid exhausting the agent/thread budget.
6. Summarize sidecar results into repo artifacts or commit messages so the main thread does not become the only place where context lives.

This default exists to reduce delivery time and keep main-thread context pressure low enough that compaction is less likely.

## Automatic Delegation Triggers

Spawn sidecars by default when any of these are true and the write sets can stay non-overlapping:

1. The task includes both `UI / visual alignment` and `runtime / logic` work.
2. The task includes both `implementation` and `docs / governance` work.
3. The task naturally decomposes into two or more bounded write sets across lanes.
4. A sidecar can explore, verify, or compare while the main thread continues the immediate blocker.
5. The main thread is starting to hold multiple independent subproblems at once.

When these triggers fire:

1. The main thread should keep only the critical blocker and final integration.
2. Sidecars should take bounded lane-owned slices.
3. The user should not need to remind the assistant to parallelize.
4. If a task is kept local despite matching a trigger, the reason should be explicit in the work log or completion summary.

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
6. UI/runtime debug slice
   Capture screenshot or render-result evidence first and record the evidence source used.

## Capacity Hygiene

To keep parallelism available across long-running sessions:

1. Do not leave completed agents idle indefinitely.
2. After integration, close agents that no longer need follow-up context.
3. If the agent budget is exhausted, prefer recycling an existing lane owner before pulling more work back into the main thread.
