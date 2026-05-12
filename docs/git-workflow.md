# Git Workflow

Use this workflow for changes in Thinking IDE. It is intentionally narrow: small slices, explicit ownership, and no surprise edits across active lanes.

## Branch Strategy

1. Keep the current integration branch releasable.
   Today this repo uses `master`. If the branch is later renamed to `main`, the same rule applies.
2. Start work only after the task is ready under [docs/definition-of-ready.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-ready.md).
3. Create one branch per feature slice or docs/process slice, not per milestone.
4. Name branches so the lane and scope are obvious.
   Examples: `docs/git-workflow`, `runtime/message-observer`, `ui/panel-selection`.
5. If the task crosses lanes, keep one primary branch and list borrowed files in the task intake instead of opening broad cleanup work.

## Commit Cadence

1. Commit in small, reviewable steps that preserve a coherent slice.
2. Prefer one commit for one observable outcome.
   Examples: readiness doc update, persistence contract change, observer wiring.
3. Do not batch unrelated fixes into the same commit.
4. Re-read files before committing if another agent may have touched the same area.
5. Never revert unrelated diffs to make your branch look clean.
6. During spec-alignment work, classify user-visible slices using [spec-acceptance-commit-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-acceptance-commit-policy.md) so `checkpoint` commits are not mistaken for product acceptance.
7. Before starting a new slice or letting a long-running slice expand, apply [docs/worktree-hygiene-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/worktree-hygiene-policy.md) so mixed local diffs are classified and swept instead of silently accumulating.

## Commit Gate

Before opening a PR, merging, or handing off a branch:

1. Confirm the slice still matches `PROJECT_STATUS.md` and the governing spec/doc named in the task.
2. Confirm done criteria from [docs/definition-of-done.md](/Users/qyx/Desktop/project/thinking-ide/docs/definition-of-done.md).
3. Run the smallest valid repo gate for the slice:
   Docs-only: link and terminology review.
   Code without runtime behavior change: `npm run check`.
   Shipped behavior change outside runtime boundaries: `npm run verify`.
   Runtime-boundary behavior change: `npm run runtime:validate`.
   Release candidate or CI parity check: `npm run ci`.
4. Apply [docs/document-sync-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/document-sync-policy.md) before calling the slice done.
5. If the required gate is incomplete because of a known repo gap, record that gap explicitly in `PROJECT_STATUS.md` or the relevant design doc before calling the slice done.
6. Do not merge code that passes only by relying on unstated local edits.
7. For user-visible spec-alignment slices, do not report the slice as aligned unless it meets the `acceptance` bar in [spec-acceptance-commit-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-acceptance-commit-policy.md).
8. Do not treat a slice as commit-ready if [docs/worktree-hygiene-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/worktree-hygiene-policy.md) would still classify the tree as `mixed dirty` or `boundary-risk dirty` without an explicit carry-forward decision.

## What Not To Commit

1. Unrelated teammate changes.
2. Scope expansion outside the declared write set.
3. Temporary debug code, scratch files, or local experiment output.
4. Half-applied refactors that change contracts without updating the governing docs.
5. Generated artifacts or local state unless the task explicitly requires them.
6. “Fixup” edits to nearby files that were not part of the assigned slice.
7. A commit message that implies a visible spec gap is fully closed when the slice is still only a `checkpoint`.

## Multi-Agent Integration

1. Follow [docs/multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md): one owner, declared write set, no silent scope growth.
2. Integrate multi-agent work by stacking narrow branches or PRs on shared `main`, not by combining several unfinished slices into one branch.
   In the current repo state, read this as the shared integration branch `master`.
3. If another agent owns a file you need, stop and re-declare the write set before editing.
4. If concurrent work touches a shared runtime boundary, escalate instead of racing.
5. When handing off, report exact files changed, checks run, known gaps, and whether the branch is `done`, `partial`, or `blocked`.
6. Prefer additive follow-up commits over rewriting another agent's history.
7. If multiple slices are present locally, run a worktree sweep and classify them before integrating or starting another branch-sized change.

## Tags And Checkpoints

1. Tag milestone-quality states on the integration branch, not every feature branch.
   Current milestone anchor: `M1 - MVP runtime spine` from `PROJECT_STATUS.md`.
2. Create a checkpoint when:
   A milestone slice fully satisfies done criteria.
   A risky shared-boundary change lands and passes `npm run runtime:validate` or `npm run ci`.
   The repo reaches a stable demo or handoff state.
3. Use lightweight checkpoints for branch handoff even without a tag.
   Minimum: push the branch, report status, files changed, and checks run.
4. Do not tag work that is still carrying undocumented gaps or failed repo gates.

## Practical Sequence

1. Confirm readiness and write set.
2. Branch for one slice.
3. Commit small, observable steps.
4. Run `check`, `verify`, `runtime:validate`, or `ci` based on risk.
5. Apply the document sync policy and update required docs.
6. Record any intentional gaps in repo artifacts.
7. Merge or hand off without reverting other agents' work.
8. Re-check worktree hygiene before starting the next slice, not only before committing the current one.
