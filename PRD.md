# tgh-template: Developer Handoff

## 1. Working Name

`tgh-template`

GitHub repo name: `tgh-template`
GitHub repo type: GitHub Template Repository (enable "Template repository" in Settings)
Description: Greenfield project template — governance baseline + nextjs-vercel-prisma overlay

---

## 2. Purpose

This repository is a GitHub template repository. When a new project is started, the developer
clicks "Use this template" (or `gh repo create --template tgh/tgh-template`) and gets a
complete, working, opinionated starting point.

The template ships two things simultaneously:

- **Layer 0** — A stack-agnostic governance baseline that works for any project: ADR
  governance, conventional commits enforcement, secret scanning, workflow linting, CI gate
  structure, issue templates, label taxonomy, pre-commit hooks, and GitHub settings as code.

- **Layer 1** — A nextjs-vercel-prisma overlay: NX monorepo, Next.js 15 app router, Prisma
  ORM, Neon Postgres, Vitest unit tests, Playwright E2E, ESLint flat config, Prettier, and
  a deploy chain wired to Vercel.

Both layers are committed together. The template is immediately runnable on clone.

---

## 3. What This Is Not

**Not a generator.** There is no `nx generate`, no npm package to publish, no version to
track, no sync mechanism. What you get on clone is what you have. If the template improves
later, existing projects do not receive those improvements. Future projects do.

**Not a multi-overlay system yet.** This first version ships one overlay (nextjs-vercel-
prisma). A second overlay (flutter-gcp, node-aws-sst, etc.) will be added when a project
needs it. At that point, a `setup.sh` or local NX generator may be introduced to handle
overlay selection on clone. For now, one overlay = no ambiguity, no cleanup step needed.

**Not an application.** The template itself is not a running product. It contains stubs and
scaffolding. The first instantiation (Market Denoising Engine) proves the template works.

---

## 4. Philosophy

**4.1 Snapshot, not distribution**

The template is a starting point, not a managed dependency. This eliminates an entire class
of complexity: no versioning, no sync tooling, no Renovate PRs from a parent template, no
"which version of the template am I on?" questions. The tradeoff is explicit: bug fixes in
governance scripts (ADR validation, gitleaks config) do not automatically reach existing
projects. Teams that care can manually backport. Most teams will not need to.

**4.2 Governance is the product**

The non-obvious value of this template is not the NX config or the Next.js scaffold. Those
are commodity. The value is the governance layer that most teams skip: enforced ADRs,
secret scanning, conventional commits, spec-kit integration stubs, a CI gate that
distinguishes governance failures from build failures, and GitHub settings managed as
auditable code. These are the patterns that compound over time.

**4.3 The aggregate validator is the contract**

Every CI concern — ADR validity, secret scanning, typecheck, tests, schema validity — feeds
into one job: `commit-validation`. That job is the sole required GitHub status check. This
means branch protection has one entry, not ten. Adding a new validation job does not require
touching branch protection settings. Removing a job does not silently drop a protection.
The aggregate job is the contract between the CI system and the merge gate.

**4.4 Phase 0 gates compute**

Governance checks (ADR validity, secret scanning, commit messages, workflow linting) run
before any compute-intensive jobs (typecheck, lint, tests, build). If a developer pushed
without an ADR when one is required, the system tells them within 30 seconds — not after
waiting 8 minutes for a test suite. This is the Phase 0 / Phase 1 distinction inherited
from `buen-vecino`.

**4.5 IaC for GitHub, not for application infrastructure**

The template manages GitHub repository settings (branch protection, labels, environments,
merge strategy) as OpenTofu code. It does not manage application infrastructure (databases,
compute, storage). That is instance-specific and belongs in each instantiated project's own
`infra/app/` module, added during implementation.

---

## 5. Architecture: Three Layers

```
Layer 0: Base Governance (template-owned, stack-agnostic, always-on)
  .github/workflows/1-commit.yml     CI gate structure
  .github/workflows/incident.yml     DORA CFR/MTTR
  .github/workflows/auto-triage.yml  Failure issue creation
  .github/ISSUE_TEMPLATE/            5 templates
  .github/pull_request_template.md
  .github/LABEL_TAXONOMY.md
  docs/adr/0000-template.md          ADR format specification
  docs/adr/README.md
  scripts/ci/validate-adrs.sh
  scripts/ci/validate-commits.sh
  scripts/ci/run-gitleaks.sh
  scripts/ci/run-actionlint.sh
  scripts/ci/run-shellcheck.sh
  scripts/ci/validate-aggregate.sh
  scripts/setup-hooks.sh
  .gitleaks.toml
  .pre-commit-config.yaml
  commitlint.config.js
  renovate.json
  DECISIONS.md
  .specify/memory/constitution.md    Placeholder, instantiator replaces
  infra/github/main.tf               Branch protection, labels, environments
  infra/github/variables.tf
  infra/github/outputs.tf
  infra/github/backend.tf

Layer 1: NextJS-Vercel-Prisma Overlay (template-owned, stack-specific)
  nx.json
  package.json                       npm workspaces
  package-lock.json
  tsconfig.base.json
  eslint.config.mjs
  .prettierrc
  .nvmrc                             22
  apps/web/                          Next.js 15 scaffold
  apps/web-e2e/                      Playwright scaffold
  packages/db/                       Prisma client
  packages/domain/                   Business logic (no React deps)
  packages/ui/                       shadcn/ui base components
  packages/config/                   Env validation (Zod)
  .github/workflows/2-e2e.yml        E2E against Vercel preview
  .github/workflows/3-promote.yml    Production promote (manual gate)
  .github/workflows/renovate.yml     Weekday Renovate run
  .github/workflows/infra.yml        Tofu plan on PR, apply on main
  vercel.json

Layer 2: Instance-Specific (NOT in template, added during implementation)
  docs/adr/0001-*.md through 000N-*.md   Project's own ADRs
  docs/prd/                              Product requirements
  docs/runbooks/                         Operational runbooks
  packages/db/prisma/schema.prisma       Real schema (replaces stub)
  packages/scoring/                      New package for MDE
  apps/web/src/app/**                    Real pages and components
  infra/app/                             Application infrastructure
  seed data
```

---

## 6. Non-Negotiables

Decisions already made. Do not revisit during implementation.

1. **Template-as-snapshot** — no generator, no version sync, no setup.sh (for now)
2. **`commit-validation` is the sole required GitHub status check** — one entry in
   branch protection, aggregate job collects all others
3. **Phase 0 gates Phase 1** — governance jobs (gitleaks, ADR, commits, actionlint,
   shellcheck, prisma-migrate-check) must all pass before typecheck/lint/test/build run
4. **Squash-only merges** — configured in both Tofu IaC and `nx.json` settings
5. **Linear history required** — no merge commits on main
6. **0 required human reviewers** — automation is the gate; human review is optional
7. **Auto-merge enabled** — PRs merge automatically when all checks pass
8. **OpenTofu manages GitHub settings** — not the GitHub UI
9. **GCS or Cloudflare R2 remote state** — never local state for Tofu
10. **Conventional commits enforced** — commitlint at commit-msg stage + CI validation
11. **72-character commit header maximum** — enforced by commitlint rule
12. **ADRs use 4-digit numbering** — `0001-kebab-slug.md`, not date-based
13. **Accepted tooling ADRs require `implementation:` field** — links to where it lives
14. **`validate-aggregate.sh` reads `$NEEDS_JSON`** — same pattern as buen-vecino
15. **Renovate weekday-only** — prevents weekend PR pile-up
16. **Major dependency updates get `needs-adr-review` label** — not auto-merged

---

## 7. Repository Identity

```
Repo name:     tgh-template
Owner:         ThomasGHenry
Visibility:    public
Is template:   true (GitHub Settings → Template repository)
Default branch: main
Merge strategy: squash only
Auto-merge:    enabled
Delete branch on merge: true
```

---

## 8. Directory Structure

Complete annotated layout. Every directory and significant file explained.

