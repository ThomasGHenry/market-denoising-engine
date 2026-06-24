---
status: proposed
date: 2026-06-24
tags: [quality, ci, governance]
---

## Context

`PRD §6 Non-Negotiable #3` states: "Phase 0 jobs (gitleaks, ADR, commits, actionlint,
shellcheck, `prisma-migrate-check`) must all pass before typecheck/lint/test/build run."

The implemented `1-commit.yml` workflow is missing the `prisma-migrate-check` job
entirely. Phase 1 jobs (`typecheck`, `lint`, `test`, `build`) declare `needs:
[gitleaks, actionlint, validate-adrs, validate-commits, shellcheck]` — five jobs, not six.
The `commit-validation` aggregate job's `needs:` array also excludes `prisma-migrate-check`.

Consequences of the omission:
1. A broken Prisma migration can reach Phase 1 build jobs, wasting compute time
2. The `commit-validation` aggregate job does not fail when the DB schema is invalid
3. The template does not match its own specification

The PRD specifies the `prisma-migrate-check` job in detail at §11.1 (lines 1358-1373 of
the PRD): it runs a `postgres:17-alpine` service container, runs `npm ci --ignore-scripts`,
`prisma generate`, and `prisma migrate deploy` against a local test database.

## Decision

Add a `prisma-migrate-check` job to `1-commit.yml` as a Phase 0 job:
- `needs:` none (runs parallel with other Phase 0 jobs)
- Service: `postgres:17-alpine` with health check
- Steps: checkout, setup-node@v4, `npm ci --ignore-scripts`, `prisma generate`, `prisma migrate deploy`
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/test_db`

Update all Phase 1 job `needs:` arrays to include `prisma-migrate-check`.

Update `commit-validation`'s `needs:` array to include `prisma-migrate-check`.

## Consequences

- Phase 0 matches the PRD specification
- Migration failures block compute jobs (correct behavior per §4.4)
- CI runtime increases by the duration of `prisma migrate deploy` on a fresh schema
  (typically 5-15 seconds for the stub schema)
- The `ubuntu-latest` runner used in the current `1-commit.yml` should be changed to
  `ubuntu-24.04` to match the pinned runner specified in the PRD
