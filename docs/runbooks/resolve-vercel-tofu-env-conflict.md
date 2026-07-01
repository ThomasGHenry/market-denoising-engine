# Runbook: Resolve Vercel Env Var Tofu Conflict

## Context

Tofu manages Vercel environment variables via `infra/app/main.tf`. If a variable is
manually added through the Vercel dashboard or API before Tofu declares it, the
`infra.yml` workflow fails with:

```
Error: ENV_CONFLICT
```

This happened on 2026-07-01 when a subagent manually added `E2E_MODE` to the Vercel
preview environment to test the magic-link sentinel, then Tofu tried to create the
same variable.

## Prerequisites

- Vercel API token in Bitwarden under `mde-vercel-secrets` (field: `VERCEL_TOKEN`)
- Vercel project ID: `prj_zY3GKAFzEtiU4z36Vn4YnarqRffM`
- Vercel team ID: `team_caO6qCsE9CqPtrq520mXicUX`

## Steps

### 1. Identify the conflicting variable

Run the Tofu plan to see which variable is conflicting:

```bash
# from infra/app/
tofu plan
```

Note the variable key from the ENV_CONFLICT error.

### 2. List env vars via Vercel API to find the ID

```bash
VERCEL_TOKEN=<token from Bitwarden>
curl -sf \
  "https://api.vercel.com/v9/projects/prj_zY3GKAFzEtiU4z36Vn4YnarqRffM/env?teamId=team_caO6qCsE9CqPtrq520mXicUX" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | jq '.envs[] | select(.key == "E2E_MODE") | {id, key, target}'
```

Replace `E2E_MODE` with the conflicting key. Note the `id` field (format: `tXXXXXXXXXX`).

### 3. Delete the manually-added variable

```bash
curl -sf -X DELETE \
  "https://api.vercel.com/v9/projects/prj_zY3GKAFzEtiU4z36Vn4YnarqRffM/env/<ID>?teamId=team_caO6qCsE9CqPtrq520mXicUX" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

### 4. Trigger Tofu apply

Push any change to `infra/app/main.tf` (or re-run the `Infrastructure` workflow via
workflow_dispatch) to apply Tofu and recreate the variable under Tofu management.

Alternatively, run locally:

```bash
cd infra/app
tofu apply
```

### 5. Verify

```bash
curl -sf \
  "https://api.vercel.com/v9/projects/prj_zY3GKAFzEtiU4z36Vn4YnarqRffM/env?teamId=team_caO6qCsE9CqPtrq520mXicUX" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | jq '.envs[] | select(.key == "E2E_MODE") | {id, key, target}'
```

The variable should now appear with the target(s) declared in `main.tf`.

## Prevention

Never add Vercel env vars through the Vercel dashboard or API for variables already
declared in `infra/app/main.tf`. Always add them to `main.tf` and let Tofu manage
creation.

If a variable must be set immediately (before a Tofu cycle), note it in a comment in
`main.tf` so it's clear a conflict will occur, and delete the manual entry before
running Tofu.
