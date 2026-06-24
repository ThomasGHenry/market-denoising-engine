# Spec: Issue #8 — MDE Prisma Schema (7 models, 8 enums)

## Summary

Replace the placeholder `User` model in the Prisma schema with the full MDE domain schema,
and replace the placeholder seed with real MDE seed data.

## User Outcomes

As a developer opening this project for the first time, I can run `npm run db:generate` and
have a working Prisma client that reflects the full MDE domain model — so I can immediately
start building queries, pages, and API routes without a schema migration step.

As a developer running `npm run db:seed`, I get realistic MDE seed data representing the
"Engineer-Seller Batch 001" generation with three probes and LinkedIn posts — so the
application loads with non-trivial, fitness-meaningful content from the first run.

## Business Rules

1. The schema is the single source of truth for the MDE domain model.
2. `Generation` tracks a population of probes sharing a theme and fitness evaluation round.
3. `Probe` is the atomic unit of market experimentation — one piece of content.
4. `PlatformPost` records a probe's publication on a specific platform.
5. `MetricSnapshot` records platform engagement metrics at a point in time.
6. `SignalReview` records a human's evaluation of a probe's market signal.
   - `observation`, `interpretation`, and `decision` are always three separate fields.
   - They must never be collapsed into one field (OID invariant, ADR 0102).
7. `GenerationReview` records the human's end-of-generation evaluation.
8. `Mutation` records a hypothesis for how to vary a probe in the next generation.
9. `Generation.fitnessFunction` names the formula used to score fitness (ADR 0103).
   All generations store the formula name so historical scores remain reproducible.
10. The `User` model from the template scaffold has no place in the MDE domain
    and must be removed entirely.

## Out of Scope

- Authentication and user identity (no MDE-level user model required for MVP).
- Platform OAuth integrations.
- Automated metric collection.
- Computed fitness scores stored in the schema (scores are computed at read time).

## Success Criteria

1. `packages/db/prisma/schema.prisma` contains all 7 models and 8 enums exactly matching PRD §11.
2. `npm run db:generate` passes without errors.
3. `npm run typecheck` passes across all packages.
4. Phase 0 CI gate passes (`bash scripts/ci/validate-adrs.sh docs/adr`).
5. The `User` model and its seed are removed.
6. Seed data matches PRD §18: Generation "Engineer-Seller Batch 001" with Probes A, B, C,
   one LinkedIn PlatformPost per probe, and one MetricSnapshot per probe.
7. Probe C ("Distribution Allergy") has the highest fitness-relevant metrics in its snapshot.
