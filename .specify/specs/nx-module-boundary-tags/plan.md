# Technical Plan: Apply NX Module Boundary Tags (ADR 0017)

## Architecture Overview

This is a pure configuration change across three surfaces:
1. Six `package.json` files — add `"nx": { "tags": [...] }` block
2. `eslint.config.mjs` — add `no-restricted-imports` rule scoped to `packages/domain/**`
3. `docs/adr/0017-domain-package-boundary-enforcement.md` — update `status` frontmatter

No production code is modified. No new packages or files are introduced.

## File Change Plan

### 1. package.json tag additions

Each file receives a new top-level `"nx"` key:

| File | Tag |
|------|-----|
| `packages/domain/package.json` | `scope:domain` |
| `packages/config/package.json` | `scope:shared` |
| `packages/ui/package.json` | `scope:web` |
| `packages/db/package.json` | `scope:shared` |
| `apps/web/package.json` | `scope:web` |
| `apps/web-e2e/package.json` | `scope:web` |

Format (consistent across all files):
```json
"nx": {
  "tags": ["scope:<X>"]
}
```

### 2. eslint.config.mjs — no-restricted-imports rule

Add a new config object with a `files` glob scoping it to `packages/domain/**`:

```js
{
  files: ['packages/domain/**/*.ts', 'packages/domain/**/*.tsx'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@prisma/client', '@prisma/client/*'],
            message: 'Direct Prisma client imports are forbidden in packages/domain. Use @template/db types only.',
          },
        ],
      },
    ],
  },
},
```

This block is inserted after the existing `@nx/enforce-module-boundaries` block and before
the `ignores` block.

### 3. ADR 0017 frontmatter update

Change line 2 from:
```yaml
status: proposed
```
to:
```yaml
status: accepted
```

## Enforcement Proof Strategy

During the Tasks phase, one TDD task creates a probe file `packages/domain/src/_prisma-boundary.probe.ts`
containing:

```ts
import { PrismaClient } from '@prisma/client';
export { PrismaClient };
```

`npm run lint` must fail on this file (RED). The probe file is then deleted. `npm run lint`
must pass (GREEN). This is the acceptance criterion proof.

Note: `@prisma/client` is not in `packages/domain/node_modules`. The `no-restricted-imports`
rule fires on the import statement regardless of whether the package is installed — it is
a static AST check. If the linter needs the module resolvable, we test with a string literal
approach instead, but the ESLint `no-restricted-imports` rule does not require resolution.

## Constraint Compliance

- Constitution §Process-Non-Negotiables-1: ADR exists (ADR 0017) — satisfied.
- Constitution §Process-Non-Negotiables-2: spec written before implementation — this document.
- CLAUDE.md: no comments in code — the rule `message` field is a user-facing lint message, not a code comment.
- CLAUDE.md: TDD — lint failure is the "test". RED first, GREEN after applying the rule.

## Risk Assessment

**Risk**: NX `enforce-module-boundaries` requires `nx.json` or `project.json` to read tags,
not just `package.json`. If NX reads tags from `project.json` rather than `package.json`,
the tags will be silently ignored.

**Mitigation**: The issue description and ADR 0017 explicitly specify `package.json` as the
tag location. The NX flat config eslint plugin reads project configuration from `package.json`
`nx.tags` when no `project.json` exists. We verify this empirically by checking that adding
a bad cross-boundary import after tagging produces a lint error.

**Risk**: The `no-restricted-imports` rule may need `@prisma/client` to be installed in the
domain package for the rule to activate.

**Mitigation**: `no-restricted-imports` is a static string-match rule. It does not resolve
modules. Confirmed in ESLint documentation.
