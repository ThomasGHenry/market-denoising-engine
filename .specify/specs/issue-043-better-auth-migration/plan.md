# Technical Plan: Better Auth Migration

**Feature:** issue-043-better-auth-migration
**ADR:** docs/adr/0108-migrate-auth-js-to-better-auth.md

---

## 1. Architecture

### 1.1 Package changes

Remove:
- `next-auth@^5.0.0-beta.31`
- `@auth/prisma-adapter@^2.11.2`

Add:
- `better-auth` (latest stable)
- `resend` (direct SDK — currently Resend is accessed via Next Auth provider, now needed directly)

### 1.2 File inventory

| File | Action | Notes |
|---|---|---|
| `apps/web/src/lib/auth.ts` | REWRITE | Better Auth instance; magicLink plugin; socialProviders.github gated |
| `apps/web/src/lib/auth-client.ts` | CREATE | Better Auth browser client |
| `apps/web/src/lib/auth.config.ts` | DELETE | Edge split eliminated |
| `apps/web/src/lib/auth.test.ts` | REWRITE | Test `isAllowedEmail` only; remove Next Auth mocks |
| `apps/web/src/middleware.ts` | REWRITE | Use `getSessionCookie` from `better-auth/cookies` for fast edge-compatible check |
| `apps/web/src/middleware.test.ts` | REWRITE | Remove `next-auth` and `auth.config` mocks |
| `apps/web/src/app/login/page.tsx` | REWRITE | Use `authClient` for client-side magic link; server action for GitHub |
| `apps/web/src/app/api/auth/[...all]/route.ts` | REWRITE | `toNextJsHandler(auth)` |
| `packages/db/prisma/schema.prisma` | MODIFY | Replace 4 Auth.js models with 4 Better Auth models |
| `apps/web-e2e/src/auth.ts` | REWRITE | Better Auth E2E helper |

### 1.3 auth.ts design

```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink } from 'better-auth/plugins'
import { Resend } from 'resend'
import { prisma } from '@template/db'

const resend = new Resend(process.env.AUTH_RESEND_KEY)

function buildGithubProvider() {
  if (!process.env.AUTH_GITHUB_ID) return {}
  return {
    github: {
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
    },
  }
}

async function sendMagicLinkEmail({ email, url }: { email: string; url: string; token: string }) {
  if (process.env.NODE_ENV !== 'production') {
    await prisma.verification.upsert({
      where: { id: `__e2e__${email}` },
      create: { id: `__e2e__${email}`, identifier: `__e2e__${email}`, value: url, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
      update: { value: url, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
    })
    return
  }
  await resend.emails.send({
    from: process.env.AUTH_EMAIL_FROM ?? 'MDE <onboarding@resend.dev>',
    to: email,
    subject: 'Sign in to MDE',
    html: `<a href="${url}">Click here to sign in</a>`,
  })
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
  emailAndPassword: { enabled: false },
  socialProviders: buildGithubProvider(),
  plugins: [magicLink({ sendMagicLink: sendMagicLinkEmail })],
})
```

### 1.4 middleware.ts design

Two approaches documented by Better Auth:
1. `auth.api.getSession()` — full session validation with DB lookup (Node.js runtime, 15.2+)
2. `getSessionCookie()` — fast cookie presence check (edge-compatible, no DB)

Since the app runs on Vercel with Next.js 15, and we want route protection without
a DB round-trip on every request, use `getSessionCookie` for middleware. Full session
validation happens in server components/actions when needed.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const PUBLIC_PATHS = ['/login', '/api/auth']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(function (p) { return pathname.startsWith(p) })
}

