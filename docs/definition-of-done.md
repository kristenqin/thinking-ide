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
   `npm run verify` succeeds, or the missing part is explicitly recorded as a known gap.
6. Known gaps are named.
   Deferred work, temporary heuristics, or risks are documented in `PROJECT_STATUS.md` or the relevant design document.
7. Architecture stays aligned.
   UI, state, services, and persistence remain separated unless a documented exception is made.
8. No silent product drift.
   If implementation intentionally diverges from the existing specs, the relevant spec document is updated in the same iteration or the drift is recorded clearly.

## Not Enough On Its Own

The following do not qualify as done by themselves:

1. The UI renders once but is not wired into the intended data flow.
2. The code compiles locally but no repository script verifies it.
3. A workaround exists only in chat context and is not reflected in repository artifacts.
4. A feature “mostly works” but the unresolved failure mode is undocumented.

## Default Verification Command Set

```bash
npm run check
npm run build
npm run verify
```

## Notes

1. `verify` can evolve over time as linting and tests are added.
2. The bar should stay strict enough to protect quality, but not so heavy that it blocks iteration on every small step.
