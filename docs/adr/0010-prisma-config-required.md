---
status: proposed
date: 2026-06-24
tags: [tooling, infrastructure, database]
---

# 0010. `prisma.config.ts` Is a Required File, Not an Optional Convenience

## Context

Every `prisma` CLI command in `package.json`, `1-commit.yml` (`prisma-migrate-check` job),
and `3-promote.yml` passes `--config packages/db/prisma.config.ts`. Prisma 7 introduced
`prisma.config.ts` as the canonical location for schema path, migration directory, and
client output resolution. When the file is absent, all CLI invocations fail with a
"Config file not found" error before touching the schema.

The scaffold as built contains `packages/db/prisma/schema.prisma` but no
`packages/db/prisma.config.ts`. The file is missing from the entire repository tree.
Every `db:generate`, `db:migrate`, `db:studio`, and the `prisma-migrate-check` CI job
will fail on first use.

Additionally, the `prisma-migrate-check` Phase 0 job is entirely absent from
`1-commit.yml`. This means schema validity is not gated before Phase 1 compute begins,
violating the Phase 0 design contract established in ADR-0005.

## Decision

`packages/db/prisma.config.ts` must be created as a committed file that exports:
- `schema` path pointing to `packages/db/prisma/schema.prisma`
- `migrations` directory path
- `client.output` path

The `prisma-migrate-check` job must be added to `1-commit.yml` Phase 0, with a Postgres
service container, so schema validity gates all compute jobs.

## Consequences

All `prisma` commands resolve correctly without per-command path flags. The Phase 0
gate for schema validity works as designed. CI will not silently proceed with a broken
schema to the expensive typecheck/lint/test/build jobs.
