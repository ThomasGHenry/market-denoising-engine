---
status: accepted
date: 2026-06-24
tags: [delivery, dora, observability]
implementation: .github/workflows/incident.yml, .github/workflows/3-promote.yml
---

# 0007. DORA Metrics Require Actual Instrumentation, Not Stubs

## Context

The PRD specifies DORA metric instrumentation across two workflows:

- `incident.yml`: records incident start (issue labeled `incident`) via
  `bobheadxi/deployments@v1` and computes MTTR on issue close.
- `3-promote.yml`: records deployment events via `bobheadxi/deployments@v1`
  to track Deployment Frequency and lead time.

As built, `incident.yml` contains a single job that echoes `github.event.issue.html_url`
and `github.event.issue.created_at` to stdout. It does not:
- record a GitHub Deployment event (no `bobheadxi/deployments@v1`)
- trigger on `closed` events (trigger is `types: [labeled]` only)
- compute MTTR
- write any queryable artifact

This means DORA Change Failure Rate and MTTR produce zero data.
`3-promote.yml` similarly records no deployment event, so Deployment Frequency
and Lead Time are also unmeasured.

A workflow that echoes to stdout and exits 0 is process theater: it passes CI,
satisfies the file-exists check, but generates no evidence and changes no decisions.

`bobheadxi/deployments@v1` is a maintained action (GitHub Deployments API is stable;
the action's last release is 2023 and functions correctly). It requires `deployments: write`
permission in the calling workflow's `permissions:` block. Without this permission,
`GITHUB_TOKEN` cannot create Deployment records and the step silently produces no data
or fails with a 403 depending on the repository's default permission setting.

## Decision

Both workflows must produce queryable GitHub Deployment records:

1. `incident.yml` must trigger on `types: [labeled, closed]` and require
   `deployments: write` in its `permissions:` block. Two jobs:

   - `record-incident-start`: fires `if: github.event.label.name == 'incident'`. Creates
     a deployment with `bobheadxi/deployments@v1` in environment `incident`,
     `state: in_progress`.
   - `record-incident-resolution`: fires `if: github.event.action == 'closed'` and the
     issue carries the `incident` label (check via `contains(github.event.issue.labels.*.name, 'incident')`).
     Marks the deployment as `state: inactive`. Computes open→close MTTR from
     `github.event.issue.created_at` to `github.event.issue.closed_at` and writes it to
     `$GITHUB_STEP_SUMMARY`.

2. `3-promote.yml` must add `deployments: write` to its `permissions:` block and create
   a GitHub Deployment record (environment: `production`) via `bobheadxi/deployments@v1`
   with `state: success` on promotion completion or `state: failure` on any prior step
   failure. This makes Deployment Frequency queryable via the GitHub Deployments API
   without external tooling.

3. Lead time is computed in `3-promote.yml` immediately before promotion:
   ```bash
   FIRST_COMMIT=$(git log origin/main~1..HEAD --pretty=format:"%ci" | tail -1)
   DEPLOY_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
   echo "lead_time_first_commit=$FIRST_COMMIT" >> "$GITHUB_STEP_SUMMARY"
   echo "lead_time_deploy=$DEPLOY_TIME" >> "$GITHUB_STEP_SUMMARY"
   ```
   The step summary is the queryable artifact. No external storage required.

All DORA data lives in GitHub and is queryable via `gh api` or the Deployments REST API:
```bash
gh api repos/{owner}/{repo}/deployments --jq '.[].created_at'
```

## Consequences

Deployment Frequency, CFR, and MTTR become measurable from day one without external
DORA tooling. The data quality depends on incident issues being labeled consistently
with the `incident` label defined in the label taxonomy (§9.4).

The MTTR computation is approximate: it measures GitHub issue open time, not alert
time or customer-impact start time. This is acceptable for a governance baseline.
The approximation must be documented in `docs/runbooks/dora-metrics.md` so future
maintainers understand the measurement boundaries.

Missing `deployments: write` is a silent failure mode: the action runs without error
but creates no record. Add a validation step to `incident.yml` and `3-promote.yml`
that asserts the deployment record was created (`gh api` lookup by environment name)
as a post-deployment guard.
