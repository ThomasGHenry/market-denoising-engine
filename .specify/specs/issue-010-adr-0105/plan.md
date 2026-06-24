# Plan: ADR 0105 — Next.js 15 App Router Architecture

## Objective

Write and commit `docs/adr/0105-nextjs-app-router-architecture.md` with `status: accepted`.
The ADR documents the canonical patterns all Layer 2 CRUD routes must follow.

## Architectural Decisions

### 1. Route structure

Convention: `/[entity]`, `/[entity]/new`, `/[entity]/[id]`, `/[entity]/[id]/edit`

Each entity gets a directory under `apps/web/src/app/`. Files per segment:

- `page.tsx` — list or detail view (Server Component)
- `new/page.tsx` — create form
- `[id]/page.tsx` — detail view
- `[id]/edit/page.tsx` — edit form
- `loading.tsx` — Suspense boundary placeholder (per Next.js convention)
- `error.tsx` — error boundary (must be Client Component per Next.js requirement)
- `actions.ts` — Server Actions for this entity (colocated with the route)

Rationale: mirrors the seven PRD entities; predictable path; aligns with Next.js docs.

### 2. Server Actions vs API Routes

Decision: **Server Actions exclusively** for all mutations (create, update, delete).

Rationale:
- MDE is a solo-operator internal tool with no public API consumers and no mobile clients.
- Server Actions eliminate a network round-trip abstraction layer; mutation logic lives
  alongside the route that triggers it.
- No need to manage CSRF tokens manually (Next.js handles this for Server Actions).
- ADR 0101 (manual-first) means no external automation callers that need HTTP endpoints.
- If a programmatic API is ever needed, a separate ADR should introduce it.

### 3. Data fetching pattern

Decision: **Server Components fetch data directly** using `@template/db`.

Pattern:
```typescript
// apps/web/src/app/generations/page.tsx
import { prisma } from '@template/db';

export default async function GenerationsPage() {
  const generations = await prisma.generation.findMany({ orderBy: { createdAt: 'desc' } });
  return <GenerationList generations={generations} />;
}
```

Rationale:
- Eliminates client-side data fetching boilerplate (no SWR, no React Query).
- Data is always fresh on navigation (no cache stale-while-revalidate to reason about).
- Solo-operator internal tool: latency of server-side fetch is acceptable.
- No client bundle size penalty.

### 4. Form pattern

Decision: **React 19 `useActionState` + HTML `<form action={serverAction}`** for all forms.

Pattern:
```typescript
// apps/web/src/app/generations/new/page.tsx
import { createGeneration } from '../actions';

export default function NewGenerationPage() {
  return (
    <form action={createGeneration}>
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

For forms requiring client-side state (e.g. optimistic feedback):
```typescript
'use client';
import { useActionState } from 'react';
import { createGeneration } from '../actions';

export default function NewGenerationForm() {
  const [state, action, isPending] = useActionState(createGeneration, null);
  return (
    <form action={action}>
      {state?.error && <p>{state.error}</p>}
      <input name="name" required />
      <button disabled={isPending}>Create</button>
    </form>
  );
}
```

Rationale:
- No third-party form library dependency.
- Progressive enhancement: works without JavaScript.
- Native to React 19 / Next.js 15.
- Aligns with "Audit trail over polish" — forms are for data entry, not animation.
- react-hook-form and Formik add client bundle weight without benefit for simple forms.

### 5. Error and loading states

Decision: **Next.js file conventions** — `loading.tsx` and `error.tsx` per route segment.

- `loading.tsx`: simple skeleton or spinner; Server Component is fine.
- `error.tsx`: must be `'use client'` (Next.js requirement); receives `error` and `reset` props.
- Server Action errors: return typed error state from the action; render in-form.

### 6. Domain logic placement

Decision: **Domain logic executes server-side only**, called from Server Actions or async
Server Components. Never imported into Client Components.

Rule:
- `packages/domain` may be imported by `apps/web` Server Components and Server Actions.
- `packages/domain` must never be imported by any file with `'use client'` at the top.
- `packages/scoring` follows the same rule.

This enforces ADR 0100 and the constitution's "Keep domain logic outside UI components."

### 7. Database access placement

Decision: `@template/db` (Prisma client) is imported only in:
- Server Components (`page.tsx`, `layout.tsx` without `'use client'`)
- Server Actions (`actions.ts`)

Never in Client Components. Never in `packages/domain` or `packages/scoring`.

Enforces ADR 0017, ADR 0022, and ADR 0104.

### 8. SignalReview / GenerationReview three-field invariant

ADR 0102 requires `observation`, `interpretation`, and `decision` to be separate fields.

Route implication: forms for `SignalReview` and `GenerationReview` must present three
distinct `<textarea>` inputs (one per field). A single "notes" textarea is forbidden.
Server Actions for these entities must accept and validate all three fields independently.

## Implementation steps

1. Write `docs/adr/0105-nextjs-app-router-architecture.md`
2. Run `bash scripts/ci/validate-adrs.sh docs/adr` — must exit 0
3. Run `npm run lint` — must exit 0
4. Commit: `docs: add ADR 0105 Next.js 15 App Router architecture (#10)`

## Files changed

- `docs/adr/0105-nextjs-app-router-architecture.md` (new)
- `.specify/specs/issue-010-adr-0105/spec.md` (new)
- `.specify/specs/issue-010-adr-0105/plan.md` (new)
- `.specify/specs/issue-010-adr-0105/tasks.md` (new)
