# Session Handoff Guide

Use this guide when a new Codex session needs to take over ongoing work in this repository without relying on prior chat history.

## Purpose

This file makes session-to-session handoff a repo-level workflow instead of an ad hoc summary in chat.

Use it when:

1. a new Codex thread takes over active implementation work
2. a different tool environment becomes available in another session
3. a user wants a new session to resume from the latest repo state with minimal re-briefing

## Handoff Source Of Truth

A new session should treat these as the canonical handoff stack:

1. [AGENTS.md](/Users/qyx/Desktop/project/thinking-ide/AGENTS.md)
2. [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md)
3. [docs/spec-alignment-execution-plan.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-alignment-execution-plan.md)
4. the latest clean git checkpoint on `master`

If chat history and repo artifacts disagree, prefer the repo artifacts and current git state.

## New-Session Startup Checklist

When a new session takes over:

1. open the repo at `/Users/qyx/Desktop/project/thinking-ide`
2. read the `Start Here` list in [AGENTS.md](/Users/qyx/Desktop/project/thinking-ide/AGENTS.md)
3. run `git status --short --branch`
4. run `git log --oneline -5`
5. confirm whether the worktree is clean
6. identify the latest intended `checkpoint` or `acceptance` from [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md)
7. continue from the highest-priority open slice instead of re-deriving the roadmap

## Recommended Handoff Prompt

Use a handoff prompt like this in the new session:

```text
Take over /Users/qyx/Desktop/project/thinking-ide.

Read AGENTS.md in order, then PROJECT_STATUS.md and docs/spec-alignment-execution-plan.md.

Confirm the current branch, latest clean checkpoint commit, worktree state, and active Wave priorities before changing code.

If a new tool capability is available in this session, use it only after grounding on the repo state and current governance rules.

Report progress using checkpoint/acceptance language from docs/spec-acceptance-commit-policy.md.
```

## Tool-Capability Handoff

When a new session exists because it has a capability the current session lacks, the new session should:

1. confirm the capability actually works before planning around it
2. record any testing or validation result back into repo artifacts if it changes the execution picture
3. avoid treating a new tool as the new source of truth; the repo state still governs the work

Examples:

1. a new session has working real-Chrome MCP access
2. a new session has a different browser automation path
3. a new session has stronger design or Figma tooling

## Handoff Reporting Rules

When ending one session and starting another:

1. prefer a clean worktree or a clearly classified dirty tree
2. make sure the latest completed slice is reflected in `git`
3. update [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md) if current focus changed
4. update [AGENTS.md](/Users/qyx/Desktop/project/thinking-ide/AGENTS.md) only if repo-level operating guidance changed
5. do not rely on long prose summaries in chat as the only handoff medium

## Current Practical Rule

For this repository, a session handoff is considered healthy when:

1. the current branch and latest checkpoint are discoverable from `git`
2. the next slice is discoverable from [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md)
3. the execution rules are discoverable from [AGENTS.md](/Users/qyx/Desktop/project/thinking-ide/AGENTS.md)
4. any special capability advantage of the new session is stated explicitly in the opening prompt
