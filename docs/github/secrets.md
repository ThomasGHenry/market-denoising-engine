# Required Secrets

## GitHub Actions

| Secret | Required by | Description |
|---|---|---|
| `VERCEL_TOKEN` | `3-promote.yml` | Vercel CLI authentication |
| `VERCEL_PREVIEW_URL` | `2-e2e.yml`, `3-promote.yml` | Vercel project preview alias URL |
| `DATABASE_URL_PROD` | `3-promote.yml` | Production database connection string |
| `RENOVATE_TOKEN` | `renovate.yml` | Fine-grained PAT for Renovate PRs |
| `TF_VAR_github_token` | `infra.yml` | GitHub token for OpenTofu GitHub provider |

## OpenTofu State Backend

Configure in `infra/github/backend.tf` before running `tofu init`.
See backend.tf for GCS or Cloudflare R2 options.
