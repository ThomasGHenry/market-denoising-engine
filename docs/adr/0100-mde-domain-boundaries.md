---
status: accepted
date: 2026-06-24
tags: [domain, architecture, boundaries]
implementation: packages/domain/src/signal.ts, packages/domain/src/window.ts, packages/db/src/repositories/
---

# 0100. MDE Domain Package Boundaries

## Context

Market Denoising Engine processes financial time-series data. Core domain
concepts (Signal, Noise, Window, Filter, Confidence) must not leak into
the web or infrastructure layers.

## Decision

`packages/domain` owns all MDE core types: `Signal`, `NoiseFilter`,
`WindowConfig`, `Confidence`. No direct Prisma imports in domain package.
`packages/db` maps domain types to Prisma models via repository interfaces
defined in domain and implemented in db.

## Consequences

- Domain types are serialization-agnostic and independently testable
- New data sources (stream, batch, CSV) implement the domain interface
- Prisma schema changes never break domain layer
