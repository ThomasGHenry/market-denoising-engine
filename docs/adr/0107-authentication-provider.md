---
status: accepted
date: 2026-06-29
tags: [security, authentication, infrastructure]
---

# 0107. Authentication Provider Selection

## Context

MDE is a solo-operator internal tool. Vercel preview and production URLs are publicly
reachable and crawled by bots. Without an authentication gate all routes and data are
openly accessible. Issue #25 established the requirement: all routes require
authentication; only the operator (GitHub: `ThomasGHenry`) can log in.

The implementation uses Auth.js v5 (NextAuth) with a GitHub OAuth provider and
middleware-based route protection. This satisfies the functional requirement but exposes
an infrastructure gap: **GitHub's Terraform provider has no `github_oauth_app` resource**.
OAuth App creation on GitHub is web-UI only — a deliberate platform restriction, not a
provider bug. Two credentials (`client_id`, `client_secret`) therefore live outside IaC,
cannot be reviewed, and require manual re-creation if revoked.

This ADR evaluates whether a different provider closes that gap and records the decision.

A secondary question was raised during evaluation: is GitHub OAuth the right mechanism at
all for a solo-operator tool, or does a **magic link** (passwordless email) approach serve
the use case better?

### Provider survey (conducted 2026-06-29)

Research queried Terraform Registry, provider changelogs, Auth.js docs, and provider
GitHub repositories for each candidate. Criteria: (1) can the provider create an OAuth
client via IaC with no web-UI steps? (2) Does Auth.js v5 ship a built-in provider?
(3) Is the provider actively maintained?

