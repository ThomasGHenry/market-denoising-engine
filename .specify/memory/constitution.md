# Market Denoising Engine — Project Constitution

## Purpose

MDE disambiguates market signals from noise using statistical inference.
Instantiated from `ThomasGHenry/tgh-template` (Layer 0 + Layer 1).

## Core Constraints

- TypeScript throughout (Node 22)
- Prisma on Postgres for persistence
- Next.js 15 (App Router) on Vercel
- NX monorepo with module boundary enforcement

## Non-Negotiables (inherited from template)

1. All template governance ADRs apply unchanged
2. `commit-validation` is sole required GitHub status check
3. Conventional commits, 72-char header max
4. Squash-only merges, linear history
5. Phase 0 gates Phase 1

## MDE-Specific Additions

- Layer 2 ADRs start at 0100 to namespace away from template ADRs