```
tgh-template/
│
├── .github/
│   ├── workflows/
│   │   ├── 1-commit.yml          Phase 0 + Phase 1 CI. Runs on every push and PR.
│   │   │                         Contains the aggregate commit-validation job.
│   │   ├── 2-e2e.yml             E2E against Vercel preview. Triggered by 1-commit
│   │   │                         success on main. Runs Playwright.
│   │   ├── 3-promote.yml         Production promote. Manual dispatch OR triggered by
│   │   │                         2-e2e success on main. Runs prisma migrate + promotes
│   │   │                         Vercel preview to production.
│   │   ├── incident.yml          DORA CFR/MTTR. Triggered by issue labeled/closed
│   │   │                         with `incident` label.
│   │   ├── auto-triage.yml       Reusable workflow. Called on failure from other
│   │   │                         workflows. Creates GitHub issue with failure context.
│   │   ├── renovate.yml          Weekday Renovate run. Uses RENOVATE_TOKEN secret.
│   │   └── infra.yml             Tofu plan on PR (posts comment), apply on main.
│   │                             Path-filtered to infra/**.
│   │
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug-needs-triage.yml  Undiagnosed bugs. Labels: bug, needs-triage.
│   │   ├── bug-triaged.yml       Reproduced bugs. Labels: bug, needs-spec.
│   │   ├── feature.yml           Features with BDD acceptance scenarios.
│   │   │                         Labels: enhancement, needs-spec.
│   │   ├── tooling.yml           CI/infra/governance work. Labels: tooling, needs-adr.
│   │   └── config.yml            blank_issues_enabled: false
│   │
│   ├── pull_request_template.md  Closes #. What. Checklist (tests, ADR, no artifacts).
│   ├── LABEL_TAXONOMY.md         Label definitions and mandatory categories.
│   └── scripts/
│       └── auto-triage/
│           ├── create-issue.sh   Creates or updates failure issue.
│           └── extract-error.sh  Extracts root cause from workflow logs.
│
├── apps/
│   ├── web/                      Next.js 15, App Router. src/app/ structure.
│   │   ├── package.json
│   │   ├── project.json          NX project config. tags: ["scope:web"]
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       └── app/
│   │           ├── layout.tsx    Root layout. Minimal. No content. Uses
│   │           │                 `import type { ReactNode } from 'react'` (not React.ReactNode).
│   │           └── page.tsx      Home page. Renders "tgh-template" heading. Proves build.
│   │
│   └── web-e2e/                  Playwright E2E suite.
│       ├── package.json
│       ├── project.json          NX project config. tags: ["scope:web"]
│       ├── playwright.config.ts  Chromium only in CI. Base URL from env.
│       └── src/
│           └── smoke.spec.ts     One test: GET / returns 200 and contains expected heading.
│
├── packages/
│   ├── db/                       Prisma client package. All DB access goes through here.
│   │   ├── package.json
│   │   ├── project.json          NX project config. tags: ["scope:shared"]
│   │   ├── prisma.config.ts      Required by Prisma 7. Points CLI at prisma/schema.prisma.
│   │   ├── prisma/
│   │   │   ├── schema.prisma     Stub: User model only. Instantiator replaces entirely.
│   │   │   └── seed.ts           Stub: seeds one User. Instantiator replaces.
│   │   └── src/
│   │       └── index.ts          Re-exports PrismaClient. Single import point.
│   │
│   ├── domain/                   Business logic. No React imports allowed. No Prisma
│   │   ├── package.json          imports allowed (use db package types). Pure functions.
│   │   ├── project.json          NX project config. tags: ["scope:domain"]
│   │   └── src/
│   │       └── index.ts          Empty barrel export. Instantiator populates.
│   │
│   ├── ui/                       Shared React component library. shadcn/ui base.
│   │   ├── package.json
│   │   ├── project.json          NX project config. tags: ["scope:shared"]
│   │   └── src/
│   │       ├── index.ts          Barrel export.
│   │       └── components/
│   │           └── button.tsx    shadcn Button. Proves shadcn setup works.
│   │
│   └── config/                   Environment validation. Zod schemas for env vars.
│       ├── package.json
│       ├── project.json          NX project config. tags: ["scope:shared"]
│       └── src/
│           └── index.ts          parseEnv() function. Throws on startup if env invalid.
│
├── docs/
│   └── adr/
│       ├── README.md             ADR ceremony docs. When to write ADR vs DECISIONS.md.
│       ├── 0000-template.md      ADR format specification. Not validated. Not a real ADR.
│       ├── 0001-snapshot-model.md           Template meta-ADR. See §13.
│       ├── 0002-aggregate-validator.md      Template meta-ADR. See §13.
│       ├── 0003-nextjs-vercel-prisma.md     Template meta-ADR. See §13.
│       ├── 0004-opentofu-github-governance.md Template meta-ADR. See §13.
│       └── 0005-phase-zero-gate.md          Template meta-ADR. See §13.
│
├── infra/
│   └── github/
│       ├── main.tf               GitHub repo settings, branch protection, labels, envs.
│       ├── variables.tf          Input vars: github_token, repo_name, repo_owner.
│       ├── outputs.tf
│       └── backend.tf            Remote state. Developer configures bucket on init.
│
├── scripts/
│   ├── ci/
│   │   ├── validate-adrs.sh      ADR structure validation. See §11.1.
│   │   ├── validate-adrs.bats    BATS test suite for validate-adrs.sh.
│   │   ├── validate-commits.sh   Conventional commits range check. See §11.2.
│   │   ├── validate-commits.bats
│   │   ├── run-gitleaks.sh       Gitleaks wrapper. Mode: staged or full.
│   │   ├── run-gitleaks.bats
│   │   ├── run-actionlint.sh     Actionlint wrapper.
│   │   ├── run-actionlint.bats
│   │   ├── run-shellcheck.sh     Shellcheck on all *.sh files recursively.
│   │   ├── run-shellcheck.bats
│   │   ├── validate-aggregate.sh Reads NEEDS_JSON, fails if any job did not succeed.
│   │   ├── validate-aggregate.bats
│   │   ├── validate-bats-coverage.sh  Enforces BATS sibling rule: every *.sh must have
│   │   │                              a sibling *.bats with the same basename.
│   │   └── validate-bats-coverage.bats
│   └── setup-hooks.sh            Installs pre-commit + commit-msg git hooks. Run once.
│
├── .specify/
│   └── memory/
│       └── constitution.md       PLACEHOLDER. Instantiator replaces with project
│                                 constitution. See §13 for replacement instructions.
│
├── .gitleaks.toml                Allowlist entries. Empty stubs.
├── .pre-commit-config.yaml       Hook definitions. See §10.
├── commitlint.config.js          Conventional commits config.
├── renovate.json                 Renovate configuration. See §9.8.
├── nx.json                       NX workspace config. See §10.1.
├── package.json                  Root package.json with workspaces.
├── package-lock.json             Committed lockfile.
├── tsconfig.base.json            Shared TypeScript configuration. See §10.2.
├── eslint.config.mjs             ESLint flat config. See §10.4.
├── .prettierrc                   Prettier configuration.
├── .nvmrc                        22
├── vercel.json                   Root-level Vercel config. framework: nextjs.
├── DECISIONS.md                  Lightweight non-ADR decisions log.
└── README.md                     Template README. Usage instructions. Instantiation steps.
```

---

## 9. Layer 0 Specification: Base Governance

### 9.1 GitHub Actions Workflows

#### `1-commit.yml` — CI Gate

This is the most important file in the template. Read §11 for complete specification.

Triggers:
```yaml
on:
  push:
    branches: ['**']
  pull_request:
```

The workflow has two phases. Phase 0 runs governance checks in parallel. All Phase 0 jobs
must pass before Phase 1 (compute) jobs begin. A final aggregate job collects all results.

#### `incident.yml` — DORA CFR/MTTR

Trigger: `on: issues: types: [labeled, closed]`

Two jobs:
- `record-incident-start`: fires when issue is labeled with `incident`. Records deployment
  event via `bobheadxi/deployments@v1` with environment `incident`.
