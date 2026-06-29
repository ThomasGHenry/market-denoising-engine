---
status: accepted
date: 2026-06-24
tags: [domain, architecture, boundaries]
implementation: packages/domain/src/, packages/scoring/src/
---

# 0100. MDE Domain Package Boundaries

## Context

Market Denoising Engine is a content-analytics learning loop. Core domain
concepts (Generation, Probe, PlatformPost, MetricSnapshot, SignalReview,
Mutation) must not leak into infrastructure layers. Fitness computation
must remain a pure, deterministic function with no side effects.

## Decision

`packages/domain` owns all MDE core types and enums: `Generation`, `Probe`,
`PlatformPost`, `MetricSnapshot`, `SignalReview`, `GenerationReview`,
`Mutation`, and their associated enums (`GenerationStatus`, `ProbeStatus`,
`Format`, `Platform`, `SignalStrength`, `Confidence`, `MutationType`,
`MutationStatus`). It also owns lifecycle transition guards
(`isValidGenerationTransition`, `isValidProbeTransition`).

`packages/scoring` owns `computeFitness(input: FitnessInput): FitnessResult`
and the `FitnessInput` / `FitnessResult` types. It is a pure computation
package: no Prisma, no React, no domain package dependency.

Neither `packages/domain` nor `packages/scoring` may import from
`@prisma/client`, `react`, `@template/ui`, or any Next.js module.

`packages/db` holds the Prisma schema and exposes the singleton
`prisma` client. Server actions in `apps/web` use the Prisma client
directly — there is no repository interface layer.

## Consequences

- Domain types are serialization-agnostic and independently testable
- Fitness formula is versioned (`formulaVersion: 'default_v0'`) and
  auditable — stored on each `Generation` as `fitnessFunction`
- NX boundary tags (`scope:domain`, `scope:scoring`, `scope:web`) and
  eslint `no-restricted-imports` enforce these rules in CI
- Prisma schema changes propagate only to `packages/db` and the
  server actions that consume it
