# Technical Plan: Generation CRUD — Issue #12

## Schema Changes

### 1. Add ARCHIVED to GenerationStatus enum

`packages/db/prisma/schema.prisma` — append `ARCHIVED` to `GenerationStatus`.

### 2. Add fitnessScore to Probe

`packages/db/prisma/schema.prisma` — add `fitnessScore Float?` to the `Probe` model.

Run `npm run db:migrate` (dev migration) after both changes.

### 3. Update domain enums.ts

`packages/domain/src/enums.ts` — add `ARCHIVED = 'ARCHIVED'` to `GenerationStatus`.
The Probe interface in `interfaces.ts` already has `fitnessScore` documented as `number | null` in the issue description but is missing from the file — add `fitnessScore: number | null`.

## File Structure

```
apps/web/src/app/
  generations/
    page.tsx              # List: Server Component, queries DB directly
    loading.tsx           # Suspense skeleton
    error.tsx             # Error boundary (use client)
    actions.ts            # createGeneration, updateGenerationStatus
    new/
      page.tsx            # Create form wrapper (Server Component for initial data)
      GenerationForm.tsx  # 'use client' form with useActionState
    [id]/
      page.tsx            # Detail: Server Component
      loading.tsx
      error.tsx
      StatusControls.tsx  # 'use client' status transition buttons
```

## Server Actions (`actions.ts`)

### createGeneration

Input:
```typescript
{ title: string; theme: string; fitnessFunction: string; parentId?: string }
```

- Validates title and theme are non-empty strings
- Validates fitnessFunction === 'default_v0'
- If parentId provided, verifies the referenced generation exists
- Creates generation with status DRAFT
- Returns `{ generation: Generation }` on success or `{ error: string }` on failure
- Calls `revalidatePath('/generations')` on success

### updateGenerationStatus

Input:
```typescript
{ id: string; targetStatus: GenerationStatus }
```

- Loads the current generation
- Validates transition: DRAFT→ACTIVE, ACTIVE→ARCHIVED, ACTIVE→RETIRED only
- Applies the update
- Returns `{ generation: Generation }` on success or `{ error: string }` on failure
- Calls `revalidatePath('/generations')` and `revalidatePath('/generations/[id]')` on success

## Page Components

### `/generations` (list page)

Server Component. Queries:
```typescript
prisma.generation.findMany({
  include: { probes: { select: { fitnessScore: true } } },
  orderBy: { createdAt: 'desc' },
})
```

Derives per-generation:
- `probeCount`: `generation.probes.length`
- `topFitness`: `Math.max(...scores)` where scores are non-null; null if none

### `/generations/new` (create form)

Server Component loads eligible parents:
```typescript
prisma.generation.findMany({
  where: { status: { in: ['ACTIVE', 'ARCHIVED'] } },
  select: { id: true, title: true },
  orderBy: { createdAt: 'desc' },
})
```

Passes to `GenerationForm` client component.

`GenerationForm` uses `useActionState(createGeneration, null)` for pending state and inline errors.

### `/generations/[id]` (detail page)

Server Component queries:
```typescript
prisma.generation.findUnique({
  where: { id },
  include: {
    probes: { orderBy: [{ fitnessScore: 'desc' }, { createdAt: 'asc' }] },
    parent: { select: { id: true, title: true } },
  },
})
```

Probes with null fitnessScore sort last (Prisma nulls last by default for desc; confirm behaviour or handle in-memory).

Renders `StatusControls` client component with current status and generation id.

`StatusControls` calls `updateGenerationStatus` action and triggers revalidation.

## Testing Strategy

Tests live at `apps/web/src/app/generations/actions.test.ts`.

Mock `@template/db` using `vi.mock`. Tests cover:

- `createGeneration`: happy path, missing title, missing theme, invalid fitnessFunction, non-existent parentId
- `updateGenerationStatus`: DRAFT→ACTIVE (valid), ACTIVE→ARCHIVED (valid), ACTIVE→RETIRED (valid), invalid transitions (DRAFT→RETIRED, ARCHIVED→ACTIVE)

## Type Constraints

- Server Actions and Server Components import `@prisma/client` types via `@template/db`
- No domain type imports in `apps/web` (domain package not in web dependencies)
- `'use client'` files receive only serialisable props — no Prisma objects passed directly; pass only primitives and plain objects
- Status controls receive `id: string` and `status: string` only

## Migrations

Since there is no DATABASE_URL in the current dev environment (no running Postgres), prisma migrations will be included as schema-only changes committed alongside the code. The CI `validate-prisma-schema` job validates schema syntax. The migration can be run when a DATABASE_URL is available.

Actually: the CI phase 0 runs `prisma validate`, not `prisma migrate`. Schema changes are safe to commit without running migration. The db:migrate command requires DATABASE_URL at runtime.

## Completeness Surface (from /qreview planning preamble)

- Config: no env changes needed; DATABASE_URL already documented
- Indexes: Prisma default CUID @id on all models; no additional indexes needed for MVP
- Rules: status transition validation in server action (not DB constraint)
- Types: Prisma-generated types used; domain enums updated; interfaces.ts updated
- Routes: `/generations`, `/generations/new`, `/generations/[id]` — all covered
- Cross-layer alignment: Server Components fetch DB; Client Components receive primitives only; Server Actions own mutations
