---
status: proposed
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
| **Supabase** | Official (`supabase/supabase`) | No — `supabase_settings` configures existing providers; cannot create OAuth credentials | `supabase/supabase` | v1.9.1 — 2026-05-15 |
| **GitHub OAuth** | `integrations/github` | **No** — definitively no `github_oauth_app` resource; confirmed by provider docs and open issues | N/A | N/A |
| **Google OAuth** | `hashicorp/google` | **No** — `google_iap_client` shut down 2026-03-19; `google_iam_oauth_client` targets Workforce Identity Federation only; standard OAuth client IDs remain UI-only | N/A | [issue #16452](https://github.com/hashicorp/terraform-provider-google/issues/16452) |

Auth.js v5 built-in providers: Zitadel ✓, Auth0 ✓, Okta ✓, Keycloak ✓, GitHub ✓,
Google ✓. Clerk and WorkOS require custom OIDC configuration.

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

**Defer migration from GitHub OAuth to Zitadel.** The current GitHub OAuth implementation
(Auth.js v5, `middleware.ts`, `src/lib/auth.ts`) satisfies the functional requirement
and is deployed. The IaC gap is real but low risk for a solo-operator tool: the OAuth App
is created once, credentials are stored in Bitwarden, and revocation is an unlikely event
managed manually.

When the GitHub OAuth App credentials next need rotation or a second environment
(staging, contributor fork) is provisioned, migrate to **Zitadel** as the preferred
provider. Zitadel's `zitadel_application_oidc` resource provides a complete IaC path
with no secondary resources or extra scopes; the Auth.js built-in provider and official
Next.js example reduce migration friction.

Auth0 is the fallback if Zitadel Cloud availability or pricing changes.

If migration is pursued: add `zitadel/zitadel` to `infra/app/main.tf`, provision a
`zitadel_project` and `zitadel_application_oidc`, wire `client_id` and `client_secret`
outputs into `vercel_project_environment_variables`, and swap `GithubProvider` for
`ZitadelProvider` in `apps/web/src/lib/auth.ts`.

## Consequences

The current GitHub OAuth implementation ships as-is. Two credentials (`AUTH_GITHUB_ID`,
`AUTH_GITHUB_SECRET`) live outside Tofu state, stored in Bitwarden and supplied via
`TF_VAR_*` GitHub Actions secrets. `AUTH_SECRET` is also outside state; it is generated
with `openssl rand -hex 32` and stored in Bitwarden.

Zitadel is the documented migration target when full IaC provisioning becomes necessary.
No action required until then.
