---
status: proposed
date: 2026-06-24
tags: [ci, testing, governance]
---

## Context

PRD §11.1 specifies the complete `1-commit.yml` workflow. The committed file at
`.github/workflows/1-commit.yml` diverges from the spec in multiple ways:

**Trigger scope — PRD specifies:**
```yaml
on:
  push:
    branches: ['**']
  pull_request:
```
(all branches, not filtered)

**Committed file has:**
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```
(main-only — feature branch pushes receive no CI)

**Missing Phase 0 job — PRD §11.1 specifies a `prisma-migrate-check` job** that runs Prisma
schema validation against a Postgres service container. This job is listed in the PRD as a
Phase 0 governance check that must pass before Phase 1 compute jobs begin. The committed
workflow has no such job. The `commit-validation` aggregate job in the committed file also
does not include `prisma-migrate-check` in its `needs:` array.

**Runner version — PRD specifies `ubuntu-24.04`. Committed file uses `ubuntu-latest`.**
`ubuntu-latest` maps to a moving target; `ubuntu-24.04` is pinned. This is a reproducibility
gap.

**Phase 0 job count discrepancy:**
- PRD Phase 0: `gitleaks`, `actionlint`, `validate-adrs`, `validate-commits`, `shellcheck`,
  `prisma-migrate-check` (6 jobs)
- Committed Phase 0: `gitleaks`, `actionlint`, `validate-adrs`, `validate-commits`,
  `shellcheck` (5 jobs, `prisma-migrate-check` absent)

**`nx.json` linting input reference mismatch:**
- PRD §10.1 specifies: `"inputs": ["default", "{workspaceRoot}/.eslintrc.json"]`
- Committed `nx.json` has: `"inputs": ["default", "{workspaceRoot}/eslint.config.mjs"]`
  (this is actually correct for flat ESLint config, but diverges from the literal PRD text —
  the PRD text is stale; the committed value is correct)

## Decision

1. The trigger in `1-commit.yml` must be updated to fire on `push: branches: ['**']` per
   PRD §4.4 and §11.1. Restricting to `main` means feature branch work receives no governance
   gate before a PR is opened.

2. The `prisma-migrate-check` job must be added to Phase 0 with a Postgres service container
   as specified in PRD §11.1.

3. All runner references must be changed from `ubuntu-latest` to `ubuntu-24.04`.

4. The `commit-validation` aggregate job's `needs:` array must be updated to include
   `prisma-migrate-check` when that job is added.

5. The `nx.json` lint input reference (`eslint.config.mjs` vs `.eslintrc.json`) is a PRD
   text error, not an implementation error. The committed value is correct. No change needed.

## Consequences

- Until the trigger is fixed, pushes to non-main branches (e.g., feature branches in a
  multi-developer context) bypass all CI governance.
- Until `prisma-migrate-check` is added, a broken Prisma schema can merge to main.
- These are template defects: every project instantiated from this template inherits them.
