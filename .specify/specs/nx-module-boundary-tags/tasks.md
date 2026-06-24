# Tasks: Apply NX Module Boundary Tags (ADR 0017)

## Phase 1: Prove enforcement is inactive (RED baseline)

- [x] Task 1: Create probe file `packages/domain/src/_prisma-boundary.probe.ts` importing
  `@prisma/client` — this file exists before the rule is added.
- [x] Task 2: Run `npm run lint` — must PASS (no rule fires yet). Confirm baseline.

## Phase 2: Add no-restricted-imports rule (RED → GREEN)

- [x] Task 3: Add `no-restricted-imports` rule to `eslint.config.mjs` scoped to
  `packages/domain/**/*.ts`.
- [x] Task 4: Run `npm run lint` — must FAIL on the probe file (RED — rule fires).
- [x] Task 5: Delete probe file `packages/domain/src/_prisma-boundary.probe.ts`.
- [x] Task 6: Run `npm run lint` — must PASS (GREEN — rule fires only when violation exists).

## Phase 3: Add NX tags to all package.json files

- [x] Task 7: Add `"nx": { "tags": ["scope:domain"] }` to `packages/domain/package.json`.
- [x] Task 8: Add `"nx": { "tags": ["scope:shared"] }` to `packages/config/package.json`.
- [x] Task 9: Add `"nx": { "tags": ["scope:web"] }` to `packages/ui/package.json`.
- [x] Task 10: Add `"nx": { "tags": ["scope:shared"] }` to `packages/db/package.json`.
- [x] Task 11: Add `"nx": { "tags": ["scope:web"] }` to `apps/web/package.json`.
- [x] Task 12: Add `"nx": { "tags": ["scope:web"] }` to `apps/web-e2e/package.json`.
- [x] Task 13: Run `npm run lint` — must still PASS (all 6 tags applied, no violations).

## Phase 4: Update ADR and commit

- [x] Task 14: Update `docs/adr/0017-domain-package-boundary-enforcement.md` frontmatter
  `status: proposed` → `status: accepted`.
- [x] Task 15: Run `bash scripts/ci/validate-adrs.sh docs/adr` — must pass.
- [x] Task 16: Run `npm run lint` — final clean pass.
- [x] Task 17: Commit all changes with message:
  `fix: apply NX module boundary tags and no-restricted-imports (ADR 0017)`
