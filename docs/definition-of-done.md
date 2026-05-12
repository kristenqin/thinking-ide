# Definition Of Done

This repository uses the following minimum definition of done for any milestone or feature slice that is reported as complete.

## Required

1. Scope is explicit.
   The change has a clear goal and a clear boundary for what is not included.
2. Code is integrated.
   The implementation is present in the repository and does not depend on unstated local edits.
3. Type safety passes.
   `npm run check` succeeds.
4. Production build passes.
   `npm run build` succeeds.
5. Local verification passes.
   `npm run verify` succeeds, and runtime-boundary slices also run `npm run runtime:validate` or `npm run ci` unless the missing part is explicitly recorded as a known gap.
6. Known gaps are named.
   Deferred work, temporary heuristics, or risks are documented in `PROJECT_STATUS.md` or the relevant design document.
7. Architecture stays aligned.
   UI, state, services, and persistence remain separated unless a documented exception is made.
8. No silent product drift.
   If implementation intentionally diverges from the existing specs, the relevant spec document is updated in the same iteration or the drift is recorded clearly.
9. Required sync docs are updated.
   Any slice that triggers [docs/document-sync-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/document-sync-policy.md) updates the required documents in the same iteration or records the gap clearly.
10. Frontend-facing behavior is accepted as product behavior.
   If the slice changes user-visible UI or interaction, it satisfies the acceptance checks in [docs/frontend-ui-contract.md](/Users/qyx/Desktop/project/thinking-ide/docs/frontend-ui-contract.md) or records the remaining UI gap explicitly.
11. Spec-alignment slices use the right commit semantics.
   If the slice is part of spec-parity work, it is reported as `checkpoint` or `acceptance` according to [docs/spec-acceptance-commit-policy.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-acceptance-commit-policy.md), not silently treated as fully aligned because repo scripts passed.

## Not Enough On Its Own

The following do not qualify as done by themselves:

1. The UI renders once but is not wired into the intended data flow.
2. The code compiles locally but no repository script verifies it.
3. A workaround exists only in chat context and is not reflected in repository artifacts.
4. A feature “mostly works” but the unresolved failure mode is undocumented.
5. Logic behavior landed, but the required user-facing state/interaction treatment was silently deferred.
6. A user-visible alignment slice passed repo gates, but the rendered result still shows the core mismatch the slice was meant to close.

## Default Verification Command Set

```bash
npm run check
npm run build
npm run verify
npm run runtime:validate
```

## Notes

1. `verify` can evolve over time as linting and tests are added.
2. `runtime:validate` is the default runtime-boundary gate; `ci` remains the heavier integration-parity gate.
3. The bar should stay strict enough to protect quality, but not so heavy that it blocks iteration on every small step.
