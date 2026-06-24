# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev
npm run dev              # Next.js dev server (apps/web)

# Build / check all packages
npm run build            # nx run-many -t build
npm run typecheck        # nx run-many -t typecheck
npm run lint             # nx run-many -t lint
npm run test             # nx run-many -t test (Vitest, all packages)

# Single package
npx nx run web:test
npx nx run config:test
npx nx run domain:test

# Single test file
npx vitest run packages/scoring/src/fitness.test.ts

# E2E (requires running app)
npm run e2e              # Playwright against PLAYWRIGHT_BASE_URL

# Database
npm run db:generate      # prisma generate
npm run db:migrate       # prisma migrate dev
npm run db:seed          # tsx packages/db/prisma/seed.ts
npm run db:studio        # prisma studio
```

## Architecture

Three-layer system:

- **Layer 0** — Governance (stack-agnostic, always-on): ADR enforcement, conventional commits, secret scanning, CI gate structure, GitHub IaC.
- **Layer 1** — nextjs-vercel-prisma overlay: NX monorepo scaffold, Prisma singleton, CVA UI components, Zod env validation.
- **Layer 2** — MDE application (to be built): generations, probes, fitness scoring, signal reviews, mutations.

### Package dependency graph

```
apps/web          → @template/ui, @template/db, @template/config, @template/domain, @template/scoring
packages/scoring  → @template/domain (types only)
packages/domain   → nothing (pure TS)
packages/db       → @prisma/client
packages/ui       → react (peer)
packages/config   → zod
```

**Critical boundary rule**: `packages/domain` and `packages/scoring` must never import from `@prisma/client`, React, or `@template/ui`. Domain is pure TypeScript. (ADR 0017 — NX boundary tags not yet applied; enforce manually until fixed.)

### CI pipeline

`1-commit.yml` runs two phases:

- **Phase 0** (governance — runs first, fast): secret scan, workflow lint, ADR structure, commit messages, shell lint, Prisma schema validity.
- **Phase 1** (compute — gated on Phase 0): typecheck, lint, test, build.

`commit-validation` is the sole required GitHub status check (aggregate job). Adding a validation job means adding it to `1-commit.yml` **and** to `commit-validation`'s `needs:` array only — branch protection settings do not change.

### ADR namespace

- `0001–0023`: template governance — do not modify.
- `0100+`: MDE-specific decisions.

Run `bash scripts/ci/validate-adrs.sh docs/adr` to validate locally. Every ADR needs YAML frontmatter (`status`, `date`, `tags`) and sections `## Context`, `## Decision`, `## Consequences`.

### Database

Prisma config lives at `packages/db/prisma.config.ts` (not the default location). All Prisma CLI commands require `--config packages/db/prisma.config.ts`. The `DATABASE_URL` env var is required and validated at startup via `packages/config`.

PrismaClient is a singleton via `globalThis` in `packages/db/src/index.ts` to survive Next.js hot-reload.

### Fitness scoring

`packages/scoring` exposes `computeFitness(input: FitnessInput): FitnessResult`. Formula is named (`default_v0`) and versioned — each `Generation` stores its `fitnessFunction` name. Null metrics count as zero. Scoring must remain pure (no DB access, no side effects).

### Key invariant

`SignalReview` has three separate fields — `observation`, `interpretation`, `decision` — that must never be collapsed into one. This is the auditability guarantee. See `docs/prd/mde-prd.md §4.5`.

## Spec-first workflow

Before any non-trivial implementation: update `docs/prd/mde-prd.md` or a feature spec, write or update an ADR if the change is architectural, then implement. See `docs/adr/README.md` for when an ADR is required vs a `DECISIONS.md` entry.

## Peer projects (reference)

Cross-project audit (2026-06-24) compared 8 sibling projects in `~/code/`. MDE inherits the best patterns:

| Pattern | Source | MDE status |
|---|---|---|
| Phase 0 CI gate (governance before compute) | buen-vecino | ✅ ADR 0005 |
| Aggregate validator (single required status check) | buen-vecino | ✅ ADR 0002 |
| Three-layer validation (pre-commit / pre-push / CI) | buen-vecino | ✅ ADR 0023 |
| Spec-first + constitution | buen-vecino, diane-v01 | ✅ `.specify/memory/constitution.md` |
| Two-template bug workflow (triage → triaged) | passive-symptom-tracker | ✅ issue templates |
| ADR frontmatter enforcement in CI | passive-symptom-tracker | ✅ Phase 0 |
| GitHub-native DORA instrumentation | burnout-beacon | ✅ ADR 0007 (template) |
| Tooling issue linked to governing ADR | buen-vecino | ✅ tooling.yml |
| Coverage ratcheting | diane-v01 | deferred |
| Stryker mutation testing | burnout-beacon, diane-v01 | deferred |

For CI/CD patterns: `~/code/buen-vecino/.github/workflows/`
For testing depth: `~/code/diane-v01/` (82 specs, coverage ratchet, Stryker)
For DORA instrumentation: `~/code/burnout-beacon/` (GitHub-native, zero SaaS)
