# Refactor Trigger Rules

Use this document when deciding whether to keep adding features to an area or pause and refactor first.

This repo should prefer narrow forward motion, but not at the cost of hardening the wrong architecture.

## Core Rule

Refactor before continued feature accretion when the next change would deepen a boundary violation, preserve a superseded shell assumption, or duplicate a contract that should have one owner.

## Immediate Refactor Triggers

Stop and refactor first when any of these are true:

1. A feature needs logic in both `src/components` and `src/services` because the current boundary is unclear.
2. A component needs direct DOM scanning, runtime-message interpretation, or Dexie access to ship.
3. A store action is becoming the main place for parsing, normalization, source anchoring, or persistence branching.
4. A service must reach upward into React or panel-local presentation state to complete a flow.
5. Background and content runtime are both starting to own the same lifecycle decision.
6. The same runtime or data contract is now encoded in more than one layer.

## SidePanel-First Migration Triggers

Wave 1 should refactor instead of accreting when:

1. a new slice reintroduces split-pane-era wording, modes, or shell structure as the primary product model
2. content-script changes start doing host layout surgery instead of runtime bridging
3. sidePanel bootstrap depends on manual refresh, host-shell coincidence, or page-era fallback logic as the default path
4. panel UI still assumes it is a transplanted in-page workspace instead of a browser-docked product shell
5. a compatibility patch grows beyond a small isolated fallback and starts steering the main architecture

Use [sidepanel-first-refactor-checklist.md](/Users/qyx/Desktop/project/thinking-ide/docs/sidepanel-first-refactor-checklist.md) as the architectural tie-breaker.

## Temporary-Code Triggers

Refactor before adding more on top when:

1. a temporary shim survives into a second feature slice without an explicit reason
2. a fallback path becomes longer or more central than the intended durable path
3. comments, task reports, and code structure disagree on whether a branch is temporary
4. removing the temporary path would now require edits across multiple layers because it leaked outward

## Runtime And Data Contract Triggers

Refactor first when the next feature would otherwise extend a shaky contract:

1. ChatGPT selector or observation logic is copied instead of centralized.
2. Message normalization shape or ordering rules need ad hoc exceptions in multiple files.
3. Node, edge, document, or message-ref schema handling is drifting across services, stores, and persistence.
4. Repository and store flows are compensating for the same lifecycle ambiguity in parallel.
5. Runtime messaging shapes between content, background, and sidePanel start to fork.

These are shared runtime boundaries. Escalate rather than layering a second workaround on top.

## Complexity Triggers

Refactor is required when a bounded feature slice would otherwise force:

1. a third or fourth boolean mode onto the same flow instead of a clearer state model
2. repeated conditionals for the same lifecycle branch across nearby files
3. another file in a catch-all bucket because no existing layer feels safe
4. duplicated status mapping for empty, waiting, generating, restored, failed, or source-lost states
5. a "just for now" path that reviewers cannot explain quickly from the file layout alone

## What Refactor Means Here

A refactor in this repo should be bounded and outcome-oriented:

1. move behavior to the correct owner layer
2. remove duplicated contracts
3. isolate temporary compatibility logic
4. simplify the next feature slice

Do not turn a trigger into an excuse for broad cleanup outside the declared write set.

## Reporting Rule

When a trigger fires, report one of:

1. the bounded refactor you are taking now
2. the reason you are blocked from taking it
3. the repo artifact where the deferred refactor risk is recorded

If none of those is true, the slice is probably still trying to accrete onto the wrong structure.
