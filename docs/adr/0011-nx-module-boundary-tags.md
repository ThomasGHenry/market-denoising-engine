---
status: proposed
date: 2026-06-24
tags: [tooling, architecture]
implementation: eslint.config.mjs
---

# 0011. NX Module Boundary Tags Must Be Declared on Every Project

## Context

`eslint.config.mjs` configures `@nx/enforce-module-boundaries` with two `depConstraints`:

- `sourceTag: 'scope:web'` — may only depend on `scope:web` or `scope:shared`
- `sourceTag: 'scope:domain'` — may only depend on `scope:shared`

These rules prevent `domain` from importing React or Prisma directly, and prevent `ui`
from leaking database concerns upward. However, `@nx/enforce-module-boundaries` enforces
constraints only on projects that carry the matching source tag. Projects with no tags
declared are effectively untagged and bypass all constraints.

No `project.json` files exist in `apps/web/`, `apps/web-e2e/`, `packages/db/`,
`packages/domain/`, `packages/ui/`, or `packages/config/`. None of the `package.json`
files contain an `nx.tags` property. As a result, all six projects are untagged. The ESLint
rule is configured but never evaluated for any project.

The intended PRD boundary (`domain` → no React, `ui` → no Prisma) is not enforced.

## Decision

Each project must declare its NX tags via an `nx` key in `package.json` (preferred in
npm-workspaces monorepos without `project.json`):

- `apps/web`: `{ "nx": { "tags": ["scope:web"] } }`
- `apps/web-e2e`: `{ "nx": { "tags": ["scope:web"] } }`
- `packages/domain`: `{ "nx": { "tags": ["scope:shared"] } }`
- `packages/ui`: `{ "nx": { "tags": ["scope:web", "scope:shared"] } }`
- `packages/config`: `{ "nx": { "tags": ["scope:shared"] } }`
- `packages/db`: `{ "nx": { "tags": ["scope:shared"] } }`

## Consequences

The `@nx/enforce-module-boundaries` rule becomes active. Any accidental React import in
`domain` or Prisma import in `ui` fails the ESLint step. Module boundaries are enforced
as architecture, not convention.
