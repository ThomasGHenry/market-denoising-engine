---
status: accepted
date: 2026-06-24
tags: [delivery, ci, governance, infrastructure]
implementation: infra/github/main.tf
---

# 0008. Branch Protection Must Match the 0-Reviewer / Auto-Merge Contract

## Context

Non-Negotiable §6: "0 required human reviewers — automation is the gate; human review is
optional." Non-Negotiable §7: "Auto-merge enabled — PRs merge automatically when all checks
pass."

The `infra/github/main.tf` as built sets:
- `required_approving_review_count = 1` (contradicts §6)
- `dismiss_stale_reviews_on_push = true` (implies reviews are required)
- `strict_required_status_checks_policy = true` (requires branch to be up-to-date)
- `allow_auto_merge` is absent from the repository resource (defaults to false)
- `squash_merge_commit_message = "PR_BODY"` (PRD specifies `"BLANK"`)
- `visibility = "private"` (PRD specifies `"public"` for a template repository)

With `required_approving_review_count = 1` and no auto-merge, every PR requires a
human approval and manual merge click. This contradicts the delivery model where
automation (`commit-validation` + E2E) is the sole gate.

With `strict_required_status_checks_policy = true`, a PR cannot merge until it is
up-to-date with main. Without automated rebasing (Mergify or GitHub's auto-update),
PRs can only merge if no other PR merged after them. In a low-volume trunk-based repo
this creates merge queuing friction — each PR author must manually rebase. The staleness
risk from `strict = false` (a PR merging against a commit that is one push behind) is
lower than the friction cost of requiring synchronization on every merge.

The `integration_id = 0` on `required_check` is not in the PRD spec and may prevent
the `commit-validation` status check from being recognized correctly, depending on
which GitHub App reports the check.

Auto-merge in this model is trustworthy only when the aggregate validator is the sole
required status check and the aggregate validator itself cannot be gamed. The evidence
it produces is: every job in `needs:` ran and reported `success`. This is enforced by
`validate-aggregate.sh` reading `$NEEDS_JSON` and failing if any result is not `success`
(skipped results also fail, per §9.5). `actionlint` in Phase 0 validates workflow YAML
on every push, preventing silent breakage of the gate structure itself.

## Decision

`infra/github/main.tf` must match the PRD spec exactly:

```hcl
# Repository resource
resource "github_repository" "repo" {
  visibility                  = "public"
  allow_auto_merge            = true
  squash_merge_commit_message = "BLANK"
  # ... other fields unchanged
}

# Branch protection resource
resource "github_branch_ruleset" "main" {
  # ...
  rules {
    required_status_checks {
      required_check {
        context = "commit-validation"
        # No integration_id — omit the field entirely
      }
      strict_required_status_checks_policy = false
    }
    required_pull_request {
      required_approving_review_count = 0
      dismiss_stale_reviews_on_push   = false
    }
  }
}
```

Specific changes:
- `required_approving_review_count = 0`
- `dismiss_stale_reviews_on_push = false`
- `strict_required_status_checks_policy = false`
- `allow_auto_merge = true` on the repository resource
- `squash_merge_commit_message = "BLANK"`
- `visibility = "public"`
- Remove `integration_id = 0` from `required_check`
- `include = ["~DEFAULT_BRANCH"]` (not `refs/heads/main`) so the ruleset survives
  branch renames on new instantiations
- Add `topics` to the `ignore_changes` lifecycle block on the repository resource
  (topics are managed via the GitHub UI; Tofu drift-detecting them creates noise)
- Add `lifecycle { prevent_destroy = true }` to the labels resource to prevent
  accidental label deletion via `tofu destroy`

## Consequences

PRs merge automatically when `commit-validation` passes. Human review remains optional
(reviewers can still be requested and their approval still counts) but is never a
merge prerequisite.

The `strict = false` setting accepts that PRs may merge against a main that is one
push ahead. In a trunk-based, squash-merge repository, this means a PR could merge
without incorporating the most recent squashed commit. The probability of a hidden
integration conflict is bounded by: (a) small batch sizes enforced by the delivery
model, (b) typecheck, lint, and test jobs in Phase 1 that would catch type-level
conflicts, and (c) the fact that two PRs being in-flight simultaneously is the
exception, not the norm, in a solo or small-team project.

The alternative — `strict = true` without auto-rebase tooling — produces a merge
queue problem: every PR author must manually rebase after any other PR merges. This
degrades batch size and deployment frequency over time, which is the opposite of the
delivery model's intent.

Auto-merge is trustworthy in this topology because:
1. `commit-validation` is the sole required check — no other check can be silently
   dropped from branch protection.
2. `validate-aggregate.sh` reads all job results from `$NEEDS_JSON` — adding a new job
   to `1-commit.yml`'s `needs:` list is sufficient to make it gate-relevant without
   touching branch protection.
3. `actionlint` runs in Phase 0 — workflow YAML defects (duplicate keys, invalid
   expressions) are caught before reaching main.
4. The aggregate job uses `if: always()` — it runs even if upstream jobs are cancelled
   or fail, ensuring the status check always resolves.
