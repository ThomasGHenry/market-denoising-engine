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

Bootstrap variables (`vercel_token`, `neon_api_key`) are supplied via GitHub Actions
secrets (`TF_VAR_vercel_token`, `TF_VAR_neon_api_key`). OpenTofu reads `TF_VAR_*`
environment variables automatically. Locally, values are sourced from Bitwarden and
exported before running `tofu plan` or `tofu apply`.

Both `infra/github/` and `infra/app/` store state in a Cloudflare R2 bucket
(`mde-tofu-state`) via the OpenTofu `s3` backend. R2 implements the S3 protocol, so
the `s3` backend works against R2 with no AWS account involved. The env vars
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are S3-backend conventions; they hold
the R2 access key ID and secret, not AWS credentials. The endpoint is overridden to
`https://f6c1744bbffb823f40e0e8abc9555cf2.r2.cloudflarestorage.com`. State paths:
`github/terraform.tfstate` and `app/terraform.tfstate`. R2 credentials are stored in
Bitwarden as `mde-r2-tofu-state` and set as GitHub secrets `CF_R2_ACCESS_KEY_ID` and
`CF_R2_SECRET_ACCESS_KEY`.

`infra.yml` runs `tofu apply -auto-approve` for both modules on every push to main that
touches `infra/**`. Plan output is posted as a PR comment on pull requests.

## Consequences

Provisioning is auditable (code review), repeatable (CI applies on merge), and
documented (this ADR + the module itself). All credentials flow through GitHub secrets;
no local credential files are required to deploy.

GitHub secrets (`VERCEL_PREVIEW_URL`, `VERCEL_TOKEN`, `DATABASE_URL_PROD`) remain
outside Tofu state to avoid plaintext secrets in state files. These require a manual
step after any `tofu apply` that changes output values.

Infrastructure changes are applied automatically on merge to main. This is intentional:
the same discipline applied to application code applies to infrastructure.