- `record-incident-resolution`: fires when issue with `incident` label is closed. Computes
  MTTR from open→close timestamps. Records resolution event.

Requires `GITHUB_TOKEN` (automatic, no additional secret needed).

#### `auto-triage.yml` — Failure Issue Creation

Reusable workflow (`workflow_call`). Called from other workflows on failure.

Inputs: `workflow_name`, `run_url`, `commit_sha`, `actor`

Logic:
1. Check for existing open issue with `acceptance-failure` label containing the workflow
   name in the title.
2. If found: add a comment with new failure context.
3. If not found: create new issue with labels `acceptance-failure`, `needs-triage`.

Call it from other workflows on failure:
```yaml
on-failure:
  uses: ./.github/workflows/auto-triage.yml
  if: failure()
  with:
    workflow_name: ${{ github.workflow }}
    run_url: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
    commit_sha: ${{ github.sha }}
    actor: ${{ github.actor }}
```

#### `renovate.yml` — Dependency Updates

```yaml
on:
  schedule:
    - cron: "0 9 * * 1-5"   # 09:00 UTC weekdays only
  workflow_dispatch:
```

Single job:
1. `scripts/ci/check-renovate-token.sh` — no-op with informational message if
   `RENOVATE_TOKEN` secret does not exist (allows template to ship without requiring the
   secret immediately).
2. If token present: `renovatebot/github-action@v46` with `RENOVATE_TOKEN`.

Uses a fine-grained PAT (not `GITHUB_TOKEN`) so Renovate PRs trigger workflows. Required
scopes: `contents: read/write`, `pull-requests: read/write`, `workflows: read/write`.

#### `infra.yml` — OpenTofu

```yaml
on:
  push:
    branches: [main]
    paths: ['infra/**', '.github/workflows/infra.yml']
  pull_request:
    paths: ['infra/**', '.github/workflows/infra.yml']
```

Two jobs:
- `plan` (PR only): `tofu init && tofu plan -no-color`, captures plan output to
  `$GITHUB_OUTPUT` and posts it as PR comment via `gh pr comment`. The plan step must
  capture output:
  ```yaml
  - name: Tofu Plan
    id: plan
    run: |
      tofu plan -no-color 2>&1 | tee plan_output.txt
      echo "stdout<<EOF" >> $GITHUB_OUTPUT
      cat plan_output.txt >> $GITHUB_OUTPUT
      echo "EOF" >> $GITHUB_OUTPUT
  ```
- `apply` (main push only): `tofu init && tofu apply -auto-approve`.

Both require: `GITHUB_TOKEN` (for plan comment), `TF_VAR_github_token` (GitHub provider
auth), state backend credentials (GCS or R2 — see §12).

---

### 9.2 Issue Templates

#### `feature.yml`

Fields:
```
Title:       [Feature]: <title>
Labels:      enhancement, needs-spec
Body fields:
  - description (required): What does this do for the user?
  - acceptance_scenarios (optional):
      placeholder: |
        Given [precondition]
        When [action]
        Then [outcome]
  - priority (dropdown): P0 — Blocking, P1 — High, P2 — Medium, P3 — Nice-to-have
  - impact_area (checkboxes): project-specific, instantiator populates
```

#### `bug-needs-triage.yml`

```
Title:       [Bug]: <title>
Labels:      bug, needs-triage
Body fields:
  - symptom (required): What went wrong? No reproduction required.
  - environment (optional): Where did it happen?
```

#### `bug-triaged.yml`

```
Title:       [Bug]: <title>
Labels:      bug, needs-spec
Body fields:
  - reproduction_steps (required)
  - expected_behavior (required)
  - actual_behavior (required)
  - severity (dropdown): P0 — System down, P1 — Major, P2 — Minor, P3 — Cosmetic
  - logs (optional)
```

#### `tooling.yml`

```
Title:       [Tooling]: <title>
Labels:      tooling, needs-adr
Body fields:
  - description (required): What CI/infra/governance change is needed?
  - adr_number (required): Which ADR governs or will govern this?
```

#### `config.yml`

```yaml
blank_issues_enabled: false
```

---

### 9.3 Pull Request Template

`.github/pull_request_template.md`:

```markdown
Closes #

## What
<!-- One sentence: what does this PR change? -->

## Checklist
- [ ] Tests pass (`npx nx run-many -t test`)
- [ ] Typecheck passes (`npx nx run-many -t typecheck`)
- [ ] If architectural decision: ADR committed in docs/adr/
- [ ] No debug artifacts committed (*.sqlite, downloads/, screenshots)
- [ ] DECISIONS.md updated if a non-ADR decision was made
```

---

### 9.4 Label Taxonomy

`.github/LABEL_TAXONOMY.md` documents the labels. `infra/github/main.tf` creates them.

| Label | Color | Purpose | Mandatory? |
|---|---|---|---|
| `enhancement` | `0075ca` | New capability | Type (one required) |
| `bug` | `d73a4a` | Something is wrong | Type (one required) |
| `documentation` | `0075ca` | Docs only | Type (one required) |
| `tooling` | `5319e7` | CI/infra/governance | Type (one required) |
| `needs-triage` | `e4e669` | Received, unexamined | Status (one required) |
| `needs-spec` | `fbca04` | Triaged, needs spec | Status (one required) |
| `needs-adr` | `fbca04` | Needs architectural decision | Status |
| `in-progress` | `0e8a16` | Active work | Status |
| `acceptance-failure` | `b60205` | CI failure (auto-created) | Auto |
| `incident` | `b60205` | Production incident (DORA) | Manual |
| `needs-adr-review` | `b60205` | Major dependency (Renovate) | Auto (Renovate) |
| `backlog` | `c5def5` | Not soon | Timeline |
| `candidate-for-removal` | `e4e669` | Evaluate for deletion | Optional |
| `good-first-issue` | `7057ff` | Suitable for new contributors | Optional |

---

### 9.5 Shell Scripts

Every script in `scripts/ci/` follows these conventions:
- `#!/usr/bin/env bash`
- `set -euo pipefail`
- Has a corresponding `.bats` test file in the same directory
- Accepts arguments or environment variables — never hardcoded paths
- Single responsibility: one script, one concern

#### `validate-adrs.sh`

Usage: `bash scripts/ci/validate-adrs.sh <adr-dir>`

Validates every `*.md` file in `<adr-dir>` except `0000-template.md` and `README.md`.

