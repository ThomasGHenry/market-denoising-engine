# Plan: Domain Types — Technical Decisions

## File Structure

```
packages/domain/src/
  enums.ts        — all 8 plain TypeScript enums
  interfaces.ts   — all 7 interfaces, importing enums from ./enums
  transitions.ts  — 2 guard functions, importing enums from ./enums
  index.ts        — barrel: re-exports enums, interfaces, and guards
  index.test.ts   — all tests collocated with source
```

## Decision 1: File Split

Four source files with single responsibilities:

- `enums.ts` owns the enum declarations and nothing else
- `interfaces.ts` imports enums and declares interfaces — no logic
- `transitions.ts` imports enums and declares guard functions — no data shapes
- `index.ts` barrel re-exports everything from the three source files

This split enforces separation of concerns and makes each file trivially replaceable.

## Decision 2: Transition Guard Implementation

Both guards use a `Set<string>` of encoded pairs:

```
const GENERATION_TRANSITIONS = new Set([
  'DRAFT:ACTIVE',
  ...
])

function isValidGenerationTransition(from, to) {
  return GENERATION_TRANSITIONS.has(`${from}:${to}`)
}
```

Encoding as `"FROM:TO"` strings gives O(1) lookup, zero external dependencies, and a set that is trivially inspectable during debugging.

## Decision 3: RETIRED Transition Encoding

RETIRED transitions are explicit pairs for every source status, including `RETIRED:RETIRED`. This makes the exhaustive list auditable and eliminates implicit catch-all logic. Both generation and probe guard sets include all six RETIRED pairs.

## Decision 4: Zero External Dependencies

`packages/domain` imports nothing outside itself. No `@prisma/client`, no React, no `@template/db`, no `@template/ui`, no `@template/config`. This is enforced by the absence of any `dependencies` or `peerDependencies` in `package.json`.

## Decision 5: Test File Location

`/Users/thomasghenry/code/mde/packages/domain/src/index.test.ts`

Single test file, collocated with source. All cycles of RED-GREEN-REFACTOR target this file. Tests are run with `npx nx run domain:test` from the monorepo root.
