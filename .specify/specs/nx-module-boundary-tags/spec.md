# Spec: Apply NX Module Boundary Tags (ADR 0017)

## Feature Reference
GitHub Issue #1 — fix: apply NX module boundary tags (ADR 0017)

## Problem Statement

The monorepo has NX module boundary constraints configured in `eslint.config.mjs`
(`@nx/enforce-module-boundaries` with three scope tags), but no `package.json` carries
any `"nx": { "tags": [...] }` block. The constraints are present but silently unenforced.
A direct `import from '@prisma/client'` in `packages/domain` would not be caught.

## User Stories

**As a domain package author,** I want the linter to reject a `@prisma/client` import
inside `packages/domain/src/` so that I receive immediate feedback if I accidentally
introduce a direct ORM dependency into pure domain logic.

**As a CI maintainer,** I want `npm run lint` to fail on any boundary violation in any
package so that boundary enforcement is proven and not merely configured.

**As a reviewer,** I want ADR 0017 status to be `accepted` so that the decision is
reflected as implemented rather than proposed.

## Scope

### In Scope

- Add `"nx": { "tags": [...] }` to all 6 `package.json` files in the monorepo.
- Add a `no-restricted-imports` ESLint rule that blocks `@prisma/client` inside
  `packages/domain`.
- Update ADR 0017 `status` from `proposed` to `accepted`.
- Prove enforcement is live via a lint-failing test file (verified, then removed or
  converted to a lint-negative-test pattern).

### Out of Scope

- Adding NX project.json files (not used in this monorepo).
- Modifying CI workflow files — Phase 0 already lints ADR structure; no changes needed.
- Adding new boundary constraint rules beyond what ADR 0017 specifies.

## Success Criteria

1. `npm run lint` passes with the tags applied and the `no-restricted-imports` rule present.
2. A file in `packages/domain/src/` importing `@prisma/client` causes `npm run lint` to
   fail (proven empirically during implementation, not assumed).
3. ADR 0017 frontmatter `status: proposed` updated to `status: accepted`.
4. No regressions — all existing tests and lint checks continue to pass.

## Business Rules

- Tags must match the mapping in ADR 0017 §Decision-1 exactly.
- `packages/domain` is the only package that requires a `no-restricted-imports` rule,
  because it is the only package whose purity invariant is not captured by existing
  boundary tags alone.
- The ESLint rule must be scoped to `packages/domain/**` only — it must not apply globally.
