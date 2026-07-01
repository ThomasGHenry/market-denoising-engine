# Runbook: Check Vercel Deployment Status

## Context

When E2E tests fail or the production app behaves unexpectedly, the first diagnostic step
is confirming which deployment is live and whether it reached READY state. This runbook
covers API-based status checks used during the 2026-07-01 E2E debugging session.

## Prerequisites

- Vercel API token in Bitwarden under `mde-vercel-secrets` (field: `VERCEL_TOKEN`)
- Vercel project ID: `prj_zY3GKAFzEtiU4z36Vn4YnarqRffM`
- Vercel team ID: `team_caO6qCsE9CqPtrq520mXicUX`

## Check current production deployment

```bash
VERCEL_TOKEN=<from Bitwarden>
curl -sf \
  "https://api.vercel.com/v6/deployments?teamId=team_caO6qCsE9CqPtrq520mXicUX&projectId=prj_zY3GKAFzEtiU4z36Vn4YnarqRffM&target=production&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | jq '{url: .deployments[0].url, state: .deployments[0].state, created: .deployments[0].created}'
```

`state` should be `READY`. If `ERROR` or `BUILDING`, the production deploy failed.

## Check deployment for a specific git SHA

Used to confirm the E2E test is hitting the right build:

```bash
SHA="<git sha>"
curl -sf \
  "https://api.vercel.com/v6/deployments?teamId=team_caO6qCsE9CqPtrq520mXicUX&sha=${SHA}&state=READY&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | jq '{url: .deployments[0].url, state: .deployments[0].state}'
```

## Check environment variables on current production deployment

Used to confirm an env var (e.g. `E2E_MODE`) is present before running E2E against production:

```bash
curl -sf \
  "https://api.vercel.com/v9/projects/prj_zY3GKAFzEtiU4z36Vn4YnarqRffM/env?teamId=team_caO6qCsE9CqPtrq520mXicUX" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | jq '.envs[] | {key, target, type}'
```

## Check runtime logs for a specific deployment

Navigate to Vercel dashboard → project → Deployments → select deployment → Functions tab.

For the magic-link sentinel debugging, the key log line to look for on a POST to
`/api/auth/sign-in/magic-link` is whether `sendMagicLinkEmail` wrote a sentinel or
called Resend. Logs are only retained for 1 hour on Vercel Hobby/Pro.

## Notes

- Production URL: `https://market-denoising-engine-thomas-g-henry-llc.vercel.app`
- Preview deployments use per-branch URLs: `market-denoising-engine-git-<branch>-thomas-g-henry-llc.vercel.app`
- `E2E_MODE=true` is set on both `preview` and `production` targets (as of PR #54)
- `BETTER_AUTH_URL` must be set on production for GitHub OAuth callbacks to work correctly
