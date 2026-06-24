---
status: proposed
date: 2026-06-24
tags: [quality, typescript, database]
---

## Context

`packages/db/src/index.ts` exports a PrismaClient singleton using the `globalThis` pattern
to survive Next.js hot-module replacement in development. The current implementation assigns
to `globalForPrisma.prisma` only when `NODE_ENV !== 'production'`, which is the correct
guard. However, the instance is created unconditionally on every module evaluation via
`globalForPrisma.prisma ?? new PrismaClient()`. In Next.js App Router, each Worker thread
(in `--experimental-worker` mode) and each Edge runtime has its own `globalThis`. The
guard prevents duplicate instantiation within a single Node.js process during hot reload,
but does not address connection pooling at the infrastructure layer.

The current pattern matches the official Prisma Next.js recommendation as of Prisma 5.x.
The risk is that it is not enforced by type — `globalForPrisma` is typed as
`unknown as { prisma: PrismaClient }`, meaning TypeScript does not catch usages that access
`prisma` before the module has been evaluated.

## Decision

Retain the current global singleton pattern for development hot-reload safety. Add a
PgBouncer or Neon connection pooling URL (`?pgbouncer=true&connection_limit=1`) in the
`DATABASE_URL` environment variable for production, configured via Vercel environment
variables. Document this requirement in `packages/db/README.md` at the time of first
instantiation.

Do not change the TypeScript typing — the `unknown as` cast is intentional and matches
upstream Prisma documentation examples. Add a comment-free named function
`createPrismaClient()` to wrap the construction call, making the intent testable.

## Consequences

- Development: hot reload will not leak connections (current behavior preserved)
- Production: connection count is bounded by PgBouncer/Neon pooler, not by process count
- Test environments: each test file that imports `@template/db` will share the singleton;
  test isolation requires explicit `prisma.$disconnect()` in teardown or use of
  `prisma-client-extension` mocking
- The `export * from '@prisma/client'` re-export couples consumers to the Prisma version;
  a major Prisma upgrade forces all consumers to update simultaneously
