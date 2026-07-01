---
status: accepted
date: 2026-07-01
tags: [security, authentication, infrastructure]
---

# 0108. Migrate Auth.js v5 to Better Auth

## Context

ADR 0107 selected Auth.js v5 with Resend magic link and presence-gated GitHub OAuth. The
implementation exposed a set of structural issues that make the Auth.js v5 adapter-based
stack difficult to maintain and test.

### Mandatory two-file edge split

Auth.js v5 with `@auth/prisma-adapter` requires two separate auth entry points because
`@prisma/adapter-pg` cannot execute on the Next.js edge runtime:

- `auth.config.ts` — edge-safe config (no adapter, no Prisma); used by `middleware.ts`
- `auth.ts` — full config with `PrismaAdapter`; used by API routes and server components

The split is an Auth.js architectural constraint, not a project choice. Any change to
auth configuration must be applied in both files or the middleware and the API route
diverge silently.

### Unpooled connection requirement

Auth.js v5 magic link tokens are persisted via `PrismaAdapter`, which issues advisory
locks incompatible with PgBouncer's transaction-mode pooling. The adapter must connect
via `DATABASE_URL_UNPOOLED` (direct Neon connection) at runtime — not only during
migrations. A second env var is required wherever auth runs: local dev, Vercel Preview,
Vercel Production.

### `trustHost` required for preview deployments

Auth.js v5 validates the `Host` header against its `AUTH_URL` to prevent CSRF. Vercel
preview deployments use ephemeral hostnames that cannot be pre-registered. Setting
`trustHost: true` disables that check across all environments, including production —
a broader trust surface than required.

### GitHub OAuth non-functional in production

GitHub OAuth login fails in production. Root cause is undiagnosed; candidates include
OAuth App callback URL mismatch and environment variable scoping. The provider is
present in code but does not complete the OAuth flow end-to-end under real conditions.

### Broken E2E `loginWithMagicLink` helper

The E2E helper in `e2e/src/auth.ts` issues:

```typescript
await page.goto('/api/auth/signin/email', { method: 'POST', ... })
```

Playwright's `page.goto` ignores the `method` option and always issues a GET. The
resulting GET returns the sign-in UI, not the email dispatch endpoint. A subsequent
POST with `csrfToken: ''` is rejected by Auth.js CSRF middleware. The E2E smoke test
is therefore incapable of authenticating end-to-end.

### Better Auth maturity

Auth.js v5 was adopted before Better Auth reached production maturity. As of Sep 2025,
the NextAuth/Auth.js maintainers officially recommend Better Auth for new projects.
Better Auth's architecture eliminates the above issues:

- Single `auth.ts` — no edge split required; Next.js 15.2+ supports Node.js runtime
  middleware via `export const runtime = 'nodejs'`
- `magicLink` plugin — built-in, with a `sendMagicLink` callback wired to any mailer;
  no `DATABASE_URL_UNPOOLED` constraint documented
- `socialProviders.github` — standard OAuth helper; same functional scope as Auth.js
  `GithubProvider`
- Node.js runtime middleware — no `trustHost: true` workaround needed
- Client API — `authClient.signIn.magicLink({ email })` provides a testable surface for
  the E2E helper rewrite

Schema is generated via `npx better-auth generate`, producing a Prisma schema diff that
is applied with `prisma migrate dev`.

## Decision

Migrate from Auth.js v5 (`next-auth@beta`, `@auth/prisma-adapter`) to Better Auth
(`better-auth`).

- Replace the two-file split (`auth.config.ts` + `auth.ts`) with a single `auth.ts`
  exporting a Better Auth instance
- Replace `middleware.ts` edge-runtime import from `auth.config.ts` with Better Auth's
  Node.js runtime middleware (`export const runtime = 'nodejs'` in `middleware.ts`)
- Replace the `Resend` Auth.js provider with the `magicLink` plugin and a `sendMagicLink`
  callback calling the Resend SDK directly
- Replace the presence-gated `GitHub` provider with `socialProviders.github`, gated on
  `AUTH_GITHUB_ID` being present in the environment
- Run `npx better-auth generate` to produce the Prisma schema diff; apply with
  `prisma migrate dev`
- Rewrite the E2E `loginWithMagicLink` helper using the Better Auth client API

## Consequences

- `auth.config.ts` is deleted; `middleware.ts` imports from `auth.ts` directly
- Auth.js `Account`, `Session`, `User`, `VerificationToken` tables are replaced by the
  Better Auth schema; since MDE has no real users in production (v0.1, solo operator),
  these tables can be dropped and re-created via a fresh migration
- `DATABASE_URL_UNPOOLED` is no longer required at auth runtime; the single pooled
  `DATABASE_URL` is sufficient
- `AUTH_SECRET` remains; Better Auth can consume the same env var name (verify during
  implementation — `BETTER_AUTH_SECRET` is the canonical name if Better Auth does not
  accept `AUTH_SECRET`)
- `AUTH_EMAIL_FROM` and `AUTH_RESEND_KEY` env var names are unchanged; Resend is wired
  directly in the `sendMagicLink` callback
- GitHub OAuth App callback URL defaults to `/api/auth/callback/github` in Better Auth —
  same path as Auth.js; verify before closing the implementation ticket
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` environment variable names are unchanged;
  gating logic moves from `providers` array construction to `socialProviders.github`
  conditional
- `@auth/prisma-adapter` and `next-auth` packages are removed; `better-auth` is added
- E2E `loginWithMagicLink` in `e2e/src/auth.ts` is rewritten using
  `authClient.signIn.magicLink` and direct `VerificationToken` table query
- `apps/web/src/auth.config.ts` is deleted (7 files total change: `auth.ts`,
  `auth.config.ts` deleted, `middleware.ts`, `app/login/page.tsx`, `api/auth/[...all]/route.ts`,
  `packages/db/prisma/schema.prisma`, `e2e/src/auth.ts`)
