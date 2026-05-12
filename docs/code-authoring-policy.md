# Code Authoring Policy

Use this policy when writing or restructuring code in Thinking IDE.

It exists to keep feature work additive without letting the repo drift across runtime, state, UI, and persistence boundaries.

## Purpose

This policy defines:

1. Which layer owns which kind of code.
2. What counts as durable code versus temporary code.
3. Which organization patterns are not allowed.
4. How the sidePanel-first migration changes authoring decisions.

## Layer Ownership

Write code into the narrowest layer that can own the behavior.

### `src/extension`

Owns Chrome-extension runtime wiring only:

1. content-script boot and host-tab bridge
2. background worker messaging and sidePanel lifecycle
3. extension entrypoints, manifest-facing wiring, and runtime transport

Do not move product logic, persistence rules, or reusable UI decisions into this layer.

### `src/services`

Owns product logic and transformations:

1. chat scanning and normalization
2. draft generation and source anchoring
3. repository orchestration and runtime-side data flows

Do not put React rendering, browser shell wiring, or Dexie table definitions here.

### `src/stores`

Owns view-facing state and state transitions:

1. Zustand state shape
2. derived UI/runtime status transitions
3. actions that coordinate components with services

Do not let stores become a second services layer or a dumping ground for DOM logic.

### `src/components`

Owns rendering and interaction surfaces:

1. sidePanel app shell
2. panel, canvas, node, and control presentation
3. event handling that forwards intent into store actions

Do not let components scan ChatGPT DOM, talk to Dexie directly, or encode business rules that services already own.

### `src/db`

Owns local persistence primitives:

1. Dexie schema
2. table access helpers
3. storage-bound repository support

Do not put UI state, DOM assumptions, or background-worker orchestration here.

### Background Versus Content Runtime

Inside `src/extension`, keep the split explicit:

1. background owns browser-level sidePanel enable, open, and cross-context coordination
2. content runtime owns active-tab observation and bridge messaging only
3. sidePanel UI owns workspace presentation, not host-page layout surgery

During Wave 1, prefer sidePanel-first code paths over reviving older split-pane shell assumptions.

## Durable Versus Temporary Code

### Durable Code

Code is durable when it:

1. matches a named repo lane and governing spec or policy
2. has one clear owner layer
3. can survive another feature landing nearby without being rewritten immediately
4. has its gaps recorded in repo artifacts when the slice is only a checkpoint

### Temporary Code

Temporary code is allowed only when it is explicit, bounded, and easy to remove.

Examples:

1. compatibility shims during sidePanel-first migration
2. narrow fallback heuristics around unstable host behavior
3. checkpoint-only glue that preserves runtime safety while a deeper slice is still open

Temporary code must:

1. be named as temporary in comments or slice reporting when that is not obvious
2. stay behind the narrowest possible boundary
3. avoid creating a new cross-layer dependency that later becomes permanent by accident

Do not hide temporary behavior behind permanent-sounding abstractions.

## Unacceptable Organization

The following are not acceptable:

1. Components that scan the host DOM, read Dexie directly, or interpret runtime messages inline.
2. Services that import React components, JSX concerns, or panel-local presentation state.
3. Stores that become the main home for parsing, normalization, or persistence branching.
4. Background code that starts owning product-state logic better kept in services or stores.
5. Content-script code that grows into a host-layout engine instead of a runtime bridge.
6. Shared helpers that mix unrelated concerns just to avoid choosing a real owner layer.
7. File names such as `utils/misc`, `helpers/shared`, or similarly vague buckets that hide product responsibility.
8. Duplicating a contract in multiple layers instead of introducing one clear source of truth.
9. Leaving dead split-pane-era shell branches in place after the sidePanel path is the default success path.

## Authoring Rules

Before adding code, ask:

1. Which layer should still own this behavior six slices from now?
2. Is this logic specific to the Chrome runtime, product domain, UI state, rendering, or persistence?
3. Does this change strengthen the sidePanel-first architecture, or keep old in-page workspace assumptions alive?

If the answer is unclear, stop and escalate before adding another mixed-responsibility abstraction.

## Review Expectation

Use [engineering-review-checklist.md](/Users/qyx/Desktop/project/thinking-ide/docs/engineering-review-checklist.md) when reviewing slices against this policy.
