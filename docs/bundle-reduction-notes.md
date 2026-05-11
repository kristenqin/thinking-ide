# Bundle Reduction Notes

Scope:
`M1 - MVP runtime spine` only.

Governing sources:
`PROJECT_STATUS.md`, `thinking_ide_mvp_项目文档.md`, `thinking_ide_技术方案文档.md`, [docs/risk-register.md](/Users/qyx/Desktop/project/thinking-ide/docs/risk-register.md), [docs/architecture-decisions/ADR-0001-runtime-spine.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0001-runtime-spine.md), and [docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0002-shadow-dom-and-local-persistence.md).

Current warning context:
The repo already tracks bundle size as active risk `R-07`. The current built `dist/content.js` in the workspace is about `514 KB`, which matches the `PROJECT_STATUS.md` note that the content bundle is above Vite's default warning threshold. Direct inspection of `src/extension/content.tsx` and `src/app/App.tsx` shows that the content entry eagerly pulls in the full React app, `@xyflow/react` plus its `d3` stack, and Dexie. `react-dom` and React Flow are the dominant payloads; Dexie is secondary; Zustand and the two Lucide icons are not the main problem.

Lowest-risk opportunities:

1. Defer the React Flow canvas behind a dynamic import.
   Today `content.tsx -> App.tsx -> ThinkingPanel -> ConceptMapCanvas` makes the full canvas stack part of first-load JS even before the user interacts with the panel. Splitting `ConceptMapCanvas` and its `@xyflow/react` dependency is the clearest low-risk win because it stays in the UI lane and does not change message shape, store shape, persistence contract, or extension boot ownership.
2. Stop inlining the full React Flow stylesheet into `content.js`.
   `content.tsx` currently concatenates `@xyflow/react/dist/style.css?inline` with the extension stylesheet and injects both as text into the Shadow DOM. Moving the React Flow CSS to a separately loaded asset, while still attaching it inside the shadow root, should reduce JS bundle weight without changing runtime architecture.
3. Lazy-load Dexie-backed persistence after boot instead of bundling it into the initial render path.
   `useThinkingStore` imports repository persistence eagerly, which means local storage code ships with first paint. Deferring `loadDocument` / `saveDocument` behind a small async boundary keeps ADR-0002 intact while trimming bootstrap cost from the content script.
4. Split the panel shell from the scan-and-regenerate runtime.
   The current app boot immediately imports scan, generation, observation, store, and canvas concerns together. A smaller shell that mounts first and then loads scan/observer logic after target-page confirmation would preserve ADR-0001's local content-script-first flow while keeping the startup path thinner.
5. Avoid spending time on micro-optimizations first.
   Based on the current import graph, `zustand` and the named `lucide-react` icons are not top contributors. The repo should prioritize React Flow, its CSS delivery path, and Dexie loading before considering icon swaps or store-library changes.

Guardrails:

1. Keep the content-script-first runtime spine from ADR-0001.
2. Keep local-first Dexie persistence from ADR-0002; only change when it loads, not whether it exists.
3. Do not mix bundle work with active runtime-boundary changes around selectors, source anchoring, store shape, or persistence schema.
4. Re-check bundle work against risk `R-07` and the current `PROJECT_STATUS.md` milestone notes before implementation starts.

Assumptions:

1. The current `dist/content.js` reflects the latest successful content build available in the workspace.
2. `npm run build` and `npm run ci` are currently passing, so this note treats the bundle warning as a reproduced active risk plus a verified import-graph issue.
