# Auth Setup Retrospective: Auth.js v5 + GitHub OAuth + Resend Magic Link

**Project:** market-denoising-engine (MDE)
**Stack:** Next.js 15 (App Router) · Vercel · Prisma · Neon (Postgres) · Auth.js v5 · Resend · OpenTofu
**Date:** 2026-06-30
**Written for:** Template reuse — this document should live in `nextjs-vercel-prisma` so new projects get it from day zero.

---

## TL;DR

- Auth is infrastructure for fully-protected apps. Set it up on day zero, before any feature work. A 21-commit unmerged auth branch with E2E tests expecting `/login` on main is a sequencing failure, not a feature gap.
- Use `onboarding@resend.dev` as `AUTH_EMAIL_FROM` first. It works out of the box with zero DNS setup. Prove the full end-to-end flow works in production before touching custom domain verification.
- GitHub OAuth App creation has no Terraform/OpenTofu resource. It is manual, always. Register it before any OAuth-dependent deployments.
- Resend domain verification is async and opaque. `capabilities.sending: "enabled"` in the API response does NOT mean the domain is verified. `statusCode: 403 "The domain is not verified"` is what you get on send attempts. The verifier runs on its own schedule with no webhook or ETA.
- Add an hourly `GET /domains/{id}` GitHub Actions job on day one. Domain verification can silently revert. Magic links will stop working in production with no user-visible error and no alert.

---

## 1. The Sequencing Mistake

MDE was built first, then auth was added as a feature ticket (`feat/auth-github-oauth`, 21 commits, never merged). Meanwhile, E2E smoke tests were written against a `/login` page with email input — a UI that existed only on the unmerged branch, not on `main`. This produced five consecutive CI failures on `main` from tests asserting behavior against code that was not there.

The root cause is a category error: auth was treated as a feature when it is infrastructure.

For a fully-protected application where every route requires authentication and there is no public surface, auth is the front door. You cannot usefully build, test, or deploy any route before the door exists. Every E2E test, every preview deployment, every smoke check assumes auth works. Building the house first and adding the door as ticket #25 means:

- E2E tests either cannot be written (no login to set up sessions) or get written against a branch that is not on `main`
- CI failures pile up on `main` from tests expecting auth infrastructure that does not exist there
- The auth branch accumulates commits while `main` diverges, making the eventual merge larger and riskier
- Preview deployments are unauthenticated and expose data

The rule: if every route in the application requires authentication, auth ships in commit one, before any route is implemented.

---

## 2. Auth-First Day-Zero Checklist

For any project where all routes require auth, execute this sequence before writing any application routes:

1. **Generate `AUTH_SECRET`** — `openssl rand -hex 32`. Store in Bitwarden. Set in `.env.local`. Do not skip this; Auth.js v5 will not start without it.
2. **Set `AUTH_EMAIL_FROM = 'App <onboarding@resend.dev>'`** — use Resend's own domain first. Zero DNS work. See section 4.
3. **Get a Resend API key** — resend.com → API Keys → Create API Key. Store in Bitwarden as `AUTH_RESEND_KEY`. Add to `.env.local`.
4. **Wire Auth.js v5** — install `next-auth@beta`, `@auth/prisma-adapter`, add `packages/db` schema tables (Account, Session, User, VerificationToken), run migration. See section 7 for why the DB adapter is required for magic link.
5. **Wire middleware** — `middleware.ts` at the repo root using `auth` from `./apps/web/src/lib/auth.config` (edge-safe config only; full auth with PrismaAdapter cannot run on the edge).
6. **Build the `/login` page** — minimal: email input, submit button, optional GitHub button (presence-gated on `AUTH_GITHUB_ID`).
7. **Deploy to Vercel** — set `AUTH_SECRET` and `AUTH_RESEND_KEY` and `AUTH_URL` in Vercel env vars. Confirm magic link email arrives using `onboarding@resend.dev`.
8. **Create GitHub OAuth App** (production only, optional) — see section 5. Set `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` in Vercel Production scope only.
9. **Write E2E auth helper** — POST to `/api/auth/signin/email`, then query `VerificationToken` table to get the token, navigate to `/api/auth/callback/email?token=...&email=...`. No Credentials provider needed.
10. **Verify custom domain** — only after step 7 confirms the full flow works. See sections 6 and 8.
11. **Add monitoring** — GitHub Actions `GET /domains/{id}` on an hourly schedule. See section 10.

