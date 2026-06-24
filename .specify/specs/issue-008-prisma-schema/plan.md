# Plan: Issue #8 — MDE Prisma Schema

## Scope

Two files change:
1. `packages/db/prisma/schema.prisma` — replace User stub with 7 MDE models + 8 enums
2. `packages/db/prisma/seed.ts` — replace User seed with Engineer-Seller Batch 001

No other packages change. No migrations (DATABASE_URL not guaranteed in dev).

## ADR Alignment

- ADR 0102: `SignalReview.observation`, `.interpretation`, `.decision` are separate fields — verified in target schema.
- ADR 0103: `Generation.fitnessFunction` is a String field defaulting to `"default_v0"` — present in target schema.
- ADR 0017 / 0100: `packages/domain` and `packages/scoring` do not import `@prisma/client` — these packages are untouched.

## Schema Strategy

Transcribe PRD §11 schema exactly. No deviations. Field order, relation names, and default
values must match the issue spec verbatim. The schema is a direct encoding of the PRD —
no architectural judgment is required at this layer.

## Seed Strategy

Upsert pattern: use `create` inside a `try/catch` or use `upsert` keyed on a stable
deterministic id via `createMany` with `skipDuplicates`. Since this is dev-only seed data
with no stable unique key beyond the CUID primary key, use a nested `create` chain
(Generation → Probes → PlatformPosts → MetricSnapshots) wrapped in a transaction.

Fitness-relevant metric choices (Probe C wins):
- Probe A (Anti-Grift): impressions 1200, likes 42, comments 8, saves 15 → qualitativeScore 6
- Probe B (AI Won't Replace): impressions 1800, likes 61, comments 12, saves 22 → qualitativeScore 7
- Probe C (Distribution Allergy): impressions 900, likes 78, comments 19, saves 41 → qualitativeScore 9

Probe C wins despite fewer impressions: highest engagement rate, most saves, highest
qualitativeScore. Under the default_v0 fitness formula (which weights saves and
qualitativeScore heavily), Probe C ranks first.

## Completeness Surface

- Config: `packages/db/prisma.config.ts` — already wired, no change needed
- Indexes: none required for MVP (Prisma adds PK indexes automatically)
- Rules: no Prisma `@@unique` or `@@index` constraints required beyond those in PRD §11
- Types: `@prisma/client` re-exports are auto-generated; consuming packages untouched
- Routes: no route changes
- Cross-layer alignment: `packages/domain/src/signal-review.ts` references the OID
  invariant (ADR 0102) — schema change aligns with that decision, no domain change needed

## Acceptance Gate

`npx prisma generate --config packages/db/prisma.config.ts` exits 0 with no errors.
`npm run typecheck` exits 0.
`bash scripts/ci/validate-adrs.sh docs/adr` exits 0.