Checks per file:
1. Filename matches `[0-9]{4}-[a-z][a-z0-9-]+\.md`
2. Contains YAML frontmatter block (`---` delimiters)
3. Frontmatter contains `status:` field
4. `status` value is one of: `proposed`, `accepted`, `rejected`, `deprecated`, `superseded`
5. Frontmatter contains `date:` field matching `[0-9]{4}-[0-9]{2}-[0-9]{2}`
6. Frontmatter contains `tags:` field (list, at least one entry)
7. If status is `accepted` AND tags include `tooling`: `implementation:` field is present
8. If `supersedes: NNNN` present: file `NNNN-*.md` exists and contains `superseded-by: NNNN`
   (where NNNN is the current file's number)
9. If `superseded-by: NNNN` present: file `NNNN-*.md` exists and contains `supersedes: NNNN`
10. File contains `## Context` section
11. File contains `## Decision` section
12. File contains `## Consequences` section

Exit 0 if all pass. Exit 1 with specific error messages if any fail.

Called as: pre-commit hook (changed `docs/adr/*.md` files only) and CI Phase 0 job (full
corpus).

#### `validate-commits.sh`

Usage: `bash scripts/ci/validate-commits.sh`

Reads `$GITHUB_EVENT_NAME` to determine context:
- `pull_request`: validates all commits in range `origin/$GITHUB_BASE_REF..HEAD`
- `push`: validates all commits in range `$GITHUB_EVENT_BEFORE..$GITHUB_SHA`
  (requires `fetch-depth: 0` in the checkout step). Guard against the initial commit
  (no parent) by checking `git rev-parse HEAD^` exits 0 before using the range.
- local (no env): validates `HEAD` commit

For each commit subject:
1. Skip if matches `^Merge pull request #[0-9]+` (GitHub auto-generated)
2. Skip if matches `^Merge branch '` (git merge commit)
3. Validate against conventional commit pattern:
   `^(feat|fix|chore|docs|test|refactor|perf|ci|build|revert)(\([a-z0-9-]+\))?: .+`
4. Validate header length ≤ 72 characters
5. Validate subject does not start with uppercase after the type+scope prefix

Exit 1 if any commit fails. Prints the offending commit SHA and subject.

Also called via commitlint at commit-msg stage (see §9.6).

#### `run-gitleaks.sh`

Usage: `bash scripts/ci/run-gitleaks.sh [staged|full]`

- `staged`: scans only staged files (pre-commit hook usage)
- `full`: scans full git history (CI usage, `--detect-by-commit`)

Requires `gitleaks` binary. Script checks for it and exits 1 with install instructions
if not found. In CI, install via `brew install gitleaks` on macOS or apt on Linux via
the `gitleaks` GitHub Action: `gitleaks/gitleaks-action@v2`.

#### `run-actionlint.sh`

Usage: `bash scripts/ci/run-actionlint.sh`

Runs `actionlint` on `.github/workflows/*.yml`. Requires `actionlint` binary. Exits 1
if any workflow has errors.

In CI, install via the `actionlint` GitHub Action or `brew install actionlint`.

#### `run-shellcheck.sh`

Usage: `bash scripts/ci/run-shellcheck.sh`

Runs `shellcheck -x -P SCRIPTDIR` on all `*.sh` files found recursively in `scripts/`
and `.github/scripts/`. Severity: warning. Exit 1 if any findings.

#### `validate-aggregate.sh`

Usage: Called in CI job with `$NEEDS_JSON` environment variable set.

```bash
#!/usr/bin/env bash
set -euo pipefail

if [ -z "${NEEDS_JSON:-}" ]; then
  echo "NEEDS_JSON environment variable is required"
  exit 1
fi

FAILED=$(echo "$NEEDS_JSON" | \
  jq -r 'to_entries[] | select(.value.result != "success") | "\(.key): \(.value.result)"')

if [ -n "$FAILED" ]; then
  echo "The following required jobs did not succeed:"
  echo "$FAILED"
  exit 1
fi

echo "All required jobs succeeded."
```

This is the entire script. It reads the `needs` context passed as JSON and fails if any
job result is not `"success"`. Jobs that were skipped also fail the aggregate (skipped
means the condition was not met, which is itself a signal worth examining).

If a job is intentionally optional, it must NOT be listed in the aggregate job's `needs:`
array.

#### `validate-bats-coverage.sh`

Usage: `bash scripts/ci/validate-bats-coverage.sh`

Enforces the BATS sibling rule: for every `*.sh` file found in `scripts/ci/`, a sibling
`*.bats` file must exist with the same basename. Exits 1 if any `.sh` file lacks a
`.bats` sibling, printing the offending filename.

Run as a Phase 0 job (either standalone or added to the `shellcheck` job). Ensures BATS
test coverage is not silently dropped when new scripts are added.

---

#### `setup-hooks.sh`

Usage: `bash scripts/setup-hooks.sh`

Run once after cloning. Installs pre-commit framework and git hooks.

```bash
#!/usr/bin/env bash
set -euo pipefail

command -v pre-commit >/dev/null 2>&1 || {
  echo "pre-commit not found. Install with: pip install pre-commit"
  exit 1
}

pre-commit install --hook-type pre-commit --hook-type commit-msg
echo "Git hooks installed."
```

Post-install instructions: run `pip install pre-commit` if not present. Add to project
README onboarding section.

---

### 9.6 Pre-Commit Configuration

`.pre-commit-config.yaml`:

```yaml
default_stages: [pre-commit]

repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
        exclude: 'tsconfig.*\.json'
      - id: check-merge-conflict
      - id: check-case-conflict
      - id: mixed-line-ending
        args: [--fix=lf]

  - repo: local
    hooks:
      - id: gitleaks
        name: Secret Scan (staged)
        language: system
        entry: bash scripts/ci/run-gitleaks.sh staged
        pass_filenames: false
        always_run: true

      - id: actionlint
        name: Workflow Lint
        language: system
        entry: bash scripts/ci/run-actionlint.sh
        files: '^\.github/workflows/.*\.yml$'
        pass_filenames: false

      - id: validate-adrs
        name: ADR Structure
        language: system
        entry: bash scripts/ci/validate-adrs.sh docs/adr
        files: '^docs/adr/.*\.md$'
        pass_filenames: false

      - id: shellcheck
        name: Shell Lint
        language: system
        entry: bash scripts/ci/run-shellcheck.sh
        files: '\.sh$'
        pass_filenames: false

      - id: commitlint
        name: Commit Message
        language: node
        entry: npx commitlint --edit
        stages: [commit-msg]
        pass_filenames: false
        additional_dependencies:
          - '@commitlint/cli@^19'
          - '@commitlint/config-conventional@^19'
```

Note: ESLint and Prettier are NOT in pre-commit hooks. They run in CI (`lint` and format
check jobs). The pre-commit hooks focus on governance and secret scanning — fast checks
that give immediate feedback. Formatting is enforced in CI, not locally, to avoid
developer friction on partially-formatted work in progress.

---

### 9.7 Commitlint Configuration

`commitlint.config.js`:

```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'test', 'refactor', 'perf', 'ci', 'build', 'revert']
    ],
  },
};
```

---

### 9.8 Renovate Configuration

`renovate.json`:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    "helpers:pinGitHubActionDigests"
  ],
  "schedule": ["after 9am and before 5pm on weekdays"],
  "timezone": "UTC",
  "rangeStrategy": "pin",
  "automerge": false,
  "dependencyDashboard": true,
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "groupName": "non-major dependencies",
      "groupSlug": "non-major",
      "automerge": true
    },
    {
      "matchUpdateTypes": ["major"],
      "labels": ["needs-adr-review"],
      "automerge": false,
      "additionalBranchPrefix": "major/"
    }
  ]
}
```

---

### 9.9 Secret Scanning

`.gitleaks.toml`:

```toml
[extend]
useDefault = true

[allowlist]
description = "Project-specific allowlist"
# Add entries here as needed when gitleaks produces false positives.
# Example:
# regexes = [
#   "firebase_api_key_placeholder"
# ]
# files = [
#   "GoogleService-Info.plist",
#   "google-services.json"
# ]
```

Required secrets documented in `docs/github/secrets.md` (instantiator creates this file
during setup). The template ships an empty placeholder at that path.

---

## 10. Layer 1 Specification: NextJS-Vercel-Prisma Overlay

### 10.1 NX Configuration

`nx.json`:

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "main",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/*.test.ts",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/**/*.test.tsx",
      "!{projectRoot}/**/*.spec.tsx",
      "!{projectRoot}/test/**/*",
      "!{projectRoot}/**/__mocks__/**/*"
    ],
    "sharedGlobals": []
  },
  "plugins": [
    {
      "plugin": "@nx/next/plugin",
      "options": {
        "buildTargetName": "build",
        "devTargetName": "dev",
        "startTargetName": "start",
        "serveStaticTargetName": "serve-static"
      }
    },
    {
      "plugin": "@nx/vite/plugin",
      "options": {
        "buildTargetName": "build",
        "testTargetName": "test",
        "serveTargetName": "serve",
        "previewTargetName": "preview"
      }
    },
    {
      "plugin": "@nx/eslint/plugin",
      "options": {
        "targetName": "lint"
      }
    },
    {
      "plugin": "@nx/playwright/plugin",
      "options": {
        "targetName": "e2e"
      }
    }
  ],
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production"],
      "cache": true
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"],
      "cache": true
    },
    "typecheck": {
      "cache": true
    }
  }
}
```

`package.json` root:

