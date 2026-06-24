---
status: accepted
date: 2026-06-24
tags: [delivery, ci, deployment]
implementation: .github/workflows/2-e2e.yml, .github/workflows/3-promote.yml
---

# 0006. Deploy Chain Must Be Strictly Sequential via workflow_run

## Context

The intended deploy topology is: `1-commit` → `2-e2e` → `3-promote`. Each stage gates
the next. A push to main should not reach production until commit validation and E2E
tests have both passed.

As built, `3-promote.yml` triggers on `push: branches: [main]` directly — the same
trigger as `1-commit.yml`. Both workflows start simultaneously on every push to main.
`3-promote.yml` runs production build and Vercel promotion before `2-e2e.yml` has
completed (or even started). E2E results have zero influence on whether production is
promoted.

`2-e2e.yml` triggers on `deployment_status` rather than `workflow_run`. This event fires
on any Vercel deployment event — including deployments to preview environments triggered
by PRs — not specifically after commit validation passes on main. The `PLAYWRIGHT_BASE_URL`
is a static secret rather than the dynamic URL from the deployment event, meaning E2E
runs against a potentially stale preview rather than the URL that was just deployed.

The PRD spec for `3-promote.yml` (§10.6) contains a duplicate `if:` key on the `migrate`
job — a YAML defect where only the last `if:` key is parsed, silently dropping the
`workflow_run` conclusion check. The correct implementation uses a single `if:` expression
that covers both trigger paths.

## Decision

The deploy chain uses `workflow_run` chaining to enforce sequential gating:

- `2-e2e.yml` triggers on:
  ```yaml
  on:
    workflow_run:
      workflows: ["Commit Validation"]
      types: [completed]
      branches: [main]
    workflow_dispatch:
  ```
  The `e2e` job guard: `if: github.event.workflow_run.conclusion == 'success' || github.event_name == 'workflow_dispatch'`

- `3-promote.yml` triggers on:
  ```yaml
  on:
    workflow_run:
      workflows: ["E2E"]
      types: [completed]
      branches: [main]
    workflow_dispatch:
      inputs:
        confirm:
          description: 'Type "promote" to confirm production promotion'
          required: true
          type: string
  ```

- `3-promote.yml` must NOT trigger on `push: branches: [main]`.

- The `migrate` job in `3-promote.yml` uses a single `if:` key combining both trigger paths:
  ```yaml
  migrate:
    if: |
      (github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success') ||
      (github.event_name == 'workflow_dispatch' && inputs.confirm == 'promote')
    needs: [validate-input]
  ```
  The `validate-input` job runs only on `workflow_dispatch` events (guarded by
  `if: github.event_name == 'workflow_dispatch'`). The `migrate` job lists it in `needs:`
  so that on `workflow_dispatch` the confirmation is validated before migration runs. On
  `workflow_run` events, `validate-input` is skipped; `migrate` proceeds because GitHub
  treats a skipped `needs` dependency as satisfied when the dependent job's own `if:`
  condition permits it.

- `PLAYWRIGHT_BASE_URL` in `2-e2e.yml` is `${{ secrets.VERCEL_PREVIEW_URL }}`. This is
  a stable secret (the Vercel alias for the project, not a per-deployment URL). It is
  acceptable because Vercel auto-deploys each push to main before `1-commit.yml` completes,
  so the preview alias resolves to the current SHA's build by the time E2E runs.

## Consequences

Every production promotion is downstream of a passing E2E run, which is itself downstream
of a passing commit validation. The chain is auditable: each `workflow_run` event links to
the parent run that triggered it, visible in the GitHub Actions run history.

Known limitation: `workflow_run` executes in the context of the default branch's workflow
definitions, not the triggering SHA's definitions. This means a change to `2-e2e.yml` or
`3-promote.yml` takes effect on the next push after it merges, not on the push that
introduced it. The mitigation is that `actionlint` in Phase 0 of `1-commit.yml` validates
workflow YAML on every push, catching defects before they reach the default branch.

Artifact upload on E2E failure (Playwright report, `retention-days: 7`) ensures failures
are diagnosable without re-running. This is required — not optional.