---

## 3. The Auth.js v5 Edge-Safe Config Split

Auth.js v5 with `PrismaAdapter` cannot run on the Next.js edge runtime. Middleware runs on the edge. This requires splitting auth into two files:

**`apps/web/src/lib/auth.config.ts`** — edge-safe, no Node.js imports, no adapter:

```typescript
import type { NextAuthConfig } from 'next-auth'

export function isAllowedEmail(email: string): boolean {
  return email === 'thomasghenry@gmail.com'
}

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  trustHost: true,
  callbacks: {
    authorized: function authorizedCallback({ auth }) {
      const email = auth?.user?.email
      if (!email) return false
      return isAllowedEmail(email)
    },
  },
}
```

**`apps/web/src/lib/auth.ts`** — full auth with adapter and providers, Node.js runtime only:

```typescript
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { authConfig } from './auth.config'

function buildAuthPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? ''
  const pgAdapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter: pgAdapter })
}

function buildProviders() {
  const from = process.env.AUTH_EMAIL_FROM ?? 'App <onboarding@resend.dev>'
  const providers = [Resend({ from })]
  if (process.env.AUTH_GITHUB_ID) providers.push(GitHub)
  return providers
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(buildAuthPrismaClient()),
  providers: buildProviders(),
})
```

**`apps/web/middleware.ts`** — imports from `auth.config`, not from `auth`:

```typescript
import NextAuth from 'next-auth'
import { authConfig } from './src/lib/auth.config'

const { auth } = NextAuth(authConfig)
export default auth
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
```

If middleware imports from `auth.ts` (which imports `@prisma/adapter-pg`), the build fails with: `Module not found: Can't resolve 'net'` (or similar Node.js core module errors). This is not a Prisma bug — it is correct behavior: Node.js modules cannot run on the edge.

**`trustHost: true`** is required for Vercel preview deployments. Without it, Auth.js rejects requests from non-canonical hosts and every preview deployment login fails with a CSRF error or silent redirect loop.

---

## 4. The `onboarding@resend.dev` Trick — Use It First

`apps/web/src/lib/auth.ts` has this line:

```typescript
const from = process.env.AUTH_EMAIL_FROM ?? 'MDE <onboarding@resend.dev>'
```

`onboarding@resend.dev` is Resend's own sender domain. It works immediately with any valid Resend API key. No DNS setup. No domain verification. No waiting for async verifiers. No Dreamhost panel. No TXT records.

The mistake in this project: `AUTH_EMAIL_FROM` was set to `MDE <auth@thomasghenry.com>` in Tofu on day one, before `thomasghenry.com` was verified in Resend. This meant every production magic link attempt failed with `statusCode: 403 "The domain is not verified"` until the custom domain verification was complete — a multi-hour process involving async Resend verifiers and Dreamhost panel navigation.

The correct sequence:

1. Ship with `AUTH_EMAIL_FROM` absent from Tofu (or set to the `onboarding@resend.dev` default).
2. Confirm a production magic link email arrives end-to-end.
3. Verify the custom domain in Resend (see section 6) and update DNS in Dreamhost (see section 8).
4. After verification is confirmed via `GET /domains/{id}` returning `status: "verified"`, update `AUTH_EMAIL_FROM` in Tofu to `App <auth@yourdomain.com>` and run `tofu apply`.
5. Verify again that production magic links arrive from the custom domain.

Custom domain email is a cosmetic improvement, not a day-zero requirement.

---

## 5. GitHub OAuth Setup

### What can be IaC'd and what cannot

There is no Terraform/OpenTofu resource for creating a GitHub OAuth App. This is a deliberate platform restriction, confirmed by the `integrations/github` provider docs and open issues. The web UI is the only path.

GitHub **Apps** can be managed via API, but they are not the same as OAuth Apps and the Auth.js `GithubProvider` works with OAuth Apps. Migrating to a GitHub App (which supports up to ten callback URLs, useful for multi-environment) is possible but requires `@octokit/auth-app` and additional setup not covered by the built-in Auth.js provider.