export function middleware(request: NextRequest): NextResponse {
  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie && !isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

Note: No `export const runtime = 'nodejs'` needed with `getSessionCookie` approach —
it's edge-compatible. The ADR mentioned `nodejs` runtime but that was for
`auth.api.getSession()`. We use the simpler approach that needs no runtime override.

### 1.5 E2E helper design

```typescript
import type { Page } from '@playwright/test'
import { prisma } from '@template/db'

const E2E_SENTINEL_PREFIX = '__e2e__'

async function triggerMagicLink(page: Page, baseUrl: string, email: string): Promise<void> {
  await page.request.post(`${baseUrl}/api/auth/sign-in/magic-link`, {
    data: { email, callbackURL: '/' },
    headers: { 'Content-Type': 'application/json' },
  })
}

async function readMagicLinkUrl(email: string): Promise<string> {
  const sentinel = E2E_SENTINEL_PREFIX + email
  const record = await prisma.verification.findFirst({
    where: { identifier: sentinel },
    orderBy: { expiresAt: 'desc' },
  })
  if (!record) throw new Error(`No E2E magic link record found for ${email}`)
  return record.value
}

export async function loginWithMagicLink(page: Page, email: string): Promise<void> {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
  await triggerMagicLink(page, baseUrl, email)
  const magicUrl = await readMagicLinkUrl(email)
  await page.goto(magicUrl)
}
```

### 1.6 Prisma schema

`npx better-auth generate --config apps/web/src/lib/auth.ts` produces the 4 Better Auth
models. Run this as part of the task, then diff to verify, then run `prisma migrate dev`.

Since no real users exist in production (v0.1 solo operator), we drop the old
Auth.js tables and create the new ones in a single migration named `better-auth-migration`.

### 1.7 isAllowedEmail

The Better Auth instance handles auth but does not gate by email directly. The existing
`isAllowedEmail` function remains as a utility. It is not called by Better Auth's
magic link handler — Better Auth does not have an email allowlist concept built-in.
The single-operator protection relies on: (a) magic link emails only going to the
sender's inbox, and (b) GitHub OAuth only being registered for the operator account.

For explicit protection, add a `trustedOrigins` or use Better Auth's `onRequest` hook
to validate the email before sending the magic link. This is a separate concern from
the migration itself and deferred to a follow-up.

### 1.8 login/page.tsx design

Better Auth's magic link requires a client-side call (`authClient.signIn.magicLink`)
from a Client Component, OR a server action that calls the auth API directly.

For simplicity and consistency with the existing pattern (server actions), use a
server action that calls `auth.api.signInMagicLink` — this avoids adding a React
Client Component boundary just for auth.

GitHub OAuth uses a redirect, handled via `auth.api.signInSocial`.

```typescript
// server actions
async function signInWithMagicLink(formData: FormData) {
  'use server'
  await auth.api.signInMagicLink({
    body: { email: formData.get('email') as string, callbackURL: '/' },
    headers: await headers(),
  })
}

async function signInWithGitHub() {
  'use server'
  const response = await auth.api.signInSocial({
    body: { provider: 'github', callbackURL: '/' },
    headers: await headers(),
  })
  if (response?.url) redirect(response.url)
}
```

---

## 2. Completeness surface (qreview pre-flight)

- Config: `BETTER_AUTH_SECRET` added to Vercel env (infra ticket or manual)
- Schema: 4 models replaced, migration applied
- Types: no `any`, no `!`, no `as` in new code
- Routes: `/api/auth/[...all]` wired, `/login` page updated
- Middleware: matcher covers all app routes excluding public paths and static
- E2E: sentinel approach works in both local and Vercel preview
- Cross-layer: auth.ts exports → middleware → login page → API route all consistent
- Package: `next-auth`, `@auth/prisma-adapter` removed; `better-auth`, `resend` added
- Deleted: `auth.config.ts` — zero references in codebase

---

## 3. Migration sequence

1. Install `better-auth` and `resend` packages
2. Remove `next-auth` and `@auth/prisma-adapter`
3. Update Prisma schema (replace Auth.js models with Better Auth models)
4. Run migration
5. Rewrite `auth.ts`
6. Create `auth-client.ts`
7. Delete `auth.config.ts`
8. Rewrite `middleware.ts` + update tests
9. Rewrite `auth.test.ts`
10. Rewrite `app/api/auth/[...all]/route.ts`
11. Rewrite `login/page.tsx`
12. Rewrite E2E `auth.ts`
13. Run all tests; verify CI
