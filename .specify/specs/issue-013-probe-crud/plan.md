# Technical Plan — Probe CRUD

## Files to Create

```
apps/web/src/app/probes/
  actions.ts                  Server Actions: createProbe, updateProbeStatus
  actions.test.ts             Vitest unit tests for both actions
  new/
    page.tsx                  Server Component: loads generations and parent probes, renders ProbeForm
    ProbeForm.tsx             'use client', useActionState
  [id]/
    page.tsx                  Server Component: loads full probe detail
    ProbeStatusControls.tsx   'use client', useTransition
```

## Server Actions (`actions.ts`)

### `createProbe(prevState, formData)`

Input fields from FormData:
- `generationId` (required)
- `title` (required)
- `rawInput` (required)
- `contentText` (optional)
- `format` (required, one of Format enum values)
- `tags` (optional, comma-separated string → split, trim, filter empty)
- `effortMinutes` (optional, default 10, parse as int)
- `parentProbeId` (optional)

Validation: generationId, title, rawInput must be non-empty.
On success: `redirect('/generations/' + generationId)` — this satisfies Scenario 1 (probe appears in generation list).
Return type: `string | null` (error message or null).

### `updateProbeStatus(id, currentStatus, newStatus)`

Uses `isValidProbeTransition` from `@template/domain` to guard the transition.
On success: `revalidatePath('/probes/' + id)` and return null.
On invalid transition: return error string.
Return type: `string | null`.

## Pages

### `/probes/new/page.tsx`

Server Component.
- Reads `?generationId` from searchParams.
- Queries all ACTIVE generations for the generation select.
- If `generationId` is provided, queries probes from that generation in DRAFT/READY/PUBLISHED for the parent probe select.
- Renders `ProbeForm` with those options.

### `/probes/new/ProbeForm.tsx`

`'use client'`.
- `useActionState(createProbe, null)`.
- Form fields: generationId select (pre-selected if provided), title, rawInput, contentText textarea, format select, tags text, effortMinutes number, parentProbeId select.
- On generationId change, page re-render is handled server-side (no client-side fetch needed — form submits or user navigates with `?generationId=xxx`).

### `/probes/[id]/page.tsx`

Server Component.
- Loads probe with: `generation`, `parentProbe { id, title }`, `platformPosts { snapshots }`, `reviews`, `mutations`.
- Renders all fields.
- Fitness score: show `fitnessScore.toFixed(2)` if not null, else `"—"`.
- Renders `ProbeStatusControls`.

### `/probes/[id]/ProbeStatusControls.tsx`

`'use client'`.
- `useTransition`.
- Calls `updateProbeStatus`.
- Shows appropriate buttons per current status (mirroring StatusControls pattern for generations).

## Domain types used

Import `ProbeStatus`, `Format`, `isValidProbeTransition` from `@template/domain`.
Import `prisma` from `@template/db` in Server Components and actions only.

## Key invariants

- `packages/domain` not imported in client components — only enums needed for display; inline the values or cast strings.
- No comments in code.
- Named functions for all callbacks.
- Top-down newspaper ordering.
