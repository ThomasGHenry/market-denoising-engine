---
status: accepted
date: 2026-06-24
tags: [tooling, ci]
implementation: .github/workflows/1-commit.yml
---

# 0002. Aggregate Validator as Sole Required Status Check

## Context

GitHub branch protection can require individual CI jobs as status checks. As the number
of jobs grows, maintaining the branch protection list becomes operational overhead. Adding
a job requires touching both the workflow and the branch protection settings.

## Decision

A single job named `commit-validation` with `if: always()` aggregates all other job
results. It reads `$NEEDS_JSON` (the `needs` context serialized to JSON) and fails if any
required job did not succeed. This is the only entry in the branch protection required
status checks list.

## Consequences

Adding a new validation job requires only: adding it to `1-commit.yml` and adding it to
the `commit-validation` job's `needs:` array. Branch protection settings do not change.
Removing a job requires only editing the workflow. No drift between CI and branch
protection configuration.
