# Runtime Validation

This doc defines the repo-specific black-box runtime validation for `M1 - MVP runtime spine`.

Primary governing sources for this slice:

1. [thinking_ide_mvp_项目文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_mvp_项目文档.md)
2. [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
3. [PROJECT_STATUS.md](/Users/qyx/Desktop/project/thinking-ide/PROJECT_STATUS.md)
4. [docs/architecture-decisions/ADR-0001-runtime-spine.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0001-runtime-spine.md)
5. [docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md)
6. [docs/risk-register.md](/Users/qyx/Desktop/project/thinking-ide/docs/risk-register.md)

## Why This Exists

`npm run check`, `npm run test:run`, and `npm run build` prove type safety, focused service/store behavior, and production packaging. They do not prove that the built MV3 extension still injects into a page, mounts inside Shadow DOM, reads a chat-like DOM, renders a concept map, and reacts to live page mutation as one runtime path.

Runtime validation exists to cover that black-box gap for the current MVP spine:

`content runtime bridge -> active chat scan -> draft generation -> sidePanel store/render -> local persistence-ready UI`

Use it as a smoke test for the shipped extension artifact, not as a replacement for unit tests.

## Local Mock-Host Strategy

The repo uses a controlled local host instead of real ChatGPT for the default smoke pass.

Artifacts:

1. `runtime-validation/mock-chat.html`
2. `scripts/runtime-validation.mjs`
3. `npm run runtime:validate`
4. `npm run runtime:validate:built`

Why the mock host exists:

1. It gives a stable, repeatable DOM for black-box validation.
2. It keeps the test focused on the extension runtime spine, not live ChatGPT variability.
3. It lets the repo validate the shipped unpacked extension deterministically without depending on live ChatGPT.

What the harness does:

1. Builds the extension.
2. Serves `runtime-validation/mock-chat.html` on a temporary localhost port.
3. Launches a persistent Chromium context with the unpacked `dist/` extension loaded.
4. Opens the default mock host and waits for the real content runtime bridge to inject automatically into the chat tab.
5. Opens the real extension `sidePanel` page and waits for the panel app to mount inside Shadow DOM.
6. Verifies that the rendered canvas shell has real working height instead of collapsing into a near-zero strip after mount.
7. Verifies the active success path itself: no legacy in-page app root remains, the panel exposes shell controls, and the browser-owned sidePanel shell is the only product surface.
8. Appends new mock chat content and checks that the panel regenerates against the latest exchange rather than merely staying mounted.
9. Removes the indexed assistant source from the host after the map is already rendered and proves manual refresh degrades into source-lost feedback instead of failing silently or highlighting a different remaining assistant message.

## What The Smoke Test Must Prove

For the current milestone, runtime smoke validation must prove all of the following:

1. The built extension injects on an allowed host.
   In the current local harness this means the unpacked `dist/` extension injects successfully into the mock host page.
2. The content script installs a working runtime bridge on the active host tab.
3. The sidePanel page mounts the app inside Shadow DOM.
4. The runtime can scan the mock chat DOM and produce an initial concept-map render.
5. The rendered map contains real nodes after boot, not just an empty shell.
6. The canvas shell has enough visible height to act as a usable workspace, not a collapsed layout strip.
7. In the default success path, the extension uses the browser-owned sidePanel shell instead of reviving the legacy in-page workspace root.
8. Appending new chat content changes the rendered concept map in a way that proves regeneration switched to the latest exchange, not just that the panel stayed mounted.
9. The sidePanel reaches a healthy visible status after boot and refresh.
10. When a previously indexed assistant source disappears from the host DOM, the panel surfaces a source-lost feedback state instead of silently doing nothing or falling back to the wrong remaining assistant block.

This is intentionally narrower than full product validation. It is the minimum black-box proof that the M1 runtime spine still works as an integrated extension.

## When To Run It

Run `npm run runtime:validate` when a slice changes shipped runtime behavior in or across these areas:

1. `src/extension`
2. `src/services/chatAdapter.ts`
3. `src/services/messageObserver.ts`
4. Draft generation or document merge behavior that affects first render or refresh
5. Mounting, injection, sidePanel lifecycle, or host matching behavior
6. Shadow DOM, panel boot wiring, or content-runtime bridge behavior

Also run it before calling a high-risk runtime slice `done` when `npm run verify` passes but the change still depends on extension-in-page behavior.

`npm run ci` now includes the built-artifact runtime validation step automatically after `verify`, so the repo-level integration gate covers both packaging and in-page extension injection.

Use `npm run runtime:validate:built` when `dist/` is already fresh and you only want to rerun the browser-backed extension load check without rebuilding first.

For docs-only slices, follow the lightweight docs check from [docs/multi-agent-governance.md](/Users/qyx/Desktop/project/thinking-ide/docs/multi-agent-governance.md) instead.

## Current Limits Vs Real ChatGPT Validation

The mock-host smoke test increases confidence, but it is not equivalent to validating on live ChatGPT.

Current limits:

1. The mock DOM only imitates the minimum structure the current adapter understands. It does not cover real ChatGPT layout churn, streaming states, virtualization, or alternate message wrappers.
2. It now proves the full unpacked-extension loading path in automation, but still only against the mock host.
3. It covers one successful source-jump fallback path plus one degraded source-lost path where the indexed assistant disappears while another assistant message still exists, but it does not yet verify source-jump correctness against long, repeated, or edited real conversations.
4. It does not exercise every persistence edge case, only the runtime path up to a healthy injected panel.
5. It does not replace the broader scenarios listed in [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md).

Because of active risks `R-01`, `R-02`, and `R-06`, real ChatGPT validation is still needed before claiming robust runtime behavior across production conversations. Treat this smoke test as the fast black-box guardrail for M1, not as final parity proof.