```json
{
  "name": "tgh-template",
  "version": "0.0.0",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "nx run web:dev",
    "build": "nx run-many -t build",
    "test": "nx run-many -t test",
    "lint": "nx run-many -t lint",
    "typecheck": "nx run-many -t typecheck",
    "e2e": "nx run web-e2e:e2e",
    "db:generate": "prisma generate --config packages/db/prisma.config.ts",
    "db:migrate": "prisma migrate dev --config packages/db/prisma.config.ts",
    "db:seed": "tsx packages/db/prisma/seed.ts",
    "db:studio": "prisma studio --config packages/db/prisma.config.ts",
    "postinstall": "bash scripts/setup-hooks.sh || true"
  },
  "engines": {
    "node": ">=22"
  }
}
```

Note: `postinstall` uses `|| true` so that CI (`npm ci --ignore-scripts`) is not affected.
Hooks are installed only in development environments.

#### NX Project Tags

Every app and package must have a `project.json` file declaring its NX tags. Without tags,
`@nx/enforce-module-boundaries` enforces nothing — the ESLint rule in `eslint.config.mjs`
depends on tags being present in each project's `project.json`.

Required `project.json` files and their content:

`apps/web/project.json`:
```json
{ "name": "web", "tags": ["scope:web"] }
```

`apps/web-e2e/project.json`:
```json
{ "name": "web-e2e", "tags": ["scope:web"] }
```

`packages/db/project.json`:
```json
{ "name": "db", "tags": ["scope:shared"] }
```

`packages/domain/project.json`:
```json
{ "name": "domain", "tags": ["scope:domain"] }
```

`packages/ui/project.json`:
```json
{ "name": "ui", "tags": ["scope:shared"] }
```

`packages/config/project.json`:
```json
{ "name": "config", "tags": ["scope:shared"] }
```

---

### 10.2 TypeScript Configuration

`tsconfig.base.json`:

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": true,
    "moduleResolution": "bundler",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    "useDefineForClassFields": false,
    "module": "ESNext",
    "verbatimModuleSyntax": false,
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "tmp"]
}
```

---

### 10.3 Package Specifications

#### `packages/db/`

`package.json`:
```json
{
  "name": "@template/db",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^7.0.0"
  },
  "devDependencies": {
    "prisma": "^7.0.0",
    "typescript": "^5.0.0"
  }
}
```

`prisma/schema.prisma` (stub — instantiator replaces entirely):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

`prisma.config.ts` (required by Prisma 7):
```typescript
import path from 'path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
});
```
This file must exist or all `prisma` CLI invocations fail.

`prisma/seed.ts` (stub — instantiator replaces):
```typescript
import { prisma } from '../src/index';

async function seed() {
  await prisma.user.create({
    data: { email: 'seed@example.com' },
  });
}

seed()
  .catch(console.error)
  .finally(async () => { await prisma.$disconnect(); });
```

`src/index.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
```

#### `packages/domain/`

`package.json`:
```json
{
  "name": "@template/domain",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^4.0.0"
  }
}
```

Constraint: no imports from `@template/ui`, no imports from React. Only pure TypeScript.
Domain logic that needs database types imports types (not the client) from `@template/db`.

#### `packages/config/`

`src/index.ts` (stub — instantiator populates with real env vars):

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
});

export function parseEnv(env: NodeJS.ProcessEnv = process.env) {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${JSON.stringify(result.error.flatten().fieldErrors, null, 2)}`
    );
  }
  return result.data;
}

export type Env = z.infer<typeof envSchema>;
```

#### `apps/web/src/app/layout.tsx`

`layout.tsx` must use the named import form:
```typescript
import type { ReactNode } from 'react';
```
Do not use `React.ReactNode` — that requires importing the entire React namespace.

#### `packages/ui/src/components/button.tsx`

The Button component must be a real shadcn/ui component (using CVA, Radix slot, Tailwind
classes) — not a hand-written custom component. Generate it by running:
```bash
npx shadcn@latest add button
```
or copy the generated output from shadcn.com. A hand-written stub will not match the
shadcn/ui API that consuming code expects.

---

### 10.4 Linting and Formatting

`eslint.config.mjs`:

```js
import nx from '@nx/eslint-plugin';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:web',
              onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'],
            },
            {
              sourceTag: 'scope:domain',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['.next/**', 'dist/**', 'node_modules/**', '*.config.js'],
  },
];
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

### 10.5 Testing

#### Unit Tests (Vitest)

Each package that contains logic gets a `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',   // 'jsdom' for apps/web
    include: ['src/**/*.{test,spec}.ts'],
  },
});
```

`apps/web` uses `environment: 'jsdom'` and includes `*.tsx` files.

#### E2E Tests (Playwright)

`apps/web-e2e/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Local only:
  // webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true }
});
```

`apps/web-e2e/src/smoke.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/tgh-template/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

---

### 10.6 CI/CD Overlay Workflows

#### `2-e2e.yml`

```yaml
name: E2E

on:
  workflow_run:
    workflows: ["Commit Validation"]
    types: [completed]
    branches: [main]
  workflow_dispatch:

jobs:
  e2e:
    if: github.event.workflow_run.conclusion == 'success' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-24.04
    environment: preview
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci --ignore-scripts
      - run: npx playwright install chromium --with-deps
      - name: Run E2E
        run: npx nx run web-e2e:e2e
        env:
          PLAYWRIGHT_BASE_URL: ${{ secrets.VERCEL_PREVIEW_URL }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/web-e2e/playwright-report/
          retention-days: 7
```

#### `3-promote.yml`

```yaml
name: Promote to Production

on:
  workflow_run:
    workflows: ["E2E"]
    types: [completed]
    branches: [main]
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Type "promote" to confirm production promotion'
        required: true
        type: string

jobs:
  validate-input:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-24.04
    steps:
      - name: Validate confirmation
        if: inputs.confirm != 'promote'
        run: |
          echo "Confirmation required. Type 'promote' to proceed."
          exit 1

  migrate:
    needs: [validate-input]
    if: |
      always() &&
      (needs.validate-input.result == 'success' || needs.validate-input.result == 'skipped') &&
      (
        (github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success') ||
        (github.event_name == 'workflow_dispatch' && inputs.confirm == 'promote')
      )
    permissions:
      deployments: write
    runs-on: ubuntu-24.04
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci --ignore-scripts
      - name: Run production migration
        run: npx prisma migrate deploy --config packages/db/prisma.config.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PROD }}
      - name: Promote Vercel preview to production
        run: npx vercel promote ${{ secrets.VERCEL_PREVIEW_URL }} --token ${{ secrets.VERCEL_TOKEN }}
```

Note: Vercel promotes the preview deployment (which was auto-built by Vercel's GitHub
integration on main push) to production. Migration runs before promotion. If migration
fails, promotion does not happen.

---

## 11. CI/CD Topology: Complete Specification

### 11.1 `1-commit.yml` Complete Job Map

```yaml
name: Commit Validation

on:
  push:
    branches: ['**']
  pull_request:

permissions:
  contents: read
  issues: write
  pull-requests: read

