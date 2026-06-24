---
status: accepted
date: 2026-06-24
tags: [tooling, ci]
implementation: .github/workflows/1-commit.yml
---

# 0005. Phase 0 Gates Phase 1 Compute

## Context

CI pipelines commonly run all jobs in parallel: linting, tests, secret scanning, ADR
validation. When governance checks fail, developers wait for the full test suite before
seeing the governance error that should have been obvious in 15 seconds.

## Decision

`1-commit.yml` has two phases. Phase 0 (governance) runs all checks in parallel but
gates Phase 1 (compute). Phase 1 (typecheck, lint, test, build) only runs after all
Phase 0 jobs succeed. Governance failures surface in under 30 seconds.

Phase 0 jobs: gitleaks, actionlint, validate-adrs, validate-commits, shellcheck,
prisma-migrate-check (overlay-specific).

Phase 1 jobs: typecheck, lint, test, build.

## Consequences

Developers get fast feedback on governance violations. Expensive compute jobs do not
run when the commit is structurally invalid. On valid commits, total CI time increases
by the Phase 0 overhead (typically 15-30 seconds on a fast runner).
