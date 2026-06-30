# E2E Smoke CI - v0 → v1

## Summary

Add a Playwright smoke test CI job that runs against the Vercel preview URL on every PR,
gated on the Vercel preview deployment completing. Blocks merge via `commit-validation`.

## Current State

- `apps/web-e2e/src/smoke.spec.ts` contains a full learning-loop test that requires a
  running database, authenticated session, and live application data.
- `apps/web-e2e/src/auth.ts` provides `loginWithMagicLink()` (requires DB connection).
- `apps/web-e2e/playwright.config.ts` reads `PLAYWRIGHT_BASE_URL`, defaulting to
  `http://localhost:3000`.
- `.github/workflows/1-commit.yml` has no e2e step; `commit-validation` aggregates 10 jobs.
- `.github/workflows/2-e2e.yml` runs the full e2e suite on `workflow_run` after merge to
  main, using `secrets.VERCEL_PREVIEW_URL` (a static secret, not per-PR).
- `scripts/ci/validate-aggregate.sh` fails if any `needs` job result is not `"success"`.
  A skipped job (result: `"skipped"`) would fail the aggregate under the current script.
- No Playwright browsers are installed in CI runners.
- `nx run web-e2e:e2e` resolves via `nx:run-script` to `npm run e2e` → `playwright test`.

## Proposed Changes

## ADDED Requirements

### Requirement: Login Page Smoke Test

SHALL have a Playwright spec `apps/web-e2e/src/login.smoke.spec.ts` that:
- Navigates to `/login`
- Asserts the email input field is visible (Auth.js Resend provider renders this)
- Does NOT attempt authentication (no DB access, no token exchange)
- Runs in under 30 seconds on CI

#### Scenario: Login page renders email field
WHEN the smoke test navigates to `/login`
THEN the page title is reachable (HTTP 200)
AND an email `<input>` is visible on the page

### Requirement: E2E Smoke CI Job

SHALL have a job `e2e-smoke` in `.github/workflows/1-commit.yml` that:
- Runs only on `pull_request` events (`if: github.event_name == 'pull_request'`)
- `needs: [build]` so it is gated on Phase 1 quality jobs passing
- Waits for the Vercel preview deployment by polling the GitHub Deployments API
  for an environment matching `"Preview"` on `github.sha` until state is `"success"`
- Extracts the `target_url` from the deployment status as `PLAYWRIGHT_BASE_URL`
- Installs Playwright with `npx playwright install --with-deps chromium`
- Runs `npx nx run web-e2e:e2e` with `PLAYWRIGHT_BASE_URL` set
- Requires `deployments: read` permission at the workflow level (already has `contents: read`)
- Uses `gh api` to poll deployment status (GITHUB_TOKEN available by default)

#### Scenario: PR opens, Vercel deploys, smoke passes
WHEN a pull_request event triggers the workflow
AND the Vercel preview deployment status reaches `"success"` on the PR's HEAD commit
THEN `e2e-smoke` extracts the preview URL and runs the login smoke test against it
AND the test passes, allowing `commit-validation` to succeed

#### Scenario: Job skipped on push to main
WHEN a `push` event triggers the workflow (not a pull_request)
THEN `e2e-smoke` is skipped
AND `commit-validation` treats the skip as acceptable

### Requirement: Aggregate Script Handles Skipped Jobs

SHALL update `scripts/ci/validate-aggregate.sh` so that a job result of `"skipped"`
is not treated as a failure. Only `"failure"`, `"cancelled"`, and `"timed_out"` fail
the aggregate. `"success"` and `"skipped"` both pass.

#### Scenario: e2e-smoke skipped on push to main
WHEN `e2e-smoke` has result `"skipped"` in NEEDS_JSON
THEN validate-aggregate.sh exits 0

#### Scenario: e2e-smoke fails on PR
WHEN `e2e-smoke` has result `"failure"` in NEEDS_JSON
THEN validate-aggregate.sh exits 1

## MODIFIED Requirements

### Requirement: commit-validation needs array

SHALL add `e2e-smoke` to `commit-validation`'s `needs:` array so the aggregate waits
for the smoke job to complete or skip before reporting its status.

#### Scenario: e2e-smoke added to aggregate needs
WHEN `commit-validation` evaluates
THEN it waits for `e2e-smoke` to reach a terminal state (success or skipped)
AND the aggregate exits based on the updated validate-aggregate.sh logic

### Requirement: Workflow-level deployments permission

SHALL add `deployments: read` to the top-level `permissions` block in `1-commit.yml`
so the `gh api` deployment polling can read deployment statuses.

## REMOVED Requirements

None.

## Backward Compatibility

YES. All existing CI jobs unchanged. The aggregate script change is additive:
`"skipped"` was previously rejected (it was never a valid state in the 10-job aggregate),
but adding it as acceptable is safe because `"skipped"` is not a failure state.

Pushes to `main` continue to work: `e2e-smoke` is skipped, aggregate treats skip as OK.

## Rollback Plan

1. Remove `e2e-smoke` from `commit-validation`'s `needs:` array
2. Delete the `e2e-smoke` job from `1-commit.yml`
3. Revert `validate-aggregate.sh` to previous version (reject skipped)
4. The `login.smoke.spec.ts` file can remain (it is not imported by unit tests)
