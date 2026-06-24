---
status: accepted
date: 2026-06-24
tags: [architecture, nextjs, app-router]
---

# 0105. Next.js 15 App Router Architecture

## Context

Seven Layer 2 CRUD features (#9, #12–#18, #19) cover the core MDE entities: Generation,
Probe, PlatformPost, MetricSnapshot, SignalReview, GenerationReview, and Mutation. Each
requires list, detail, create, and edit views backed by database mutations.

Without a documented canonical pattern, each implementer independently decides: where
routes live, how data is fetched, whether to use Server Actions or API Routes, which form
library handles state, and where domain logic executes. These independent decisions produce
an incoherent codebase that cannot be maintained by a single operator across dozens of
routes.

MDE is a solo-operator internal tool. It has no public API consumers, no mobile clients,
and no external automation callers (ADR 0101). The stack is Next.js 15 App Router, Prisma
via `@template/db`, and domain types via `packages/domain`. These constraints favour
simplicity and colocation over flexibility and abstraction.

## Decision

### Route structure

Each entity occupies a directory under `apps/web/src/app/[entity]/`. Standard segments:

| Segment | Purpose |
|---|---|
| `page.tsx` | List view (Server Component) |
| `new/page.tsx` | Create form |
| `[id]/page.tsx` | Detail view (Server Component) |
| `[id]/edit/page.tsx` | Edit form |
| `loading.tsx` | Suspense placeholder per segment |
| `error.tsx` | Error boundary per segment (`'use client'`) |
| `actions.ts` | Server Actions colocated with the route |

### Mutations: Server Actions exclusively

All create, update, and delete operations use Server Actions defined in the colocated
`actions.ts` file. API Routes (`app/api/`) are not used for internal mutations.

Server Actions are invoked directly from `<form action={serverAction}>` or from
`useActionState`. They run on the server, have direct access to `@template/db`, and
require no separate HTTP endpoint or manual CSRF protection.

If a programmatic HTTP API is ever needed (e.g. for external integrations), a separate ADR
must be written before introducing API Routes.

### Data fetching: Server Components fetch directly

Async Server Components (`page.tsx`, `layout.tsx` without `'use client'`) import
`@template/db` and call Prisma directly. No client-side data fetching library (SWR, React
Query, `fetch` from a Client Component) is used for route data.

```typescript
import { prisma } from '@template/db';

export default async function GenerationsPage() {
  const generations = await prisma.generation.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return <GenerationList generations={generations} />;
}
```

### Forms: React 19 `useActionState` with HTML `<form>`

Simple forms use a plain `<form action={serverAction}>` with no `'use client'` directive.
Forms requiring pending state or inline error display use `useActionState`:

```typescript
'use client';
import { useActionState } from 'react';
import { createGeneration } from '../actions';

export default function NewGenerationForm() {
  const [state, action, isPending] = useActionState(createGeneration, null);
  return (
    <form action={action}>
      {state?.error && <p role="alert">{state.error}</p>}
      <input name="name" required />
      <button type="submit" disabled={isPending}>Create</button>
    </form>
  );
}
```

No third-party form library (react-hook-form, Formik, Zod-form) is introduced unless a
future ADR justifies it.

### Error and loading states

Each route segment may include:

- `loading.tsx` — rendered by React Suspense during async Server Component resolution;
  a simple skeleton is sufficient.
- `error.tsx` — must carry `'use client'`; receives `error: Error` and `reset: () => void`
  props; renders a message and retry button.

Server Action errors are returned as typed state objects (not thrown) and rendered inline
in the form.

### Domain logic placement

`packages/domain` and `packages/scoring` are imported only in:

- Async Server Components (files without `'use client'`)
- Server Actions (`actions.ts`)

No file marked `'use client'` may import from `packages/domain` or `packages/scoring`.
Domain logic never executes in the browser. This enforces ADR 0100 and the constitution's
requirement to keep domain logic outside UI components.

### Database access placement

`@template/db` (the Prisma singleton) is imported only in Server Components and Server
Actions. It is never imported in Client Components, `packages/domain`, or
`packages/scoring`. This enforces ADR 0017, ADR 0022, and ADR 0020.

### SignalReview and GenerationReview: three-field invariant

ADR 0102 requires `observation`, `interpretation`, and `decision` to be three separate,
never-merged fields. The route implication is:

- Forms for `SignalReview` and `GenerationReview` must render three distinct `<textarea>`
  elements, one for each field.
- A combined "notes" or "review" input is forbidden on write paths.
- Server Actions for these entities must accept, validate, and persist all three fields
  independently.

## Consequences

All seven CRUD feature issues can now be implemented by following this document. An
implementer picking up any feature issue needs no architectural decisions; only domain
knowledge about the specific entity.

The codebase will have no API Routes for internal mutations, no client-side data fetching
libraries, and no third-party form libraries — reducing the dependency surface and the
amount of client-side JavaScript shipped.

Future changes that deviate from these patterns (e.g. adding a public API, introducing
pagination with cursor-based client fetching) require a new or superseding ADR before
implementation.