jobs:

  # ─── PHASE 0: GOVERNANCE (all parallel, all block downstream) ───────────────

  gitleaks:
    name: Secret Scan
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  actionlint:
    name: Workflow Lint
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: raven-actions/actionlint@v2

  validate-adrs:
    name: ADR Structure
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/ci/validate-adrs.sh docs/adr

  validate-commits:
    name: Commit Messages
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci --ignore-scripts
      - run: bash scripts/ci/validate-commits.sh
        env:
          GITHUB_EVENT_NAME: ${{ github.event_name }}
          GITHUB_BASE_REF: ${{ github.base_ref }}
          GITHUB_SHA: ${{ github.sha }}

  shellcheck:
    name: Shell Lint
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/ci/run-shellcheck.sh

  prisma-migrate-check:
    name: Prisma Schema Validity
    runs-on: ubuntu-24.04
    services:
      postgres:
        image: postgres:17-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci --ignore-scripts
      - run: npx prisma generate --config packages/db/prisma.config.ts
      - run: npx prisma migrate deploy --config packages/db/prisma.config.ts
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  # ─── PHASE 1: COMPUTE (all parallel, all need all of Phase 0) ───────────────

  typecheck:
    name: Type Check
    needs: [gitleaks, actionlint, validate-adrs, validate-commits, shellcheck, prisma-migrate-check]
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci --ignore-scripts
      - run: npx nx run-many -t typecheck

  lint:
    name: Lint
    needs: [gitleaks, actionlint, validate-adrs, validate-commits, shellcheck, prisma-migrate-check]
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci --ignore-scripts
      - run: npx nx run-many -t lint
      - run: npx nx format:check

  test:
    name: Unit Tests
    needs: [gitleaks, actionlint, validate-adrs, validate-commits, shellcheck, prisma-migrate-check]
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci --ignore-scripts
      - run: npx nx run-many -t test

  build:
    name: Build
    needs: [gitleaks, actionlint, validate-adrs, validate-commits, shellcheck, prisma-migrate-check]
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci --ignore-scripts
      - run: npx nx run-many -t build

  # ─── AGGREGATE: SOLE REQUIRED STATUS CHECK ──────────────────────────────────

  commit-validation:
    name: Commit Validation
    if: always()
    needs:
      # Phase 0
      - gitleaks
      - actionlint
      - validate-adrs
      - validate-commits
      - shellcheck
      - prisma-migrate-check
      # Phase 1
      - typecheck
      - lint
      - test
      - build
    runs-on: ubuntu-24.04
    env:
      NEEDS_JSON: ${{ toJSON(needs) }}
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/ci/validate-aggregate.sh

  # ─── ON FAILURE: AUTO-TRIAGE ─────────────────────────────────────────────────

  auto-triage:
    name: Auto Triage
    needs: [commit-validation]
    if: failure()
    uses: ./.github/workflows/auto-triage.yml
    with:
      workflow_name: "Commit Validation"
      run_url: "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
      commit_sha: ${{ github.sha }}
      actor: ${{ github.actor }}
    secrets: inherit
```

### 11.2 Deploy Chain

```
Developer pushes to main
        │
        ▼
Vercel GitHub App auto-builds preview  (automatic, no workflow)
        │
        ├─── 1-commit.yml runs (CI validation)
        │           │
        │     commit-validation ✓
        │           │
        ▼           ▼
2-e2e.yml (workflow_run on 1-commit success, main only)
  Playwright E2E against Vercel preview URL
        │
        ▼
3-promote.yml (workflow_run on 2-e2e success, main only)
  OR manual workflow_dispatch with "promote" confirmation
  prisma migrate deploy (prod DB)
  vercel promote (preview → production)
```

Each stage gates the next via `workflow_run: types: [completed]` + `conclusion == 'success'`
check. If any stage fails, downstream stages do not run.

### 11.3 DORA Metrics

Four metrics, all GitHub-native:

| Metric | Source | Mechanism |
|---|---|---|
| Deployment Frequency | GitHub Deployments API | `bobheadxi/deployments@v1` in `3-promote.yml` |
| Lead Time | Git log | `git log --pretty=format:"%H %ci"` from first commit to merge |
| Change Failure Rate | GitHub Issues | `incident.yml` records issues labeled `incident` |
| MTTR | GitHub Issues | `incident.yml` computes open→close time on label+close events |

Lead time calculation in `3-promote.yml`:
```bash
FIRST_COMMIT=$(git log main~1..HEAD --pretty=format:"%ci" | tail -1)
DEPLOY_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
# post as deployment metadata or workflow summary
```

No external SaaS required. All data lives in GitHub. Query via GitHub API or `gh` CLI.

---

## 12. IaC Specification

### Overview

`infra/github/` manages GitHub repository settings as OpenTofu code. It does NOT manage:
- Application infrastructure (databases, compute, storage) — instance-specific
- Secret values — set manually or via a separate secure process
- The state bucket — created manually before `tofu init`

### State Backend

Choose one. Document the choice in `infra/github/backend.tf`. One backend must be
uncommented and configured. The developer must choose GCS or R2 before running
`tofu init`. Local state is prohibited (Non-Negotiable §9).

**Important:** Do not commit `backend.tf` with all backends commented out. The file ships
with GCS active and a `TODO: configure bucket name` placeholder. Replace the placeholder
before running `tofu init`.

**Option A: Cloudflare R2** (recommended for personal projects — free egress):
```hcl
terraform {
  backend "s3" {
    bucket                      = "<project-name>-tofu-state"
    key                         = "github/terraform.tfstate"
    region                      = "auto"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    force_path_style            = true
    endpoints = {
      s3 = "https://<account_id>.r2.cloudflarestorage.com"
    }
  }
}
```

**Option B: GCS** (recommended if GCP is already in use):
```hcl
terraform {
  backend "gcs" {
    bucket = "<project-name>-tofu-state"
    prefix = "github"
  }
}
```

Create the bucket manually before running `tofu init`. The bucket itself is not managed
by Tofu (bootstrap exception — same pattern as buen-vecino and diane-v01).

### `infra/github/main.tf` Resources

```hcl
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
  owner = var.github_owner
}

# Repository settings (assumes repo already exists)
resource "github_repository" "repo" {
  name                   = var.repo_name
  visibility             = "public"
  has_issues             = true
  has_projects           = false
  has_wiki               = false
  allow_merge_commit     = false
  allow_squash_merge     = true
  allow_rebase_merge     = false
  allow_auto_merge       = true
  delete_branch_on_merge = true
  squash_merge_commit_title   = "PR_TITLE"
  squash_merge_commit_message = "BLANK"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [description, homepage_url, topics]
  }
}

# Branch protection ruleset
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
    deletion                = true  # prevents deletion (confusing naming)

    required_status_checks {
      strict_required_status_checks_policy = false
      required_check {
        context = "commit-validation"
      }
    }

    pull_request {
      required_approving_review_count   = 0
      dismiss_stale_reviews_on_push     = false
      require_code_owner_review         = false
      require_last_push_approval        = false
      required_review_thread_resolution = false
    }
  }

  bypass_actors = []
}

# Deployment environments
resource "github_repository_environment" "production" {
  repository  = github_repository.repo.name
  environment = "production"

  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }
}

resource "github_repository_environment" "preview" {
  repository  = github_repository.repo.name
  environment = "preview"
  # No branch restrictions on preview
}

# Issue labels
resource "github_issue_label" "labels" {
  for_each    = local.labels
  repository  = github_repository.repo.name
  name        = each.key
  color       = each.value.color
  description = each.value.description
}

locals {
  labels = {
    "enhancement"         = { color = "0075ca", description = "New capability" }
    "bug"                 = { color = "d73a4a", description = "Something is wrong" }
    "documentation"       = { color = "0075ca", description = "Documentation only" }
    "tooling"             = { color = "5319e7", description = "CI/infra/governance" }
    "needs-triage"        = { color = "e4e669", description = "Received, unexamined" }
    "needs-spec"          = { color = "fbca04", description = "Triaged, needs spec" }
    "needs-adr"           = { color = "fbca04", description = "Needs architectural decision" }
    "in-progress"         = { color = "0e8a16", description = "Active work" }
    "acceptance-failure"  = { color = "b60205", description = "CI failure (auto-created)" }
    "incident"            = { color = "b60205", description = "Production incident" }
    "needs-adr-review"    = { color = "b60205", description = "Major dependency update" }
    "backlog"             = { color = "c5def5", description = "Not prioritized" }
    "candidate-for-removal" = { color = "e4e669", description = "Evaluate for deletion" }
    "good-first-issue"    = { color = "7057ff", description = "Suitable for new contributors" }
  }
}
```

`variables.tf`:
```hcl
variable "github_token" {
  description = "GitHub personal access token. Fine-grained PAT with: Administration (rw), Contents (r), Environments (rw), Issues (rw), Metadata (r), Pull requests (rw), Repository Rules (rw), Secrets (rw), Variables (rw), Workflows (rw)."
  type        = string
  sensitive   = true
}

variable "github_owner" {
  description = "GitHub username or organization name."
  type        = string
}

