# Runbook: Create GitHub OAuth App

Agentic runbook. Execute by telling Claude: "run the create-github-oauth-app runbook".

## Context

MDE uses Auth.js v5 with GitHub OAuth for solo-operator authentication. GitHub does not
expose OAuth App creation via API or Terraform — it must be done through the web UI.
This runbook automates that step using browser tools and stores credentials in Bitwarden.

See ADR 0107 for provider decision rationale.

## Prerequisites

- Logged into github.com as `ThomasGHenry` in Chrome
- Bitwarden vault unlocked (use `mcp__bitwarden__*` tools)
- Production Vercel URL known: `https://market-denoising-engine.vercel.app`

## Steps

### 1. Create the OAuth App on GitHub

Navigate to: `github.com/settings/developers`

Find the OAuth Apps section and create a new OAuth App with:
- **Application name**: `market-denoising-engine`
- **Homepage URL**: `https://market-denoising-engine.vercel.app`
- **Authorization callback URL**: `https://market-denoising-engine.vercel.app/api/auth/callback/github`

Register the application.

### 2. Capture the Client ID

After registration, the Client ID is shown on the app page. Read it.

### 3. Generate and capture the Client Secret

Click "Generate a new client secret". Read the secret value immediately — GitHub shows
it only once.

### 4. Generate AUTH_SECRET

Run in terminal:

```bash
openssl rand -hex 32
```

Capture the output.

### 5. Store all three credentials in Bitwarden

Create or update a Bitwarden secure note named `mde-auth-secrets` with:
- `AUTH_GITHUB_ID`: the Client ID from step 2
- `AUTH_GITHUB_SECRET`: the client secret from step 3
- `AUTH_SECRET`: the openssl output from step 4

### 6. Set GitHub Actions secrets

Navigate to: `github.com/ThomasGHenry/market-denoising-engine/settings/secrets/actions`

Create or update three repository secrets:
- `TF_VAR_auth_github_id` → value from step 2
- `TF_VAR_auth_github_secret` → value from step 3
- `TF_VAR_auth_secret` → value from step 4

### 7. Verify

Confirm all three secrets appear in the repository secrets list.

Report the Client ID (safe to show) and confirm the secret and AUTH_SECRET were stored
without displaying their values.

## Re-running this runbook

If credentials are rotated or lost:
- Delete the existing GitHub OAuth App client secret and generate a new one (step 3)
- Repeat steps 4–6 with the new values
- Tofu will pick up the new values on next push to main via the `infra.yml` workflow

## Local development

For local dev, add to `apps/web/.env.local` (gitignored):

```
AUTH_GITHUB_ID=<client id>
AUTH_GITHUB_SECRET=<client secret>
AUTH_SECRET=<openssl rand -hex 32 — generate a separate one for local>
AUTH_URL=http://localhost:3000
```

The same OAuth App covers local dev — add `http://localhost:3000/api/auth/callback/github`
to the app's callback URL list on GitHub if not already present.
