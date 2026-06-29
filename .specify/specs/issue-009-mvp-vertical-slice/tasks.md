# Tasks: Issue #9 — MVP Vertical Slice (Dashboard + Home Redirect)

TDD order: red → green → refactor. Each test task must fail before its paired implementation task begins. Commit after each green.

---

## Phase 1 — Home Redirect

- [x] **T1-red** Write a test that imports `apps/web/src/app/page.tsx` and asserts the module's default export calls `redirect('/dashboard')`. The test must fail (module currently renders JSX, not a redirect).
- [x] **T1-green** Replace `apps/web/src/app/page.tsx` with `import { redirect } from 'next/navigation'; export default function HomePage() { redirect('/dashboard') }`. Run test — must pass.
- [x] **T1-refactor** Confirm no dead imports remain. Re-run test.
- [x] **T1-commit** `git commit -m "feat: redirect / to /dashboard (#9)"`

---

## Phase 2 — `loadDashboardData` helper (unit-testable, no page rendering)

- [x] **T2-red-active-generation** Write a test for `loadDashboardData` that, given a seeded DB with one ACTIVE generation, returns it as `activeGeneration`. Import the function — it does not exist yet. Test must fail (module not found).
- [x] **T2-green-scaffold** Create `apps/web/src/app/dashboard/loadDashboardData.ts` with `export async function loadDashboardData()` returning a stub object with the correct shape. Test must pass.
- [x] **T2-red-active-fallback** Add a test case: when no ACTIVE generation exists, `activeGeneration` is the most recent generation by `createdAt`. Run — fails (stub returns null).
- [x] **T2-green-active-query** Implement the two-step active generation query (ACTIVE first, fallback to latest). Run both cases — must pass.
- [x] **T2-red-fitness** Add a test case: when an active generation exists with probes having snapshots, `fitnessRanking` is a non-empty array sorted by `rawScore` descending. Run — fails (stub returns []).
- [x] **T2-green-fitness** Wire `computeProbesFitness(activeGeneration.id)` into `loadDashboardData`. Run — must pass.
- [x] **T2-red-mutations** Add a test case: `openMutations` contains only OPEN mutations, with `sourceProbe.title` populated. Run — fails.
- [x] **T2-green-mutations** Implement `prisma.mutation.findMany({ where: { status: 'OPEN' }, include: { sourceProbe: { select: { id: true, title: true } } } })`. Run — must pass.
- [x] **T2-red-needs-metrics** Add a test case: a PUBLISHED probe with zero platform posts appears in `needsMetricsCapture`; a PUBLISHED probe with a post that has snapshots does not appear. Run — fails.
- [x] **T2-green-needs-metrics** Implement the needs-metrics Prisma query using `where: { status: 'PUBLISHED', OR: [{ platformPosts: { none: {} } }, { platformPosts: { some: { snapshots: { none: {} } } } }] }`. Run — must pass.
- [x] **T2-red-needs-review** Add a test case: a PUBLISHED probe with zero signal reviews appears in `needsReview`; one with a review does not. Run — fails.
- [x] **T2-green-needs-review** Implement `prisma.probe.findMany({ where: { status: 'PUBLISHED', reviews: { none: {} } } })`. Run — must pass.
- [x] **T2-red-parallel** Add a test that confirms the four non-fitness queries are issued concurrently (use `Promise.all` spy or timing assertion). Run — fails if not parallel.
- [x] **T2-green-parallel** Restructure `loadDashboardData` to run the active generation query first, then `Promise.all([computeProbesFitness(...), mutationsQuery, needsMetricsQuery, needsReviewQuery])`. Run — must pass.
- [x] **T2-refactor** Extract query builders into named functions (`fetchActiveGeneration`, `fetchOpenMutations`, `fetchNeedsMetricsCapture`, `fetchNeedsReview`). Re-run all cases.
- [x] **T2-commit** `git commit -m "feat: add loadDashboardData helper (#9)"`

---

## Phase 3 — Dashboard page component

- [x] **T3-red-page-exists** Write a render test for `apps/web/src/app/dashboard/page.tsx` that asserts the component renders without throwing. Import fails — file does not exist. Test must fail.
- [x] **T3-green-scaffold** Create `apps/web/src/app/dashboard/page.tsx` as a minimal async server component stub that renders `<div>dashboard</div>`. Test must pass.
- [x] **T3-red-card-active** Add a render test asserting a heading or label matching "Active Generation" is present in the output. Run — fails (stub has no cards).
- [x] **T3-green-card-active** Add the Active Generation section to the page, calling `loadDashboardData` (mock it in tests) and rendering `activeGeneration.title` or an empty-state message. Run — must pass.
- [x] **T3-red-card-fitness** Add a render test asserting a "Population Fitness Ranking" label is present. Run — fails.
- [x] **T3-green-card-fitness** Add the Population Fitness Ranking section. Run — must pass.
- [x] **T3-red-card-mutations** Add a render test asserting an "Open Mutations" label and the mutation count are present. Run — fails.
- [x] **T3-green-card-mutations** Add the Open Mutations section. Run — must pass.
- [x] **T3-red-card-metrics** Add a render test asserting a "Needs Metrics Capture" label is present. Run — fails.
- [x] **T3-green-card-metrics** Add the Needs Metrics Capture section. Run — must pass.
- [x] **T3-red-card-review** Add a render test asserting a "Needs Review" label is present. Run — fails.
- [x] **T3-green-card-review** Add the Needs Review section. Run — must pass.
- [x] **T3-red-dynamic** Add a test that asserts the page module exports `dynamic` equal to `'force-dynamic'`. Run — fails.
- [x] **T3-green-dynamic** Add `export const dynamic = 'force-dynamic'` to the page file. Run — must pass.
- [x] **T3-refactor** Extract each card into a named function or component (`ActiveGenerationCard`, `FitnessRankingCard`, etc.) inside the same file. Re-run all render tests.
- [x] **T3-commit** `git commit -m "feat: add /dashboard page with 5 learning-state cards (#9)"`

---

## Phase 4 — Typecheck and lint gate

- [x] **T4-typecheck** Run `npx nx run web:typecheck` — must pass with zero errors.
- [x] **T4-lint** Run `npx nx run web:lint` — must pass with zero errors.
- [x] **T4-test-all** Run `npx nx run web:test` — all tests must pass, zero failures.
- [x] **T4-commit** `git commit -m "chore: typecheck and lint clean for dashboard (#9)"` (only if changes were needed)