variable "repo_name" {
  description = "Repository name (must already exist)."
  type        = string
}
```

### Running Tofu

```bash
# On first run (after creating state bucket):
cd infra/github
tofu init

# Development:
tofu plan -var="github_token=$GITHUB_TOKEN" -var="github_owner=ThomasGHenry" -var="repo_name=tgh-template"
tofu apply -var="github_token=$GITHUB_TOKEN" -var="github_owner=ThomasGHenry" -var="repo_name=tgh-template"

# In CI (infra.yml): vars passed as environment variables TF_VAR_*
```

---

## 13. ADR Format Specification

### Format

```markdown
---
status: proposed | accepted | rejected | deprecated | superseded
date: YYYY-MM-DD
tags: [tag1, tag2]
implementation: path/to/implementation   # required when status=accepted AND tags includes tooling
supersedes: NNNN                          # optional
superseded-by: NNNN                       # optional
---

# NNNN. Title in Sentence Case

## Context

Describe the situation that necessitates this decision. What forces are at play?
What constraints exist? What happened that made this decision necessary?

## Decision

State the decision clearly. Use active voice. "We will use X" not "X will be used."

## Consequences

Describe the results of applying this decision: what becomes easier, what becomes
harder, what must change, what risks are introduced, what opportunities open.
```

### Template's Own ADRs

These 5 ADRs ship with the template. They document the template's own design decisions
and serve as format examples. Instantiators REPLACE all of them with project-specific ADRs.

---

**`docs/adr/0001-snapshot-model.md`**
```markdown
---
status: accepted
date: 2026-06-24
tags: [architecture, process]
---

# 0001. Template as Snapshot, Not Generator

## Context

New projects need a starting point with governance, CI, and stack scaffolding. Two
approaches exist: a generator that produces projects and can push updates over time, or a
template repository that is cloned once and owned entirely by the instantiating project.

## Decision

This repository is a GitHub Template Repository. Projects clone it once. They own the
result entirely. No generator infrastructure, no version coupling, no sync mechanism.
Improvements to this template benefit future projects only.

## Consequences

Simpler: no npm package to publish, no versioning, no Renovate PRs from a parent template,
no "what version of the template am I on" questions.

Harder: bug fixes in governance scripts (ADR validation, gitleaks config) do not
automatically reach existing projects. Backporting is manual.
```

---

**`docs/adr/0002-aggregate-validator.md`**
```markdown
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
```

---

**`docs/adr/0003-nextjs-vercel-prisma.md`**
```markdown
---
status: accepted
date: 2026-06-24
tags: [architecture]
---

# 0003. NextJS-Vercel-Prisma as First Overlay

## Context

The template needs at least one concrete stack overlay to be immediately useful. The overlay
must be representatve of the stack most commonly used in new projects.

## Decision

The first overlay is: Next.js 15 (App Router), Vercel (deployment), Prisma (ORM), Neon
Postgres (database), Vitest (unit tests), Playwright (E2E tests).

## Consequences

Instantiators using this stack get a working setup with no additional scaffolding. Projects
on different stacks (Flutter, Node/AWS, etc.) must delete overlay files and add their own.
A second overlay will be introduced when a project requires it, potentially with a setup.sh
to handle overlay selection on clone.
```

---

**`docs/adr/0004-opentofu-github-governance.md`**
```markdown
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
```

---

**`docs/adr/0005-phase-zero-gate.md`**
```markdown
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
```

---

## 14. Acceptance Criteria

The template is complete when all of the following are true:

**CI Gate:**
- [ ] Push to a blank repo cloned from the template produces green `commit-validation` status
- [ ] A commit with a non-conventional message fails `validate-commits` in Phase 0
- [ ] A malformed ADR fails `validate-adrs` in Phase 0 and blocks Phase 1
- [ ] Introducing a secret pattern fails `gitleaks` in Phase 0
- [ ] Invalid workflow YAML fails `actionlint` in Phase 0
- [ ] Invalid Prisma schema fails `prisma-migrate-check` in Phase 0
- [ ] Phase 1 jobs (typecheck, lint, test, build) all pass on the unmodified template

**Developer Experience:**
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts the Next.js dev server at localhost:3000
- [ ] `bash scripts/setup-hooks.sh` installs git hooks
- [ ] `git commit -m "bad message"` is rejected by commitlint hook
- [ ] `npx nx run-many -t test` passes
- [ ] `npx nx run-many -t typecheck` passes
- [ ] `npx nx run web-e2e:e2e` passes (smoke test)

**IaC:**
- [ ] `cd infra/github && tofu init` succeeds (after state bucket created)
- [ ] `tofu plan` produces expected output with no errors
- [ ] `tofu apply` sets branch protection, labels, and environments on GitHub

**ADR Governance:**
- [ ] `bash scripts/ci/validate-adrs.sh docs/adr` passes on the template's own 5 ADRs
- [ ] Modifying an ADR to remove `## Context` fails validation
- [ ] A tooling ADR with status=accepted missing `implementation:` field fails validation

**Pre-commit Hooks:**
- [ ] All hooks in `.pre-commit-config.yaml` run without errors on a clean repo state

---

## 15. First Instantiation: Market Denoising Engine

The Market Denoising Engine (MDE) is the first project instantiated from this template.
It validates the template's assumptions in a real project context.

### Instantiation Steps

```bash
# 1. Create repo from template
gh repo create ThomasGHenry/market-denoising-engine \
  --template ThomasGHenry/tgh-template \
  --public \
  --clone

cd market-denoising-engine

# 2. Install dependencies
npm install

# 3. Set up git hooks
bash scripts/setup-hooks.sh

# 4. Replace template identity
# - Rename all @template/* imports to @mde/*
# - Update package.json "name" fields
# - Update vercel.json if needed
# - Update README.md

# 5. Delete template's own ADRs, replace with MDE's
rm docs/adr/0001-snapshot-model.md
rm docs/adr/0002-aggregate-validator.md
rm docs/adr/0003-nextjs-vercel-prisma.md
rm docs/adr/0004-opentofu-github-governance.md
rm docs/adr/0005-phase-zero-gate.md
# Write MDE ADRs 0001 through 0005 per MDE PRD §15

# 6. Replace constitution placeholder
# Write .specify/memory/constitution.md for MDE

# 7. Replace Prisma schema with MDE data model
# Replace packages/db/prisma/schema.prisma with full MDE schema (PRD §11)
# Write packages/db/prisma/seed.ts with Engineer-Seller Batch 001 (PRD §18)

# 8. Add packages/scoring/
# Implement FitnessInput, FitnessResult, default_v0 formula
# Write unit tests with fast-check for formula invariants

# 9. Run first migration
npm run db:migrate

# 10. Push — first CI run should be green
git add -A
git commit -m "chore: instantiate from tgh-template for MDE"
git push
```

### What the Template Provides to MDE

| Concern | Template provides | MDE adds |
|---|---|---|
| CI gate | Full Phase 0 + aggregate | prisma-migrate-check already covers MDE schema |
| ADR governance | Format + validation | 5 MDE-specific ADRs |
| Issue templates | All 5 templates | Customized impact_area checkboxes |
| Pre-commit hooks | All hooks | Nothing additional |
| IaC | GitHub settings module | infra/app/ (Neon + optional Vercel config) |
| NX workspace | Full setup | packages/scoring/ added |
| Prisma | Stub schema + PrismaClient | Full MDE schema (PRD §11) |
| Next.js app | Scaffold | All pages from PRD §12 |
| Testing | Vitest + Playwright smoke | Scoring unit tests, domain tests |
| Renovate | Configured | Nothing additional |

### Expected Timeline from Clone to First Green Vertical Slice

| Phase | Duration | Milestone |
|---|---|---|
| Instantiation (steps 1-6) | 30 min | Green CI on renamed template |
| Prisma schema + migration | 1 hour | `db:migrate` succeeds, `db:studio` shows schema |
| packages/scoring | 2 hours | Unit tests pass, formula verified |
| First route (/generations CRUD) | 1 day | One working page with real data |
| Full vertical slice | 2 days | PRD §22 milestone complete |

