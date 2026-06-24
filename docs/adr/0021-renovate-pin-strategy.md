---
status: proposed
date: 2026-06-24
tags: [quality, tooling, dependencies]
---

## Context

`renovate.json` sets `"rangeStrategy": "pin"` at the top level and `"automerge": false`
everywhere (both root and in all `packageRules`). The `config:recommended` preset already
includes sensible defaults including automerge for devDependencies. The current combination
produces a configuration where:

1. Every dependency update is pinned to an exact version (no `^` or `~` ranges)
2. No update is automerged regardless of type (minor, patch, or major)
3. The Dependency Dashboard is enabled, surfacing all pending updates

This means that every minor and patch update for every dependency generates a PR that
requires manual merge. For a template repository tracking dozens of npm packages, GitHub
Actions, and OpenTofu providers, this creates permanent PR backlog with no automated
relief valve. The `"non-major dependencies"` rule groups patch/minor PRs, which reduces
PR count, but the manual merge requirement remains.

`rangeStrategy: "pin"` is appropriate for application deployables (the `apps/web` lockfile
pins effectively anyway) but is unusual and potentially disruptive for library packages
(`packages/config`, `packages/ui`, `packages/db`) where consumers may have conflicting
transitive ranges.

## Decision

1. Remove the top-level `"rangeStrategy": "pin"` — let Renovate use its default strategy
   (`"replace"`) for packages, which preserves `^` ranges in `package.json`. The lockfile
   already provides reproducibility.
2. Enable `"automerge": true` for the `"non-major dependencies"` rule to allow automated
   merge of grouped patch/minor PRs when CI passes.
3. Retain `"automerge": false` for major updates — these already have the `needs-adr-review`
   label requirement which implies human review.
4. Retain `helpers:pinGitHubActionDigests` — pinning Action digests is security-critical
   and should remain.

## Consequences

- Patch and minor dependency PRs merge automatically when CI passes (reduces toil)
- `package.json` retains range specifiers (`^`), consistent with npm convention
- Major updates continue to require manual ADR review
- The template's own lockfile (`package-lock.json`) continues to provide exact reproducibility
  for instantiated projects
- Projects instantiated from this template inherit this Renovate config; teams that prefer
  full manual control should override `"automerge": false` in their instance
