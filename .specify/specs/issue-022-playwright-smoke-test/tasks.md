# Tasks: Playwright Smoke Test — Full Learning Loop Critical Path

**Issue:** #22
**Spec:** `.specify/specs/issue-022-playwright-smoke-test/spec.md`
**File to create:** `apps/web-e2e/src/smoke.spec.ts` (replaces existing scaffold)

TDD order: infrastructure → failing test skeleton → each step green → refactor.

---

## Phase 1: Infrastructure

- [ ] **Task 1.1** — Verify the Playwright runner resolves
  Read `apps/web-e2e/playwright.config.ts` and `apps/web-e2e/package.json`.
  Confirm `testDir` is `./src`, `baseURL` reads from `PLAYWRIGHT_BASE_URL`, and
  `@playwright/test` is listed in `devDependencies`.
  No file changes. This task is done when you can recite the exact config values
  from the files.

- [ ] **Task 1.2** — Confirm NX target wires to Playwright
  Read `apps/web-e2e/project.json`.
  Confirm the `e2e` target (or script) invokes `playwright test`.
  No file changes.

- [ ] **Task 1.3** — Confirm CI workflow references the correct target
  Read `.github/workflows/2-e2e.yml`.
  Confirm `npx nx run web-e2e:e2e` is the run command and
  `PLAYWRIGHT_BASE_URL` is supplied from secrets.
  No file changes. Surface any gap (e.g., missing secret name) as a finding before
  proceeding.

---

## Phase 2: RED — Write the failing test

- [ ] **Task 2.1** — Write the minimal failing smoke test skeleton
  Replace `apps/web-e2e/src/smoke.spec.ts` with a file containing one `test` block
  named `'full learning loop: create generation → probe → post → metrics → fitness'`.
  The test body calls `page.goto('/generations/new')` and immediately asserts
  `expect(page).toHaveURL(/generations\/new/)`.
  The remaining steps are `todo` stubs (empty lines with descriptive variable names
  that will cause type errors when the file is run — no `test.todo()`; leave them as
  unreachable placeholder comments removed in a later task).

  Run: `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx nx run web-e2e:e2e`
  Expected result: test **fails** because the app is not running locally, OR passes
  the single assertion if the app is running. Either outcome confirms Playwright
  executes the file. The critical check is that the old scaffold tests (`home page
  has correct title`, `home page heading is visible`) are gone.

- [ ] **Task 2.2** — Add the create-generation step and see it fail
  In the same test block, after `page.goto('/generations/new')`:
  1. `page.fill('#title', ...)` — unique title string
  2. `page.fill('#theme', ...)` — any non-empty string
  3. `page.click('button[type="submit"]')`
  4. `page.waitForURL('**/generations')`
  5. `page.getByRole('link', { name: <the title> }).click()`
  6. `page.waitForURL('**/generations/**')`
  7. Capture the URL to extract `generationId`.

  Run the test against a running app.
  Expected: step 4 fails if `createGeneration` server action is broken or redirect
  is wrong. If the app is healthy this step passes — move on.

- [ ] **Task 2.3** — Add the create-probe step and see it fail
  After capturing `generationId`, navigate to `/probes/new?generationId=<id>`:
  1. `page.goto('/probes/new?generationId=' + generationId)`
  2. `page.fill('#title', ...)` — unique probe title
  3. `page.fill('#rawInput', ...)` — any non-empty content string
  4. `page.click('button[type="submit"]')`
  5. `page.waitForURL('**/generations/' + generationId)`
  6. Find the probe title link in the generation detail table and click it.
  7. `page.waitForURL('**/probes/**')`
  8. Capture the URL to extract `probeId`.

  Run against the app. Expected: green if the probe creation path is working.

- [ ] **Task 2.4** — Add the record-platform-post step and see it fail
  After capturing `probeId`, on `/probes/<probeId>`:
  1. Locate the Platform Posts section by `page.getByRole('heading', { name: 'Platform Posts' })`.
  2. `page.selectOption('#platform', 'LINKEDIN')`
  3. `page.fill('#url', 'https://www.linkedin.com/posts/smoke-test')`
  4. `page.fill('#publishedAt', '2025-01-01T12:00')` — ISO datetime-local format
  5. `page.click('button:has-text("Record Post")')`
  6. `page.waitForURL('**/probes/' + probeId)`
  7. Find the platform post link in `PlatformPostList` and extract the post id from its href.

  Run against the app. Expected: green if `createPlatformPost` action and redirect work.

