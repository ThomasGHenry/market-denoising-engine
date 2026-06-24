# Tasks: Issue #8 — MDE Prisma Schema

## Phase 1: Schema

- [ ] Task 1: Write failing test — `prisma generate` fails with User-only schema (baseline confirmation)
- [ ] Task 2: Replace schema.prisma with 7 MDE models + 8 enums
- [ ] Task 3: Run `prisma generate` and verify it exits 0

## Phase 2: Seed

- [ ] Task 4: Write failing test — seed.ts fails to compile because PrismaClient has no `.user` (after schema change)
- [ ] Task 5: Replace seed.ts with Engineer-Seller Batch 001 seed
- [ ] Task 6: Verify `npm run typecheck` exits 0

## Phase 3: CI Gates

- [ ] Task 7: Run `bash scripts/ci/validate-adrs.sh docs/adr` and verify it exits 0
- [ ] Task 8: Commit schema, seed, and spec artifacts
