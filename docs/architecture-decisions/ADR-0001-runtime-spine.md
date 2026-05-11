# ADR-0001: MVP Runtime Spine

## Status

Accepted

## Context

Thinking IDE MVP must work as a Chrome Extension on ChatGPT with minimal moving parts. The current product scope is to inject a right-side workspace, scan the visible chat, generate a heuristic concept-map draft, render it in React Flow, and keep the result locally available. The repo already implements this path with an MV3 extension skeleton, a content script entry, a background worker, React UI, Zustand state, and Dexie persistence.

## Decision

Use a content-script-first runtime spine:

`content script -> chat scan -> draft generation -> Zustand store -> React Flow render -> Dexie persistence`

The content script owns page detection, mounting, and runtime boot. The background worker remains present as an extension boundary for future messaging or AI structuring, but the MVP happy path stays local and does not depend on a remote service.

## Consequences

- The MVP stays shippable and debuggable because the core user flow runs inside one page-local runtime.
- We can validate product value before adding background orchestration, remote AI calls, or complex observers.
- ChatGPT DOM coupling remains a known risk; selector hardening and incremental observation are follow-up work, not part of this ADR.
- Future AI structuring can be added behind the existing extension boundary without rewriting the UI, store, or persistence layers.