| Provider | Terraform provider | IaC OAuth client? | Registry ID | Last release |
|---|---|---|---|---|
| **Zitadel** | Official (Zitadel-maintained) | Yes — `zitadel_application_oidc` outputs `client_id` + `client_secret` as sensitive attributes, server-generated | `zitadel/zitadel` | v3.2.2 — 2026-06-21 |
| **Auth0** | Official (Okta-maintained) | Yes — `auth0_client` + `auth0_client_credentials`; requires `read:client_keys` scope on the M2M Terraform app | `auth0/auth0` | v1.50.0 — 2026-06-17 |
| **Okta** | Official (Okta-maintained) | Yes — `okta_app_oauth` outputs `client_id` + `client_secret` (`omit_secret = false`) | `okta/okta` | v6.12.0 — 2026-06-10 |
| **Keycloak** | Official (Keycloak-maintained) | Yes — `keycloak_openid_client` with `access_type = "CONFIDENTIAL"`; `client_secret_wo` write-only arg avoids state exposure | `keycloak/keycloak` | v5.8.0 — 2026-06-05 |
| **Clerk** | Community only | Partial — manages app settings; no resource for `client_id`/`client_secret` creation | `buildwithdeck/clerk` | Low activity |
| **WorkOS** | Community (`osodevops/workos`) | No — manages users/orgs/roles; no OAuth client resource | `osodevops/workos` | v2.3.1 — 2026-06-12 |
| **Supabase** | Official (`supabase/supabase`) | Partial — `supabase_settings` auth block accepts `external_github_enabled`, `external_github_client_id`, `external_github_secret` via `jsonencode()`; configures Supabase to use existing credentials but cannot create the underlying GitHub OAuth App | `supabase/supabase` | v1.9.1 — 2026-05-15 |
| **Firebase Auth** | `hashicorp/google` (Identity Platform) | Partial — `google_identity_platform_default_supported_idp_config` with `idp_id = "github.com"` takes `client_id` + `client_secret` as required args; full IDP config via Terraform but cannot create the underlying GitHub OAuth App; requires Blaze plan | `hashicorp/google` | active |
| **GitHub OAuth** | `integrations/github` | **No** — definitively no `github_oauth_app` resource; confirmed by provider docs and open issues | N/A | N/A |
| **Google OAuth** | `hashicorp/google` | **No** — `google_iap_client` shut down 2026-03-19; `google_iam_oauth_client` targets Workforce Identity Federation only; standard OAuth client IDs remain UI-only | N/A | [issue #16452](https://github.com/hashicorp/terraform-provider-google/issues/16452) |

Auth.js v5 built-in providers: Zitadel ✓, Auth0 ✓, Okta ✓, Keycloak ✓, GitHub ✓,
Google ✓. Clerk and WorkOS require custom OIDC configuration.

### Magic link (passwordless email) analysis

Auth.js v5 ships an `Email` provider (`next-auth/providers/nodemailer`) that sends a
one-time sign-in link. Resend (`resend/resend`) is the recommended SMTP transport:
developer-tier is free, delivers via REST API (no SMTP daemon), and supplies an API key
as a single env var.

**Implementation surface** (vs GitHub OAuth):

| Concern | GitHub OAuth | Magic link (Resend) |
|---|---|---|
| External service account | GitHub OAuth App (web-UI only) | Resend account + API key |
| IaC-provisioned? | No | No — API key creation is web-UI only on Resend |
| Credentials in IaC state | No | No |
| Secrets required | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET` | `AUTH_RESEND_KEY`, `AUTH_SECRET` |
| Operator allowlist | `profile.login === 'ThomasGHenry'` | `email === 'thomasghenry@gmail.com'` |
| Auth.js provider | `GithubProvider` | `EmailProvider` + Resend transport |
| Database adapter required? | No (JWT session) | **Yes** — magic link tokens must persist between email send and link click |
| Prisma schema change | None | `Account`, `Session`, `User`, `VerificationToken` tables |
| User experience | One OAuth redirect | Email arrives, user clicks link |
| Multi-environment callback | Third-party provider; one registered URL allowed | Own server; callback URL is always `{AUTH_URL}/api/auth/callback/email` |

**Key tradeoff:** Magic link requires a database-backed Auth.js adapter because the
one-time token must survive between the POST that sends the email and the GET when the
user clicks the link — JWT sessions cannot span that gap. Auth.js ships
`@auth/prisma-adapter` which adds `Account`, `Session`, `User`, and `VerificationToken`
tables via a Prisma migration. The pgbouncer pooled URL is incompatible with Prisma
adapter connections; `DATABASE_URL_UNPOOLED` must be used for the adapter at runtime (not
just migration time).

**IaC gap equivalence:** Both GitHub OAuth and Resend require one web-UI credential
creation step. Neither closes the IaC gap identified in the Context section. The gap is
inherent to the solo-operator use case where full IaC is unnecessary overhead.

### Multi-environment OAuth complexity (discovered post-implementation)

During implementation of the GitHub OAuth flow, a multi-environment callback URL problem
was discovered. GitHub OAuth Apps support **one** registered callback URL. GitHub Apps
support up to ten, but no wildcard patterns. Vercel preview deployments use ephemeral
URLs (`https://market-denoising-engine-git-*-thomasghenry.vercel.app`) that cannot be
pre-registered.

Auth.js documents a redirect proxy pattern for this case: preview deployments set
`AUTH_REDIRECT_PROXY_URL` to the stable production URL; the OAuth callback hits
production, extracts the originating preview URL from the OAuth `state` parameter, and
redirects back. This works but introduces:

- `AUTH_REDIRECT_PROXY_URL` as a Vercel Preview-scoped environment variable
- Dependency on production deployment being live when previews authenticate
- GitHub App migration required to register localhost as a second callback URL
- Gated Credentials provider required for E2E test auth bypass

Magic link avoids this entirely. The callback URL is always
`{AUTH_URL}/api/auth/callback/email` — hosted on the same server, constructed at
send-time from the current deployment's base URL. Localhost, preview, and production
are all first-class with no proxy pattern and no third-party URL registration.

### Zitadel vs Auth0

**Zitadel** (`zitadel/zitadel` v3.2.2) is the cleanest IaC path: `zitadel_application_oidc`
requires only `name`, `project_id`, `grant_types`, `redirect_uris`, and `response_types`.
Both `client_id` and `client_secret` are first-class sensitive outputs — no secondary
resource or extra API scope required. Zitadel maintains an official Next.js + Auth.js
example repository. Zitadel Cloud free tier is adequate for a solo operator.

**Auth0** (`auth0/auth0` v1.50.0) is the more mature ecosystem. The two-resource pattern
(`auth0_client` + `auth0_client_credentials`) works but requires a Management API M2M app
with `read:client_keys` scope as a one-time setup step before Tofu can read the secret.
Auth.js Auth0 documentation is the deepest of any surveyed provider.

Okta adds pricing complexity inappropriate for solo operators. Keycloak requires a
self-hosted or managed instance. Both are ruled out.

## Decision

**Implement dual-provider authentication: Resend magic link (all environments) plus
GitHub OAuth (production only, presence-gated).**

The first evaluation of magic link concluded it was not warranted because the IaC gap was
identical and the DB adapter cost outweighed removing one web-UI step. That analysis was
incomplete: it did not account for the multi-environment OAuth callback complexity
discovered during implementation (see above). The DB adapter cost is fixed and one-time;
the OAuth multi-environment complexity is recurring operational overhead.

**Provider strategy:**

| Environment | GitHub OAuth | Magic link |
|---|---|---|
| Production | ✅ available (gated on `AUTH_GITHUB_ID` present) | ✅ available |
| Vercel Preview | ❌ absent (`AUTH_GITHUB_ID` not set in Preview scope) | ✅ available |
| Local dev | ❌ absent | ✅ available |
| E2E (CI) | ❌ absent | ✅ available (token queried from DB) |

Gating is achieved by presence of `AUTH_GITHUB_ID` in the environment, not by
`NODE_ENV` or `VERCEL_ENV` checks in code:

```typescript
const providers: Provider[] = [Resend({ from: "auth@..." })]
if (process.env.AUTH_GITHUB_ID) providers.push(GitHub)
```

`AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are set only in the Vercel **Production**
environment scope. Preview and Development scopes do not have these variables.

**Schema cost accepted:** `@auth/prisma-adapter` + four tables (`Account`, `Session`,
`User`, `VerificationToken`). The unpooled `DATABASE_URL_UNPOOLED` connection is
required for the adapter at runtime; `DATABASE_URL` (pooled) remains the default for
all other queries. This is a Neon-specific constraint documented in their Auth.js guide.

**E2E auth:** Tests POST to `/api/auth/signin/email`, then query the `VerificationToken`
table directly to retrieve the token, and navigate to the callback URL. No Credentials
provider required in code.

**Zitadel remains the documented migration target** if a second environment
(staging, contributor fork) is provisioned or credentials need rotation under IaC
control. Zitadel's `zitadel_application_oidc` provides a complete IaC path;
Auth.js ships a built-in `ZitadelProvider`. Auth0 is the fallback if Zitadel Cloud
pricing or availability changes.

## Consequences

- `@auth/prisma-adapter` added to `packages/db` or `apps/web`
- Prisma schema gains `Account`, `Session`, `User`, `VerificationToken` models
- `DATABASE_URL_UNPOOLED` must be set in all environments where auth runs
- `AUTH_RESEND_KEY` added to Bitwarden `mde-auth-secrets` and Vercel env vars
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` set in Vercel **Production scope only**
- GitHub OAuth App callback URL remains `https://market-denoising-engine.vercel.app/api/auth/callback/github`
- No proxy pattern, no `AUTH_REDIRECT_PROXY_URL`, no GitHub App migration required
- Existing PR #33 (`feat/auth-github-oauth`) to be superseded by new implementation branch