---

## 16. Build Order

Implement in this order. Each step produces a green CI before the next begins.

```
Step 1: Repository skeleton
  - Create directory structure (all dirs, .gitkeep files)
  - package.json, nx.json, tsconfig.base.json, .nvmrc
  - apps/web/ scaffold (layout.tsx, page.tsx)
  - packages/{db,domain,ui,config}/ stubs
  Milestone: npm install succeeds

Step 2: Base governance layer
  - scripts/ci/ (all 6 scripts + BATS suites)
  - .gitleaks.toml
  - .pre-commit-config.yaml
  - commitlint.config.js
  - .github/ISSUE_TEMPLATE/ (5 templates)
  - .github/pull_request_template.md
  - .github/LABEL_TAXONOMY.md
  - DECISIONS.md
  - docs/adr/0000-template.md, README.md
  - .specify/memory/constitution.md (placeholder)
  Milestone: pre-commit hooks install and run clean

Step 3: Template ADRs
  - docs/adr/0001 through 0005
  Milestone: validate-adrs.sh exits 0

Step 4: 1-commit.yml
  - Write the full workflow per §11.1
  - Include all Phase 0 jobs, Phase 1 jobs, aggregate
  Milestone: Push to GitHub → green commit-validation

Step 5: IaC
  - infra/github/main.tf, variables.tf, outputs.tf, backend.tf
  - Create state bucket manually (GCS or R2)
  - Run tofu apply locally
  - infra.yml workflow
  Milestone: Branch protection live on GitHub, labels created

Step 6: Overlay workflows
  - .github/workflows/2-e2e.yml
  - .github/workflows/3-promote.yml
  - .github/workflows/incident.yml
  - .github/workflows/auto-triage.yml
  - .github/workflows/renovate.yml
  Milestone: Full workflow set committed, all validate on push

Step 7: Overlay testing setup
  - apps/web-e2e/playwright.config.ts
  - apps/web-e2e/src/smoke.spec.ts
  - vitest configs per package
  Milestone: npx nx run web-e2e:e2e passes locally

Step 8: Renovate configuration
  - renovate.json
  - RENOVATE_TOKEN secret created in GitHub
  Milestone: Renovate runs on schedule without error

Step 9: README
  - Usage instructions
  - Instantiation steps
  - Development workflow
  - Architecture overview
  Milestone: New contributor can clone and run in under 15 minutes

Step 10: Validate against MDE
  - Instantiate MDE per §15
  - Confirm all acceptance criteria pass in a real project context
  Milestone: MDE CI is green, first vertical slice complete
```

---

## 17. What Is Out of Scope

Do not build these during initial template implementation:

- **setup.sh or overlay selection mechanism** — one overlay means no ambiguity
- **Second overlay** (Flutter, Node/AWS) — add when a project needs it
- **Application infrastructure** (`infra/app/`) — instance-specific, not template concern
- **Nx Cloud** — adds complexity and cost; `nx affected` works without it
- **Coverage thresholds or ratcheting** — add when a project establishes a baseline
- **Mutation testing** (Stryker) — add per-project when unit test suite is stable
- **Visual regression testing** — add per-project when UI is stable
- **Accessibility gates** (axe-core, Lighthouse CI) — add per-project when UI exists
- **CODEOWNERS file** — solo projects, not needed
- **Dependabot** — Renovate handles this
- **CodeRabbit** — add per-project as a pre-push hook if desired
- **Spec kit enforcement in CI** (spec-coverage gate) — add per-project when spec kit is adopted

---

## 18. Evidence: Patterns Sourced From

Every significant decision is traceable to observed, working implementations.

| Pattern | Source | Location |
|---|---|---|
| Phase 0 governance gate | buen-vecino | `.github/workflows/commit-validation.yml` |
| Aggregate validator (`commit-validation` job) | buen-vecino | `.github/workflows/commit-validation.yml:196` |
| Three-layer validation (pre-commit / pre-push / CI) | buen-vecino | `scripts/ci/*.sh` + `.pre-commit-config.yaml` |
| BATS test coverage for shell scripts | buen-vecino + quality_examples | `scripts/ci/*.bats` |
| `workflow_run` deploy chaining | diane-v01, passive-symptom-tracker | `deploy-main.yml`, `2-dev-deploy.yml` |
| Aggregate as sole required status check | buen-vecino | `infra/github/main.tf:branch_protection` |
| OpenTofu for GitHub settings | buen-vecino, sin-gluten-nx | `infra/github/main.tf` |
| GCS remote state | buen-vecino, diane-v01 | `infra/github/backend.tf` |
| R2 remote state | sin-gluten-nx | `tools/infra/github/main.tf` |
| prevent_destroy on repo | buen-vecino | `infra/github/main.tf` |
| 4-digit ADR numbering | buen-vecino, sin-gluten-nx | `docs/adr/` |
| YAML frontmatter ADR format | buen-vecino | `docs/adr/` |
| ADR `implementation:` field for tooling | buen-vecino | `docs/adr/0001-adr-process-and-governance.md` |
| Bidirectional supersession validation | diane-v01 | `scripts/validate-adrs.sh` |
| DECISIONS.md for lightweight decisions | buen-vecino, sin-gluten-nx | `DECISIONS.md` |
| Issue templates with BDD acceptance scenarios | buen-vecino, sin-gluten-nx, passive | `.github/ISSUE_TEMPLATE/feature.yml` |
| Label taxonomy as managed code | buen-vecino | `infra/github/main.tf` |
| `blank_issues_enabled: false` | buen-vecino | `.github/ISSUE_TEMPLATE/config.yml` |
| DORA metrics via GitHub Deployments API | burnout-beacon, diane-v01 | `.github/workflows/incident.yml` |
| `bobheadxi/deployments@v1` | burnout-beacon, diane-v01 | Used in deploy + incident workflows |
| Renovate weekday-only schedule | buen-vecino | `renovate.yml` cron |
| Major updates → `needs-adr-review` label | buen-vecino | `renovate.json` packageRules |
| Renovate with fine-grained PAT | buen-vecino | `renovate.yml` (RENOVATE_TOKEN) |
| Conventional commits 72-char limit | buen-vecino | `.commitlintrc.json` |
| `npm ci --ignore-scripts` in CI | buen-vecino | All CI jobs |
| `@nx/enforce-module-boundaries` | buen-vecino | `eslint.config.mjs` |
| Squash-only + delete branch on merge | buen-vecino, sin-gluten-nx | `infra/github/main.tf` |
| Auto-triage on workflow failure | diane-v01, passive-symptom-tracker | `.github/workflows/auto-triage.yml` |
| Promote-by-reference deploy | buen-vecino | `scripts/deploy.sh` |
| Manual production confirmation | passive-symptom-tracker, flashlog | `5-prod-cutover.yml`, `release.yml` |
| prisma-migrate-check as Phase 0 gate | buen-vecino | `commit-validation.yml` |
| `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess` | buen-vecino | `tsconfig.base.json` |

---

## 19. Required Secrets

Document in `docs/github/secrets.md` after instantiation. Set manually in GitHub Settings →
Secrets and Variables → Actions.

| Secret | Used in | Source |
|---|---|---|
| `RENOVATE_TOKEN` | `renovate.yml` | GitHub fine-grained PAT |
| `TF_VAR_github_token` | `infra.yml` | GitHub fine-grained PAT (same or separate) |
| `VERCEL_TOKEN` | `3-promote.yml` | Vercel dashboard |
| `VERCEL_PREVIEW_URL` | `2-e2e.yml`, `3-promote.yml` | Set after first Vercel deploy |
| `DATABASE_URL_PROD` | `3-promote.yml` | Neon connection string (prod branch) |

For Tofu backend (set as environment variables in `infra.yml`):

| Env var | Backend |
|---|---|
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3` | Cloudflare R2 |
| `GOOGLE_CREDENTIALS` | GCS |

---

*End of handoff document.*
