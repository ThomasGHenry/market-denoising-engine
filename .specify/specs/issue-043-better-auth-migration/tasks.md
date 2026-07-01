# Tasks: Better Auth Migration

TDD order: test (RED) → implement (GREEN) → refactor → commit.

---

## Phase 1 — Package swap + schema

- [x] Task 1: Install `better-auth` and `resend`; remove `next-auth` and `@auth/prisma-adapter` from `apps/web/package.json`
- [x] Task 2: Run `npm install` to update lockfile
- [x] Task 3: Replace Auth.js Prisma models with Better Auth schema in `packages/db/prisma/schema.prisma`
- [x] Task 4: Run `npx prisma migrate dev --name better-auth-migration --config packages/db/prisma.config.ts`
- [x] Task 5: Run `npx prisma generate --config packages/db/prisma.config.ts`

## Phase 2 — Server auth instance (TDD)

- [ ] Task 6: Write failing test in `auth.test.ts` — remove Next Auth mocks, test `isAllowedEmail` behavior only
  - RED: test imports `isAllowedEmail` from `./auth` — will fail because `auth.ts` still imports `next-auth`
- [ ] Task 7: Rewrite `auth.ts` as Better Auth instance (GREEN for task 6 tests)
- [ ] Task 8: Create `auth-client.ts` (browser-side Better Auth client)
- [ ] Task 9: Delete `apps/web/src/lib/auth.config.ts`
- [ ] Task 10: Verify `auth.test.ts` passes; commit

## Phase 3 — Route handler (TDD)

- [ ] Task 11: Write failing test that `route.ts` exports GET and POST (if test exists, verify it fails with new import)
- [ ] Task 12: Rewrite `apps/web/src/app/api/auth/[...all]/route.ts` using `toNextJsHandler`
- [ ] Task 13: Verify route handler tests pass; commit

## Phase 4 — Middleware (TDD)

- [ ] Task 14: Update `middleware.test.ts` — remove `next-auth` and `auth.config` mocks; add test that middleware redirects unauthenticated requests
  - RED: existing tests reference mocks that no longer apply
- [ ] Task 15: Rewrite `middleware.ts` using `getSessionCookie` from `better-auth/cookies`
- [ ] Task 16: Verify middleware tests pass; commit

## Phase 5 — Login page (TDD)

- [ ] Task 17: Write failing test for login page renders email form (if test exists, update mocks)
- [ ] Task 18: Rewrite `apps/web/src/app/login/page.tsx` using Better Auth server actions
- [ ] Task 19: Verify login page tests pass; commit

## Phase 6 — E2E helper (TDD)

- [ ] Task 20: Write failing test for `loginWithMagicLink` in `apps/web-e2e/src/auth.test.ts` (new file)
  - Test: function accepts Page and email string, calls POST to sign-in endpoint, queries verification table
  - RED: helper still imports old `verificationToken` model
- [ ] Task 21: Rewrite `apps/web-e2e/src/auth.ts` with sentinel-based verification approach
- [ ] Task 22: Verify E2E helper tests pass; commit

## Phase 7 — Integration check

- [ ] Task 23: Run `npm run typecheck` — zero errors
- [ ] Task 24: Run `npm run test` — all tests pass
- [ ] Task 25: Run `npm run lint` — zero errors
- [ ] Task 26: Verify no references to `auth.config` remain: `rg 'auth.config' apps/`
- [ ] Task 27: Verify no references to `next-auth` remain: `rg 'next-auth' apps/web/src/`
- [ ] Task 28: Verify no `DATABASE_URL_UNPOOLED` in runtime code: `rg 'DATABASE_URL_UNPOOLED' apps/web/src/`
- [ ] Task 29: Commit all remaining changes; push branch