### Manual steps (web UI only)

1. Navigate to `github.com/settings/developers` → OAuth Apps → New OAuth App.
2. **Application name:** anything (e.g. `market-denoising-engine`)
3. **Homepage URL:** `https://your-canonical-vercel-url.vercel.app`
4. **Authorization callback URL:** `https://your-canonical-vercel-url.vercel.app/api/auth/callback/github`

The callback URL must be exact. A trailing slash, `http` instead of `https`, or a preview URL instead of the canonical production URL will produce `redirect_uri_mismatch` on login.

5. Click Register application.
6. Copy the Client ID from the app page.
7. Click "Generate a new client secret". Copy the secret immediately — GitHub shows it only once.
8. Generate `AUTH_SECRET` separately: `openssl rand -hex 32`. This is Auth.js's own secret, not GitHub's. Use a different value for local dev vs production.
9. Store Client ID, Client Secret, and AUTH_SECRET in Bitwarden.
10. Set as GitHub Actions repository secrets: `TF_VAR_auth_github_id`, `TF_VAR_auth_github_secret`, `TF_VAR_auth_secret`. Tofu reads these on deploy.

### Production-only scoping

`AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` must be set in the Vercel **Production** environment scope only, not Preview or Development. This is how the presence-gate in `buildProviders()` works: Vercel Preview deployments don't have these variables, so `providers.push(GitHub)` never runs in preview, and the login page shows only the magic link option. No `VERCEL_ENV` or `NODE_ENV` checks in code are needed.

### Multi-account machines

On a machine with two GitHub accounts (`ThomasGHenry` personal and `ThomasGHenry-a` Agora), stale `GH_TOKEN` in tmux panes causes pushes to authenticate as the wrong account. Old panes inherit whatever token was set when the pane was opened.

Always clear the token before pushing from a new project:

```bash
env -u GH_TOKEN git push
env -u GH_TOKEN git push -u origin branch-name
```

The OAuth App must be created while logged in as the account that owns the repository (`ThomasGHenry` for personal projects). The GitHub CLI defaults to the account configured in `~/.config/gh`. For Agora operations, scope with `GH_CONFIG_DIR=~/.config/gh-agora`.

### When the canonical URL changes

If the Vercel project URL changes (team slug, custom domain, project rename), the OAuth App callback URL must be updated manually:

1. `github.com/settings/developers` → OAuth Apps → your app
2. Update **Authorization callback URL** to the new canonical URL + `/api/auth/callback/github`
3. Update `AUTH_URL` in `infra/app/main.tf` to match
4. Update Homepage URL
5. Run `tofu apply`

There is no automation for this.

---

## 6. Resend Domain Verification — The Async Verifier

### The `capabilities.sending` trap

The Resend API returns a domain object with two distinct fields:

```json
{
  "status": "pending",
  "capabilities": {
    "sending": "enabled"
  }
}
```

`capabilities.sending: "enabled"` does NOT mean the domain is verified and ready to send. It means sending is enabled as a feature for the domain object — a capacity indicator, not a verification status. The field that controls whether sends succeed is `status`. Until `status === "verified"`, any send attempt returns:

```json
{
  "statusCode": 403,
  "message": "The domain is not verified.",
  "name": "validation_error"
}
```

This response goes into Resend's own error response, not into your application error handling. The magic link silently fails — no email arrives, no error is shown to the user, and the `/login` page shows the generic "Check your email" message. This is the worst failure mode: silent and misleading.

### Three records, all required

Resend requires three DNS records. Until all three individually reach `verified` status, the domain `status` stays `pending`. Partial verification does nothing.

| Record | Type | Host/Name | Purpose |
|---|---|---|---|
| DKIM | TXT | `resend._domainkey.yourdomain.com` | Proves the email was signed by Resend's sending infrastructure. Without this, receiving mail servers will fail DKIM checks and may reject or junk the message. |
| Bounce MX | MX | `send.yourdomain.com` | Routes bounce notifications (undeliverable emails) to Resend via Amazon SES `feedback-smtp.us-east-1.amazonses.com`. MX priority `10`. |
| SPF | TXT | `send.yourdomain.com` | Authorizes Amazon SES to send on behalf of the `send.` subdomain. Value: `v=spf1 include:amazonses.com ~all` |

