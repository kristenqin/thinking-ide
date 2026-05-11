# ADR-0002: Shadow DOM and Local-First Persistence

## Status

Accepted

## Context

Thinking IDE injects UI into a third-party page that controls layout, styles, and DOM structure. The MVP also has a product requirement to preserve the user's concept-map workspace across reloads without building accounts or cloud sync, while avoiding long-term storage of full chat transcripts.

## Decision

Mount the injected panel inside a Shadow DOM root and persist the thinking document locally in IndexedDB through Dexie, keyed by conversation identity. Persist only the extension-owned workspace data needed to restore the map and source references, not a separate long-term copy of the full conversation transcript.

## Consequences

- Shadow DOM reduces CSS and component conflicts between ChatGPT and the extension UI.
- Local Dexie persistence gives fast reload recovery and keeps the MVP offline-friendly and backend-free.
- Data remains device-local, which matches MVP scope but does not support cross-device sync or collaboration.
- Source anchoring is intentionally lightweight and may need stronger locator strategies as ChatGPT DOM variations increase.
