# MetricSnapshot CRUD — Technical Plan

## Files to create

| File | Purpose |
|------|---------|
| `apps/web/src/app/platform-posts/[id]/metric-snapshots/actions.ts` | Server actions: create, update, delete |
| `apps/web/src/app/platform-posts/[id]/metric-snapshots/actions.test.ts` | Unit tests for all three actions |
| `apps/web/src/app/platform-posts/[id]/metric-snapshots/MetricSnapshotForm.tsx` | Client component: create form |
| `apps/web/src/app/platform-posts/[id]/metric-snapshots/MetricSnapshotForm.test.tsx` | Render tests for the form |
| `apps/web/src/app/platform-posts/[id]/metric-snapshots/MetricSnapshotList.tsx` | Server component: list snapshots |
| `apps/web/src/app/platform-posts/[id]/metric-snapshots/MetricSnapshotList.test.tsx` | Render tests for the list |
| `apps/web/src/app/platform-posts/[id]/page.tsx` | Platform post detail page |

## Action signatures

```typescript
createMetricSnapshot(prevState: string | null, formData: FormData): Promise<string | null>
updateMetricSnapshot(prevState: string | null, formData: FormData): Promise<string | null>
deleteMetricSnapshot(prevState: string | null, formData: FormData): Promise<string | null>
```

All three follow the `useActionState` contract: return `null` on success, an error string on failure.

`createMetricSnapshot` also calls `redirect('/platform-posts/' + platformPostId)` on success (never returns `null` — redirect throws).

## Validation strategy

Inline guard clauses; no Zod. Mirrors `apps/web/src/app/platform-posts/actions.ts`.

## Mocking strategy (tests)

```typescript
vi.mock('@template/db', ...)
vi.mock('next/navigation', ...)
vi.mock('next/cache', ...)
```

Follows the pattern in `apps/web/src/app/platform-posts/actions.test.ts`.

## Numeric field parsing

A named inner function `parseOptionalInt` reads a FormData key and returns `number | undefined` (create) or `number | null` (update, to allow explicit null-out).

## Component constraints

- `MetricSnapshotList`: server component (no `'use client'`). Receives `MetricSnapshot[]` from parent page.
- `MetricSnapshotForm`: client component (`'use client'`). Uses `useActionState(createMetricSnapshot, null)`.

## Data flow

```
/platform-posts/[id]/page.tsx
  → prisma.platformPost.findUnique (include snapshots orderBy capturedAt desc)
  → <MetricSnapshotList snapshots={post.snapshots} />
  → <MetricSnapshotForm platformPostId={id} />
```

## Routing

- `GET /platform-posts/[id]` — detail page (new)
- `POST` (server action) — all mutations handled via form actions, no API routes needed
