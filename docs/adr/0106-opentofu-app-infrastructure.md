---
status: accepted
date: 2026-06-29
tags: [infrastructure, deployment, tooling]
implementation: infra/app/
---

# 0106. OpenTofu for Application Infrastructure Provisioning

## Context

ADR 0104 decided the deployment topology: Vercel (Next.js hosting) and Neon Postgres
(managed database). ADR 0004 scoped `infra/github/` exclusively to GitHub governance
and explicitly reserved application infrastructure for a separate `infra/app/` module.

Without IaC, provisioning Vercel projects, Neon databases, and their wiring is a manual
click-through process that is not auditable, not repeatable, and not reviewable. Secrets
end up in undocumented locations. A second environment (staging, contributor fork) requires
rediscovering all the steps.

The deploy chain (ADR 0006) requires a `VERCEL_PREVIEW_URL` secret on the `preview`
GitHub environment and `DATABASE_URL_PROD` / `VERCEL_TOKEN` on the `production` environment.
These must exist before the chain can function end-to-end.

Bootstrap credentials (a Vercel personal token and a Neon API key) must pre-exist to
authenticate the Tofu providers. These cannot themselves be provisioned by Tofu. They are
stored in Bitwarden (`thomasghenry-vercel-token`, `buenvecino-neon-api-key`) and supplied
to Tofu via a gitignored `terraform.tfvars` file.

## Decision

Application infrastructure is managed as OpenTofu code in `infra/app/`. The module
provisions:

- A Neon project for MDE with two connection strings: a pooled `DATABASE_URL` (PgBouncer,
  `?pgbouncer=true&connection_limit=1`) for runtime, and `DATABASE_URL_UNPOOLED` for
  Prisma migrations. Both follow the requirements in ADR 0104.
- A Vercel project linked to the GitHub repository with framework preset `nextjs` and
  build command `npx nx run web:build`.
- Vercel environment variables wired from Neon outputs: `DATABASE_URL` and
  `DATABASE_URL_UNPOOLED` set on all environments (production, preview, development).
- Output values for `vercel_project_url` (the stable preview alias) and `vercel_token`
  (passed through from input) to be manually set as GitHub secrets after `tofu apply`.

GitHub secrets (`VERCEL_PREVIEW_URL`, `VERCEL_TOKEN`, `DATABASE_URL_PROD`) are NOT
managed by Tofu. The `infra/github/` module manages GitHub environments (already
provisioned); secrets within those environments are set manually after `tofu apply`
using the output values. This boundary avoids storing sensitive output in Tofu state.

The `infra/app/` module is not wired into `infra.yml`. It is applied manually on first
provision and on deliberate infrastructure changes. Drift detection is out of scope for
a solo-operator system.

Bootstrap variables (`vercel_token`, `neon_api_key`) are supplied via
`infra/app/terraform.tfvars`, which is gitignored. Values are sourced from Bitwarden.

## Consequences

Provisioning is auditable (code review), repeatable (anyone with BW access can apply),
and documented (this ADR + the module itself). A second environment requires only a new
`terraform.tfvars` with different credentials.

Tofu state for `infra/app/` is stored locally (`.terraform/` gitignored) on first use.
Remote state backend is deferred — acceptable for a solo-operator project where a single
applier is the norm.

GitHub secrets remain outside Tofu state, which avoids plaintext secrets in state files
but requires a manual step after every `tofu apply` that changes output values.

The `infra/app/` module is intentionally not auto-applied in CI. Infrastructure changes
are infrequent and consequential enough to warrant deliberate human invocation.