- [ ] **Task 2.5** — Add the enter-metric-snapshot step and see it fail
  Navigate to `/platform-posts/<postId>`:
  1. `page.goto('/platform-posts/' + postId)`
  2. `page.getByLabel('Captured At').fill('2025-01-02T12:00')`
  3. `page.getByLabel('Likes').fill('5')`
  4. `page.click('button:has-text("Add Snapshot")')`
  5. `page.waitForURL('**/platform-posts/' + postId)`

  Run against the app. Expected: green if `createMetricSnapshot` action redirects correctly.

- [ ] **Task 2.6** — Add the fitness assertion and see it fail initially
  Navigate back to `/generations/<generationId>`:
  1. `page.goto('/generations/' + generationId)`
  2. Locate the probes table `<tbody>`.
  3. Find the row containing the probe title text.
  4. Read the text content of the fourth cell (`td:nth-child(4)`) in that row.
  5. `expect(parseFloat(fitnessText)).toBeGreaterThan(0)`

  Run against the app with no metrics entered yet (to observe the failing assertion).
  Then re-run after Task 2.5 data is present. Expected: `5.00` (5 likes × weight 1).

---

## Phase 3: GREEN — Full test passing

- [ ] **Task 3.1** — Wire all six steps into one contiguous test block
  Ensure the full sequence (2.2 → 2.6) runs in a single `test()` with no skipped steps.
  Run the complete test against a running app with a fresh/empty database state.
  Expected: all assertions pass, test exits green.

---

## Phase 4: REFACTOR

- [ ] **Task 4.1** — Extract named helper functions
  Move repeated selector patterns and URL extraction logic into named functions at the
  top of the file (below the `import` statement, above the `test` block):
  - `extractIdFromUrl(url: string): string` — parses the last path segment
  - `fillDatetimeLocal(page: Page, label: string, value: string): Promise<void>` — if reused
  No change to test observable behaviour. Re-run and confirm green.

- [ ] **Task 4.2** — Remove any placeholder comments or dead code introduced during RED phase
  The file must contain no comments. Run lint: `npx nx run web:lint` (or equivalent).
  Re-run Playwright and confirm green.

- [ ] **Task 4.3** — Confirm tsconfig includes the file
  `apps/web-e2e/tsconfig.json` already includes `src/**/*`. Verify with a typecheck run:
  `npx nx run web-e2e:typecheck` (if the target exists) or `tsc --noEmit --project apps/web-e2e/tsconfig.json`.
  Expected: zero type errors.

---

## Phase 5: CI wiring verification

- [ ] **Task 5.1** — Confirm `2-e2e.yml` needs no changes
  The workflow already runs `npx nx run web-e2e:e2e`. The new test file lives in
  `apps/web-e2e/src/` which is the configured `testDir`. No workflow edits required.
  Document this as a verified no-op.

- [ ] **Task 5.2** — Confirm `VERCEL_PREVIEW_URL` secret is in scope
  Check the GitHub repo's `preview` environment secrets for `VERCEL_PREVIEW_URL`.
  If absent, file a note (not a blocker for this issue): the test will pass locally and
  will be skipped/error in CI until the secret is configured.

---

## Acceptance Checklist

- [ ] `apps/web-e2e/src/smoke.spec.ts` exists and contains exactly one `test` block
- [ ] The two template scaffold tests are removed
- [ ] Test covers all five steps: create-generation → create-probe → record-post → enter-metrics → verify fitness > 0
- [ ] No comments in the file
- [ ] No inline arrow functions used as callbacks
- [ ] TypeScript; no type errors
- [ ] `npx nx run web-e2e:e2e` passes against a running app with a seeded/empty DB
- [ ] CI workflow unchanged (no edits to `2-e2e.yml`)
