# E2E Smoke CI - v1

## Current State

A Playwright smoke test job runs in CI on every pull request, gated on the Vercel
preview deployment completing. It blocks merge via `commit-validation`.

## Specifications

### Login Page Smoke Test

`apps/web-e2e/src/login.smoke.spec.ts` navigates to `/login` and asserts the email
input field is visible (Auth.js Resend provider). No authentication is attempted;
no database connection is required.

### E2E Smoke CI Job (`e2e-smoke`)

Defined in `.github/workflows/1-commit.yml`:

- Runs only on `pull_request` events
- `needs: [build]` — runs after Phase 1 quality gate
- Polls the GitHub Deployments API (environment: `"Preview"`, sha: `github.sha`)
  every 15s for up to 20 attempts (5 minutes) to find a `"success"` state
- Extracts `target_url` from the deployment status as `PLAYWRIGHT_BASE_URL`
- Installs Playwright chromium with system deps
- Runs `npx playwright test login.smoke` in `apps/web-e2e/`
- Uploads `playwright-report/` artifact on failure (7-day retention)
- Uses `deployments: read` workflow permission for GitHub API access
- On push to main: job is skipped (not a `pull_request` event)

### Aggregate Validator

`scripts/ci/validate-aggregate.sh` treats both `"success"` and `"skipped"` as
acceptable job results. `"failure"`, `"cancelled"`, and `"timed_out"` cause exit 1.

`commit-validation` includes `e2e-smoke` in its `needs:` array. On push to main,
`e2e-smoke` is skipped and the aggregate treats it as acceptable.

## Workflow-Level Permissions

`deployments: read` added to the top-level `permissions` block in `1-commit.yml`.
