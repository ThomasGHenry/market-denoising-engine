---
status: proposed
date: 2026-06-24
tags: [tooling, ci]
implementation: .github/workflows/1-commit.yml
---

# 0013. CI Must Use `npm ci --ignore-scripts` and Pass Explicit Env Vars to Shell Scripts

## Context

Two related CI hygiene conventions from the PRD are missing from the scaffold.

**Convention 1: `npm ci --ignore-scripts`**

PRD §18 evidence table documents: "`npm ci --ignore-scripts` in CI — buen-vecino — All
CI jobs". The `--ignore-scripts` flag prevents `postinstall` (which installs git hooks
via `setup-hooks.sh`) from running in CI. Without this flag, CI attempts to install
pre-commit hooks, which fails on a runner where pre-commit is not installed. The hook
setup uses `|| true` to suppress this failure, but the extraneous process still runs,
adds noise to logs, and may fail with a non-zero exit code in environments where the
suppression is not reliable.

All four Phase 1 jobs in `1-commit.yml` use bare `npm ci` without `--ignore-scripts`.

**Convention 2: Explicit env vars for `validate-commits.sh`**

`validate-commits.sh` reads `$GITHUB_EVENT_NAME`, `$GITHUB_BASE_REF`, and `$GITHUB_SHA`
to determine the commit range to validate. These are GitHub Actions built-in environment
variables that are normally available, but PRD §11.1 specifies them as explicit `env:`
entries on the `validate-commits` step to make the dependency visible and auditable:

```yaml
env:
  GITHUB_EVENT_NAME: ${{ github.event_name }}
  GITHUB_BASE_REF: ${{ github.base_ref }}
  GITHUB_SHA: ${{ github.sha }}
```

The scaffold omits these explicit `env:` entries. The script falls back to built-in env
vars that happen to be populated by GitHub Actions. However, without explicit declaration,
there is no indication in the workflow that the step depends on context values, making it
harder to port or debug.

## Decision

All `npm install`/`npm ci` steps in CI workflows use `npm ci --ignore-scripts`.

The `validate-commits` step in `1-commit.yml` declares `GITHUB_EVENT_NAME`,
`GITHUB_BASE_REF`, and `GITHUB_SHA` explicitly in its `env:` block.

## Consequences

CI does not attempt hook installation. Explicit env var declaration makes the dependency
graph of shell scripts visible to workflow readers without tracing into script internals.
