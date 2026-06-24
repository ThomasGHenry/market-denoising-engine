# Technical Plan: packages/scoring

## Package layout

```
packages/scoring/
  package.json
  project.json
  tsconfig.json
  vitest.config.ts
  src/
    index.ts          ← barrel: re-exports types + computeFitness
    fitness.ts        ← FitnessInput, FitnessResult, computeFitness
    fitness.test.ts   ← Vitest unit tests
```

## Type design

```ts
export interface FitnessInput {
  likes?: number | null
  comments?: number | null
  shares?: number | null
  saves?: number | null
  follows?: number | null
  profileClicks?: number | null
  linkClicks?: number | null
  leads?: number | null
  qualitativeScore?: number | null
  effortMinutes?: number | null
  impressions?: number | null
}

export interface FitnessResult {
  rawScore: number
  scorePerEffortMinute: number | null
  scorePerImpression: number | null
  formulaVersion: 'default_v0'
}
```

`exactOptionalPropertyTypes` is `true` in `tsconfig.base.json`, so every optional field is typed `T | undefined`, not `T | undefined | null`. We union with `null` explicitly to allow callers to pass DB-sourced nullable values.

## Function design

```ts
export function computeFitness(input: FitnessInput): FitnessResult
```

Internal helper `metric(v)` coerces `null | undefined` → `0`, otherwise returns the number.

`scorePerEffortMinute` = `rawScore / effortMinutes` when `effortMinutes > 0`, else `null`.
`scorePerImpression`   = `rawScore / impressions`  when `impressions > 0`,   else `null`.

## Configuration files

### package.json
- `name`: `@template/scoring`
- `nx.tags`: `["scope:domain"]`
- `main`/`types`: `./src/index.ts` (NX source-first pattern, same as domain)
- devDeps: `typescript`, `vitest` (same versions as domain)

### project.json
- `name`: `scoring`
- `tags`: `["scope:domain"]`
- `targets.lint`: `@nx/eslint:lint` over `packages/scoring/**/*.ts`

### tsconfig.json
- `extends`: `../../tsconfig.base.json`
- `outDir`: `./dist`, `rootDir`: `./src`
- `include`: `src/**/*`

### vitest.config.ts
- Identical to domain package config

## Boundary constraints

- No import of `@template/domain` required — `FitnessInput` fields mirror `MetricSnapshot` but are independent types. Avoids coupling domain entity shape to scoring API.
- No Prisma, no React, no UI imports.

## Division-by-zero policy

`null` is returned (not `Infinity`, not `0`, not `NaN`) because:
- JSON-serialisable — Infinity is not
- Distinguishes "not computable" from "zero efficiency"
- Callers can handle null explicitly

## Versioning contract

`formulaVersion: 'default_v0'` is a string literal type on `FitnessResult`. A second formula adds:
```ts
export function computeFitnessV1(input: FitnessInput): FitnessResultV1
```
where `FitnessResultV1` has `formulaVersion: 'default_v1'`. The original export is never modified.
