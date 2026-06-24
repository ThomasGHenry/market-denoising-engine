---
status: accepted
date: 2026-06-24
tags: [testing, architecture, domain, eslint, nx]
---

## Context

PRD §10.3 states: "Constraint: no imports from `@template/ui`, no imports from React. Only
pure TypeScript. Domain logic that needs database types imports types (not the client) from
`@template/db`."

The `eslint.config.mjs` implements `@nx/enforce-module-boundaries` with two constraints:

```js
{ sourceTag: 'scope:web',    onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'] },
{ sourceTag: 'scope:domain', onlyDependOnLibsWithTags: ['scope:shared'] },
```

However, no `package.json` file in the monorepo contains an `"nx": { "tags": [...] }` block.
The NX boundary constraints reference `scope:domain` and `scope:web` tags, but these tags are
never assigned to any project. NX will not enforce boundaries it cannot evaluate — packages
without tags are not subject to constraint rules.

Concretely: if code in `packages/domain/src/` imports from `react` or `@template/ui`, the
ESLint rule will not fire because `packages/domain` does not carry the `scope:domain` tag.
The boundary is specified but unenforced.

There is also no ESLint rule that explicitly forbids `@prisma/client` imports in the domain
package. The boundary rule prevents `@template/db` (since `scope:db` would not be in
`scope:shared`), but a direct `import { PrismaClient } from '@prisma/client'` bypasses the
package abstraction entirely and is not caught by any current rule.

## Decision

1. Every package and app in the monorepo must have an `"nx": { "tags": [...] }` block in its
   `package.json` assigning the correct `scope:*` tag before module boundary enforcement can
   be considered active:
   - `packages/domain` → `scope:domain`
   - `packages/config` → `scope:shared`
   - `packages/ui` → `scope:web` (or `scope:shared` if used across apps)
   - `packages/db` → `scope:shared` (types only exposed to domain)
   - `apps/web` → `scope:web`
   - `apps/web-e2e` → `scope:web`

2. A dedicated ESLint rule (`no-restricted-imports`) must be added to the domain package
   overlay to explicitly forbid `@prisma/client` direct imports, independent of the NX
   boundary tag system.

3. The `typecheck` CI job does not verify ESLint rules. The `lint` CI job must pass and be
   confirmed to pick up the domain scope boundary rule. A test for the boundary (an import
   attempt in a test file that should be rejected by lint) must exist to prove the constraint
   fires.

## Consequences

- Six `package.json` files require NX tag additions.
- Without the tags, `@nx/enforce-module-boundaries` is effectively disabled for all packages.
- This represents a silent architecture violation risk: the constraint is present in config but
  produces no enforcement signal.