The `send.` subdomain is for bounce handling only. It is entirely independent of the root domain's MX records. If Dreamhost or another provider hosts email for `yourdomain.com` (e.g. `mx1.mailchannels.net`, `mx2.mailchannels.net`), those root MX records must NOT be touched. Resend only needs `send.yourdomain.com` MX, not `yourdomain.com` MX.

### Verification is async and runs on its own schedule

`POST /domains/{id}/verify` queues a background verification check. It does not block, does not return the new status, and does not give an ETA. Resend's verifier runs in passes on its own schedule — approximately every few minutes, but not guaranteed.

During this project:
- DKIM showed `verified` briefly, then reverted to `pending`. This is not a DNS caching issue — Resend's verifier had seen the record, then re-checked and (likely due to timing or TTL) reported it unverified again.
- SOA minimum TTL for the root domain was 60 seconds, meaning negative DNS cache was not the bottleneck. The async verifier was.
- Total time from adding DNS records to `status: "verified"`: variable. Cannot be predicted.

The only reliable method to know if verification succeeded is polling `GET /domains/{id}` and checking `status`. Do not assume that clicking "Verify" in the Resend dashboard or calling the verify API means it will be verified in the next five minutes.

### Polling for verification

```bash
curl -s -H "Authorization: Bearer $RESEND_API_KEY" \
  "https://api.resend.com/domains/<domain-id>" \
  | jq '{status: .status, dkim: .records[] | select(.record_type == "DKIM") | .status, spf: .records[] | select(.record_type == "SPF") | .status}'
```

Check `status` at the top level, not `capabilities.sending`. Check individual record statuses to diagnose which record is blocking. All three records must show `verified` before the domain `status` flips.

---

## 7. Auth.js v5 + Prisma Adapter — Why Magic Link Requires a Database

JWT sessions (configured via `session: { strategy: 'jwt' }`) do not require a database. The session state is encoded in a cookie signed with `AUTH_SECRET`. This works for GitHub OAuth — after the OAuth callback, Auth.js creates a JWT session and the user is logged in with no database access needed.

Magic link (passwordless email) cannot use JWT sessions alone. The flow:

1. User submits email → Auth.js generates a one-time token and a hashed version of it.
2. Auth.js sends the token to the user's email via Resend.
3. Auth.js stores the hashed token in the `VerificationToken` table with an expiry.
4. User clicks the link → browser GETs `/api/auth/callback/email?token=...&email=...`
5. Auth.js retrieves the stored hash from `VerificationToken`, verifies the token matches, deletes the row, creates a session.

Between steps 2 and 5, the server that handled step 2 may have been replaced by a new instance (serverless functions have no shared memory). The token must persist in a database.

`@auth/prisma-adapter` adds four Prisma models:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Neon + pgbouncer + PrismaAdapter

Neon provides two connection strings:
- `DATABASE_URL` — pooled via PgBouncer (`?pgbouncer=true&connection_limit=1`). Use for application queries.
- `DATABASE_URL_UNPOOLED` — direct connection, no pooler.

