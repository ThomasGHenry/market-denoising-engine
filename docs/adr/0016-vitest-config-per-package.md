---
status: proposed
date: 2026-06-24
tags: [testing, tdd, vitest, packages]
---

## Context

PRD §10.5 specifies that "each package that contains logic gets a `vitest.config.ts`". The
current scaffold has:

- `apps/web/vitest.config.ts` — exists, `environment: 'jsdom'`, correct per spec.
- `packages/domain/vitest.config.ts` — does NOT exist. The package has `"test": "vitest run"`
  in `package.json` but no config file. Vitest will use its own defaults (environment: `node`,
  include pattern `**/*.{spec,test}.{ts,mts}`). Without an explicit config the include pattern
  and environment cannot be verified to match the PRD.
- `packages/config/vitest.config.ts` — does NOT exist. `packages/config/package.json` has no
  `test` script at all, so `npx nx run-many -t test` silently skips this package. The
  `parseEnv()` function — described in PRD §10.3 as critical startup logic — has zero test
  coverage.
- `packages/ui/vitest.config.ts` — does NOT exist. The UI package has no `test` script.
  Whether UI needs unit tests is unspecified in the PRD; however the absence of a config means
  no decision has been recorded.

There are zero `*.test.ts` or `*.spec.ts` files anywhere in `packages/` or `apps/web/src/`.
The `npx nx run-many -t test` command in CI will find only `packages/domain` (which has a
`test` script) and `apps/web` (which has vitest configured), and both will run zero tests —
passing trivially.

## Decision

1. `packages/domain/vitest.config.ts` must be created with `environment: 'node'` and
   `include: ['src/**/*.{test,spec}.ts']` to match PRD §10.5.

2. `packages/config/vitest.config.ts` must be created with `environment: 'node'` and a
   `test` script added to `packages/config/package.json`. `parseEnv()` must have at least
   one test before the package is considered complete.

3. `packages/ui` does not contain logic — it contains React components. A decision must be
   recorded (here or in DECISIONS.md) on whether UI unit tests are in scope for the template.
   Until that decision is made, `packages/ui` is explicitly excluded from the `test` target.

4. Each Vitest config file must be present before any test is written for that package — the
   config is the structural prerequisite (analogous to a build-time test).

## Consequences

- `packages/config/package.json` requires a `test` script addition.
- Two `vitest.config.ts` files must be created.
- A decision on `packages/ui` test strategy must be documented.
- Until implemented, `npx nx run-many -t test` passes green with zero tests executed,
  providing no coverage signal.
