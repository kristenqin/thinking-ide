# Definition Of Ready

Use this before an agent starts implementation work in Thinking IDE.

## Ready If

1. The task points to a concrete repo artifact.
   Accepted sources: `PROJECT_STATUS.md`, PRD, technical design, component spec, task breakdown, test case doc, or an issue/PR note that names one of them.
2. The scope is one feature slice, not a milestone bundle.
   The agent can say what will change and what will not.
3. The target area is identified.
   Example: `content script`, `chat scan`, `draft generation`, `canvas render`, `local persistence`, or docs/process.
4. The write set is explicit.
   List the files or directories the agent is allowed to edit before work starts.
5. Dependencies are named.
   Upstream tasks, required data shape, DOM assumptions, or persistence contracts are known.
6. Verification is defined.
   At minimum, name which of `npm run check`, `npm run build`, `npm run verify`, manual extension loading, or spec review applies.
7. Acceptance is observable.
   The result can be checked in code, UI behavior, or a documented artifact.

## Do Not Start If

1. The task requires edits outside the declared write set.
2. The task conflicts with active work owned by another agent and no handoff rule is defined.
3. The task depends on unspecified ChatGPT DOM behavior or message structure.
4. The task says "align with spec" but does not name the governing spec doc.
5. The task can only be verified by "looks right" with no command, test case, or behavior check.

## Task Intake Checklist

- Source artifact named.
- Goal and non-goals written in 1-3 lines.
- Write set declared.
- Owner assigned.
- Dependencies and blockers listed.
- Verification method chosen.
- Escalation trigger noted if the task touches shared runtime boundaries.

## Shared Runtime Boundaries

Escalate before starting if the slice changes any of these contracts:

1. ChatGPT DOM selectors or observation strategy.
2. Message normalization shape or ordering rules.
3. Concept map node/edge schema.
4. Zustand store shape or persistence contract.
5. Extension boot/injection lifecycle.

## Ready Task Template

```md
Task:
Scope:
Non-goals:
Source artifact:
Owner:
Write set:
Dependencies:
Verification:
Escalate if:
```