`PrismaAdapter` requires the unpooled connection. PgBouncer in transaction mode (Neon's default) does not support `SET LOCAL` or advisory locks that Prisma's adapter uses internally. The adapter will fail with cryptic errors or silently fail to write `VerificationToken` rows if given the pooled URL.

The auth client must be built with the unpooled URL:

```typescript
function buildAuthPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? ''
  const pgAdapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter: pgAdapter })
}
```

`DATABASE_URL_UNPOOLED` must be set in all Vercel environment scopes where auth runs. If only `DATABASE_URL` is set, the fallback to pooled will fail intermittently under the PrismaAdapter.

### Session strategy after adding the adapter

When `PrismaAdapter` is added to `NextAuth`, the default session strategy changes from `jwt` to `database`. To keep JWT sessions (which work with the GitHub OAuth flow and avoid database reads on every request), explicitly set `session: { strategy: 'jwt' }` in `authConfig`. Do not rely on the default.

---

## 8. Dreamhost-Specific DNS Gotchas

Dreamhost requires specific navigation to add MX records for a subdomain. These steps are not obvious from the panel.

### Gotcha 1: Subdomain must exist before MX can be added

Dreamhost's Custom MX editor (`panel.dreamhost.com/panel?tree=mail.mx`) is a root-domain editor by default. There is no UI for adding MX records scoped to `send.yourdomain.com` unless `send.yourdomain.com` exists as a hosted entry in the Websites section.

To register the subdomain:
1. Navigate to `panel.dreamhost.com` → Websites → Add a Website.
2. Select "DNS Only" (not a full hosting plan).
3. Enter `send.yourdomain.com` as the domain name.
4. Save.

Only after this step does the Custom MX editor show `send.yourdomain.com` as a selectable domain.

### Gotcha 2: Custom MX editor navigation

The Custom MX editor cannot be reached by directly navigating to `panel.dreamhost.com/panel#/website-adding/website/domain` — that URL returns "Not Found" if the router state is not populated. Navigate first:

1. `panel.dreamhost.com/panel?tree=domain.dashboard#/list-view`
2. Then `panel.dreamhost.com/panel?tree=mail.mx`

Select `send.yourdomain.com` from the dropdown. The dropdown will not show the subdomain unless it was registered in Gotcha 1.

### Gotcha 3: Dreamhost API does not support MX records for subdomains

`POST /dns-add_record` with `type=MX` returns `invalid_type` for subdomain MX records. The Dreamhost API documentation does not call this out explicitly. Use the panel UI.

### Gotcha 4: Dreamhost live chat rejects the `→` character

If you need to contact Dreamhost support via live chat, the subject line field rejects the Unicode right arrow (`→`, U+2192). Remove it from the subject. The body of the message is not affected.

### Gotcha 5: Root domain MX is sacred

If Dreamhost hosts email for `yourdomain.com`, the root domain MX records point to Dreamhost's mail servers (commonly `mx1.mailchannels.net` and `mx2.mailchannels.net`). Do NOT modify these. Resend only requires MX on `send.yourdomain.com`, not `yourdomain.com`. Modifying the root MX will break all email to `@yourdomain.com`.

### Summary: adding the three Resend records in Dreamhost

| Record | Dreamhost section | Name field | Value |
|---|---|---|---|
| DKIM TXT | DNS → Custom DNS → Add TXT | `resend._domainkey` (Dreamhost appends `.yourdomain.com`) | DKIM public key from Resend dashboard |
| Bounce MX | Custom MX editor (after registering `send.yourdomain.com` as DNS-only) | Select `send.yourdomain.com` | `10 feedback-smtp.us-east-1.amazonses.com` |
| SPF TXT | DNS → Custom DNS → Add TXT | `send` | `v=spf1 include:amazonses.com ~all` |

---

## 9. IaC Coverage Map

### What OpenTofu manages (`infra/app/main.tf`)

| Resource | Provider | Notes |
|---|---|---|
| Neon project + database | `kislerdm/neon` | `mde` database, `mde_owner` role, Postgres 17 |
| `DATABASE_URL` (pooled) | Vercel env var | Built from Neon outputs |
| `DATABASE_URL_UNPOOLED` | Vercel env var | Required for PrismaAdapter |
| `AUTH_SECRET` | Vercel env var | `openssl rand -hex 32`, stored in Bitwarden |
| `AUTH_URL` | Vercel env var | Canonical Vercel production URL, Production scope only |
| `AUTH_GITHUB_ID` | Vercel env var | Client ID from GitHub OAuth App, Production scope only |
| `AUTH_GITHUB_SECRET` | Vercel env var | Client Secret from GitHub OAuth App, Production scope only |
| `AUTH_RESEND_KEY` | Vercel env var | Resend API key, Production + Preview |
| `AUTH_EMAIL_FROM` | Vercel env var | `MDE <auth@thomasghenry.com>` after domain verified |
| Vercel project + git integration | `vercel/vercel` | Linked to GitHub repo |

### What is manual (one-time, not in Tofu)

| Item | Why not in Tofu | Where documented |
|---|---|---|
| Dreamhost DNS records (DKIM TXT, Bounce MX, SPF TXT) | 10-year stable account; community Dreamhost provider does not exist; one-time operation | `docs/runbooks/setup-resend-domain.md` |
| Resend domain verification | `armaaar/resend` provider `resend_domain` resource was added then removed — provider had state drift issues with async verification status | `docs/runbooks/setup-resend-domain.md` |
| GitHub OAuth App creation | No `github_oauth_app` resource in `integrations/github` provider; confirmed by provider docs | `docs/runbooks/create-github-oauth-app.md` |
| Bitwarden secret storage | Bitwarden MCP is used interactively; no automation path | `docs/runbooks/create-github-oauth-app.md` |

### Why the Resend provider was removed from Tofu

The `armaaar/resend` Terraform provider was briefly included in `infra/app/main.tf` as `resend_domain` to manage domain verification. It was removed because:

1. The `resend_domain` resource cannot reliably represent the async verification state. Tofu `apply` would complete before Resend's verifier ran, leaving the resource in `pending` state. Subsequent `plan` runs would show drift.
2. The DNS records are in Dreamhost, which is not in Tofu, so the dependency chain across two state files was untracked.
3. The one-time nature of domain verification does not justify a Tofu resource that will never be destroyed or recreated in normal operations.

The provider block (`resend = { source = "registry.terraform.io/armaaar/resend" }`) remains in `main.tf` for the `AUTH_RESEND_KEY` env var but the `resend_domain` resource was removed. See git log commit `caf49ca3` for the removal.

---

## 10. Monitoring Gap and Fix

After Resend domain verification completes, there is no alert if:
- The domain flips back from `verified` to `pending` (this happened during setup — DKIM briefly verified then reverted)
- DNS records are deleted from Dreamhost (account action, fat-finger, provider issue)
- The Resend API key is revoked or expires

In all three cases, production magic links silently fail. The user sees "Check your email" and no email arrives. There is no server error log entry at the application level — the failure occurs inside Resend's infrastructure and returns a 403 that Auth.js logs but does not surface to the user.

### Fix: Hourly GitHub Actions check

Add to `.github/workflows/`:

```yaml
name: resend-domain-health

on:
  schedule:
    - cron: '0 * * * *'
  workflow_dispatch:

jobs:
  check-domain:
    runs-on: ubuntu-latest
    steps:
      - name: Check Resend domain status
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          RESEND_DOMAIN_ID: ${{ secrets.RESEND_DOMAIN_ID }}
        run: |
          RESPONSE=$(curl -sf \
            -H "Authorization: Bearer $RESEND_API_KEY" \
            "https://api.resend.com/domains/$RESEND_DOMAIN_ID")
          STATUS=$(echo "$RESPONSE" | jq -r '.status')
          if [ "$STATUS" != "verified" ]; then
            echo "Resend domain status: $STATUS (expected: verified)"
            echo "$RESPONSE" | jq .
            exit 1
          fi
          echo "Resend domain status: verified"
```

Add `RESEND_API_KEY` and `RESEND_DOMAIN_ID` as repository secrets. `RESEND_DOMAIN_ID` is the UUID from `GET /domains` — not the domain name.

When this job fails, GitHub sends an email notification to the repo owner and marks the workflow run as failed. The failure is visible on the Actions tab.

Pair with a GitHub Actions alert rule (or Vercel alert, or Slack notification via the `gh` CLI) if you want paging instead of email.

---

## 11. Branch and E2E Coupling — The Failure Mode

On MDE, E2E tests were written in a commit on `main` that expected a `/login` page with email input. At that point, `feat/auth-github-oauth` had 21 commits and had never been merged. Main had no auth, no `/login` route, no email input. The E2E tests failed on every CI run until auth was finally implemented and merged.

The rule: **if an E2E test expects a feature, that feature must be on `main` before the test lands on `main`.**

This is a variant of the general rule that tests should only assert against code that exists in the same branch. But it is worth stating explicitly for E2E tests because:

1. E2E tests assert against a running deployment, not just the source tree.
2. An E2E test that expects `/login` in a CI run will fail until the app at the deployed URL has a `/login` route.
3. If the branch with `/login` is never merged (or merged weeks later), every CI run on `main` fails in the meantime, obscuring real failures.

Strategies that avoid this:

- **Ship auth before any E2E tests.** Auth-first, as described in section 2.
- **Conditional skipping in CI.** If auth is not yet on `main`, skip auth-dependent E2E tests via an environment variable guard. Document the skip condition and when it will be removed.
- **Feature-flag E2E test gates.** Don't merge E2E tests that depend on an unmerged feature. Merge the feature first, then the tests, in the same PR or in two sequential PRs in the same release cycle.

The most reliable approach is the first: don't build any routes before auth exists. Then there are no E2E tests that can outrun the auth infrastructure.

---

## 12. Stack Alternatives and When to Switch

Auth.js v5 + Resend is the right choice when:
- You are already using Next.js with a database-backed stack (Prisma, Drizzle)
- You want full control over your auth UI and session behavior
- You want to avoid a third-party SaaS dependency for session management
- The application is solo-operator or small team with a known-email allowlist

Consider switching when:
- **Invitation-based access or SSO is needed** — Auth.js supports this but the setup complexity grows. Zitadel or Auth0 handle org/team management natively.
- **Audit logs of auth events are required** — Auth.js does not emit structured auth event logs. Supabase Auth and Firebase Auth both expose auth events as structured log streams.
- **Multi-tenant with per-tenant OAuth providers** — Auth.js v5 does not have first-class multi-tenant support. WorkOS or Clerk handle this.
- **You need IaC-managed OAuth clients** — Zitadel is the cleanest path. `zitadel_application_oidc` outputs `client_id` and `client_secret` as Tofu sensitive outputs. Auth.js ships a built-in `ZitadelProvider`.

### Clerk

Clerk bundles auth, session management, user management, and pre-built UI components (Clerk Elements, hosted sign-in pages). The tradeoff: your user records live in Clerk's cloud, not in your database. If Clerk's service is unavailable, your application cannot authenticate users. For internal tools where availability guarantees matter less than developer speed, Clerk is fast to integrate. For applications where user data ownership matters, the external dependency is a risk.

Clerk's Terraform provider (`buildwithdeck/clerk`) is community-maintained, low activity, and cannot create OAuth clients. IaC coverage is partial.

### Supabase Auth

Supabase Auth is a good fit if you are already using Supabase for the database. It handles all four tables (users, sessions, accounts, verification tokens) natively. The Supabase Terraform provider (`supabase/supabase`) can configure auth providers via `supabase_settings` JSON, but cannot create the underlying GitHub OAuth App — the same gap as Auth.js. For a Next.js + Neon stack, adding Supabase for auth only adds a second database dependency with no clear benefit.

### Firebase Auth

Firebase Auth has no cost at the Spark plan for under 10,000 monthly active users. It handles phone, email/password, magic link, and OAuth providers natively. The tradeoff: Firebase Auth is a Google service, and adding it to a non-Firebase stack (Next.js, Neon, Vercel) requires the Firebase Admin SDK for server-side session validation. This is manageable but adds complexity. The `hashicorp/google` provider can configure Identity Platform auth settings but, again, cannot create the underlying GitHub OAuth App.

Firebase Auth is the right choice if you are already in the Firebase/GCP ecosystem. For a Vercel + Neon stack with no other GCP dependencies, it is overhead without a corresponding benefit.

---

## 13. Template Integration Note

This document was written for the `nextjs-vercel-prisma` template project. It should be included at `docs/learnings/auth-setup-retrospective.md` in the template repository.

New projects generated from the template should receive:

1. This document, so the sequencing mistakes and DNS gotchas are documented before the first commit.
2. A pre-built auth scaffold — `src/lib/auth.ts`, `src/lib/auth.config.ts`, `middleware.ts`, the four Prisma models — in the template base rather than as a feature ticket.
3. `AUTH_EMAIL_FROM` absent from the Tofu template (or defaulting to the `onboarding@resend.dev` fallback) until the developer explicitly sets a custom domain after verifying it.
4. The hourly Resend domain health check workflow stubbed in `.github/workflows/resend-domain-health.yml` with clear instructions on which secrets to add.
5. The `create-github-oauth-app.md` and `setup-resend-domain.md` runbooks.

The cost of not doing this: 21 unmerged commits, 5+ consecutive CI failures on `main`, hours of async DNS debugging, and the silent magic link failure mode where users see "Check your email" and nothing arrives.
