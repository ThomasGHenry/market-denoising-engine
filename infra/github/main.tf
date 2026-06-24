terraform {
  required_version = ">= 1.6"
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  token = var.github_token
  owner = var.repo_owner
}

resource "github_repository" "repo" {
  name        = var.repo_name
  description = "Greenfield project template — governance baseline + nextjs-vercel-prisma overlay"
  visibility  = "public"

  is_template            = true
  allow_squash_merge     = true
  allow_merge_commit     = false
  allow_rebase_merge     = false
  squash_merge_commit_message = "BLANK"
  delete_branch_on_merge = true
  allow_auto_merge       = true
  has_issues             = true
  has_projects           = false
  has_wiki               = false

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [topics]
  }
}

resource "github_repository_ruleset" "main_protection" {
  name        = "main-protection"
  repository  = github_repository.repo.name
  target      = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["~DEFAULT_BRANCH"]
      exclude = []
    }
  }

  rules {
    required_linear_history = true
    deletion                = true

    required_status_checks {
      strict_required_status_checks_policy = false
      required_check {
        context = "Commit Validation"
      }
    }

    pull_request {
      required_approving_review_count = 0
      dismiss_stale_reviews_on_push   = false
      require_code_owner_review       = false
    }
  }
}

resource "github_repository_environment" "production" {
  repository  = github_repository.repo.name
  environment = "production"
}

resource "github_repository_environment" "preview" {
  repository  = github_repository.repo.name
  environment = "preview"
}

locals {
  labels = {
    "enhancement"           = { color = "0075ca", description = "New capability" }
    "bug"                   = { color = "d73a4a", description = "Something is wrong" }
    "documentation"         = { color = "0075ca", description = "Documentation only" }
    "tooling"               = { color = "5319e7", description = "CI/infra/governance" }
    "needs-triage"          = { color = "e4e669", description = "Received, unexamined" }
    "needs-spec"            = { color = "fbca04", description = "Triaged, needs spec" }
    "needs-adr"             = { color = "fbca04", description = "Needs architectural decision" }
    "in-progress"           = { color = "0e8a16", description = "Active work" }
    "acceptance-failure"    = { color = "b60205", description = "CI failure (auto-created)" }
    "incident"              = { color = "b60205", description = "Production incident (DORA)" }
    "needs-adr-review"      = { color = "b60205", description = "Major dependency update" }
    "backlog"               = { color = "c5def5", description = "Not soon" }
    "candidate-for-removal" = { color = "e4e669", description = "Evaluate for deletion" }
    "good-first-issue"      = { color = "7057ff", description = "Suitable for new contributors" }
  }
}

resource "github_issue_label" "labels" {
  for_each    = local.labels
  repository  = github_repository.repo.name
  name        = each.key
  color       = each.value.color
  description = each.value.description
}
