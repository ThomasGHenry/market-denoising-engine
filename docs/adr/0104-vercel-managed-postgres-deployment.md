---
status: accepted
date: 2026-06-24
tags: [infrastructure, deployment, database]
implementation: packages/db/prisma.config.ts
---

# 0104. Vercel + Managed Postgres Deployment

## Context

MDE is a solo-operator system. Infrastructure complexity must remain minimal: no on-call
burden, no manual backup management, no container orchestration. The application is
Next.js 15 with Prisma ORM. Deployment and database hosting must be low-maintenance and
require no dedicated infrastructure work to keep running.

The non-default Prisma config location (`packages/db/prisma.config.ts`) is already
established in ADR 0010. Prisma as the sole DB access layer is established by the NX
domain boundary rules in ADR 0017 and ADR 0022.

## Decision

Deploy to Vercel. Use managed Postgres — either Vercel Postgres (powered by Neon) or a
direct Neon project — as the sole database host. Prisma is the only path to the database:
no raw SQL outside of Prisma migration files. Connection pooling via PgBouncer is required
for Prisma running in Vercel serverless functions; `DATABASE_URL` must include
`?pgbouncer=true&connection_limit=1`. A non-pooled `DATABASE_URL_UNPOOLED` is required
for Prisma migrations, which do not tolerate PgBouncer transaction-mode pooling.

## Consequences

The deployment is vendor-coupled to Vercel. Serverless cold starts apply to all Next.js
API routes. PgBouncer configuration must be correct or migrations will fail against the
pooled URL. In return: zero ops overhead for deployments, database backups, and SSL
certificate management; Vercel provides preview environments per PR with isolated database
branches (when using Neon); the `DATABASE_URL` / `DATABASE_URL_UNPOOLED` split is the
only operational concern beyond standard Prisma usage.
