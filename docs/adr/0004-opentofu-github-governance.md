---
status: accepted
date: 2026-06-24
tags: [tooling, infrastructure]
implementation: infra/github/main.tf
---

# 0004. OpenTofu for GitHub Governance

## Context

GitHub repository settings (branch protection, merge strategy, issue labels, deployment
environments) are typically configured via the GitHub UI. This makes settings invisible
to reviewers, hard to replicate across projects, and easy to drift silently.

## Decision

GitHub repository settings are managed as OpenTofu code in `infra/github/`. The `infra.yml`
workflow runs `tofu plan` on PRs (posts output as a comment) and `tofu apply` on main push.

Application infrastructure (databases, compute, storage) is NOT managed here. That belongs
in each instantiated project's own `infra/app/` module.

## Consequences

Branch protection rules, labels, environments, and merge strategy are auditable, reviewable,
and version-controlled. Changes to governance settings go through PRs like any other change.
Requires initial manual bootstrap of the remote state bucket.
