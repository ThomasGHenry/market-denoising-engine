---
status: proposed
date: 2026-06-24
tags: [tooling, ci]
implementation: .github/workflows/1-commit.yml
---

# 0012. `1-commit.yml` Must Trigger on All Branches, Not Only `main`

## Context

PRD §9.1 specifies the trigger for `1-commit.yml`:

```yaml
on:
  push:
    branches: ['**']
  pull_request:
```

The scaffold as built uses:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

With `branches: [main]`, CI runs only on direct pushes to `main` and on PRs targeting
`main`. Feature branches pushed to the remote before opening a PR receive no CI feedback.
Developers working on feature branches get no signal until they open a PR.

The branch protection ruleset requires `commit-validation` to pass before merging.
If `commit-validation` only runs when a PR is open (not on each branch push), CI runs
once per PR state change rather than once per push. Fast feedback on branch pushes is
lost.

The `pull_request` filter `branches: [main]` is also redundant — `pull_request` already
triggers on PRs targeting the base branch, and the constraint makes the filter overly
specific.

## Decision

`1-commit.yml` trigger must match the PRD specification:

```yaml
on:
  push:
    branches: ['**']
  pull_request:
```

This ensures every branch push receives CI feedback, regardless of PR state.

## Consequences

CI runs on all pushes across all branches. This increases runner usage proportionally to
push frequency across all branches. For a low-volume solo repository, the cost is
negligible. The benefit is immediate per-push feedback, which is the primary driver
of trunk-based development discipline.
