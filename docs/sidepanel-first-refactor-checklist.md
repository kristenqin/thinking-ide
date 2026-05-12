# SidePanel-First Refactor Checklist

## Purpose

This checklist captures the Wave 1 shell migration after the repo switched from:

`host-DOM-heavy split-pane workspace`

to:

`Chrome sidePanel-first workspace shell`

It exists so future Wave 1 work stops treating the current product as a page-injected concept-map workspace and instead treats it as a browser-docked panel app that reads from the active chat tab.

## Why The Strategy Changed

The repo originally tried to achieve layout fidelity by:

1. identifying a host page root
2. identifying host sidebar and main content regions
3. rewriting the host page into a split-pane shell
4. rendering Thinking IDE inside that rewritten page layout

That approach drifted because it made the extension responsible for host layout decisions that the browser and host app should own.

The new direction follows the architectural lesson from BrainyAI/Sider-style products:

1. let Chrome own the right-docked shell through `sidePanel`
2. let the host page reflow itself inside the remaining viewport
3. keep the content script focused on chat runtime bridging rather than host layout surgery

## Architectural Baseline

Wave 1 should now assume:

1. `sidePanel` is the default success path, not a fallback
2. content script owns runtime bridging only
3. background worker owns sidePanel enable/open/close behavior
4. the panel app owns all workspace UI
5. host-specific DOM patching is a last-resort compatibility tactic, not the primary layout engine

## What We Keep

The migration should preserve:

1. the existing concept-map workspace UI as the starting panel app
2. source-jump behavior against the active chat tab
3. settled-assistant completion gating
4. restored-map safety guards under partial history
5. local persistence and runtime validation discipline

## What Must Change Next

### 1. Remove Split-Pane Mental Model Residue

1. stop describing Wave 1 success as `4:6 page split-pane`
2. stop treating `Collapse` as page-layout chrome
3. stop carrying `layout` and `overlay` as primary UI modes for the main product shell

### 2. Treat The Panel As A Native SidePanel Product

1. make the panel self-sufficient in its header, empty states, and settings
2. optimize the canvas and controls for a narrower docked workspace
3. design startup, waiting, restored, partial-history, and failed states for sidePanel semantics instead of page-injected workspace semantics

### 3. Keep Content Runtime Lightweight

1. content script should read and observe chat content
2. content script should not be the primary layout engine
3. host-shell heuristics should be minimized and isolated if still needed for compatibility

### 4. Reframe Runtime Validation

1. validate that the extension injects a runtime bridge into the host tab
2. validate that `sidepanel.html` mounts correctly as an independent app shell
3. validate that the sidePanel can bootstrap chat context and generate without manual intervention
4. validate that source jump still works from the panel into the active host tab

## Immediate Checkpoint Questions

Before landing another Wave 1 slice, answer:

1. does this change make the panel more like a stable sidePanel app, or more like a migrated in-page workspace?
2. does this change reduce host-DOM assumptions, or add more of them?
3. does this change clarify sidePanel-native states, or keep layout-era UI semantics alive?
4. does runtime validation prove the sidePanel bootstrap path without a manual refresh?

## Reporting Rule

During this migration:

1. a slice can be a valid `checkpoint` when it moves the shell toward sidePanel-first architecture
2. do not call Wave 1 `acceptance` until the right-docked panel feels like a coherent product shell rather than a transplanted page workspace
3. do not report layout parity using split-pane wording once a slice follows the sidePanel-first model
