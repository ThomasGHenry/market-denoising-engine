# Spec: Mutation CRUD (Issue #18)

## Status: approved

## Context

After a signal review signals that a probe should be mutated (`shouldMutate=true`), the user needs to record what specifically to try next. A Mutation captures the mutation type, a description of the variant idea, and its lifecycle status. Mutations are the bridge between a completed probe and the next probe population.

The Prisma schema for `Mutation`, `MutationType`, and `MutationStatus` already exists. `MutationType` and `MutationStatus` are also exported from `@template/domain` as TypeScript enums. This spec covers the server actions, the form component on the probe detail page, the mutations list page, and the promote-to-probe link.

## Functional Requirements

### FR-001 — createMutation server action

`createMutation` lives at `apps/web/src/app/mutations/actions.ts` with `'use server'` at the top.

It accepts `prevState: string | null` and `formData: FormData`.

It reads three fields from `formData`:
- `sourceProbeId` (string, required)
- `mutationType` (string, required)
- `description` (string, required)

Validation rules (return an error string if violated):
- `sourceProbeId` must be a non-empty string
- `mutationType` must be a value present in `Object.values(MutationType)` from `@template/domain`
- `description` must be a non-empty string after `.trim()`

On success:
- Calls `prisma.mutation.create` with `{ sourceProbeId, mutationType, description, status: 'OPEN' }`
- Calls `revalidatePath('/mutations')`
- Calls `revalidatePath('/probes/' + sourceProbeId)`
- Calls `redirect('/probes/' + sourceProbeId)` outside any try/catch block

### FR-002 — listMutations server action

`listMutations` lives in the same file as `createMutation`.

It returns all mutations where `status === 'OPEN'`, ordered by `createdAt` descending, with `sourceProbe` included (selecting `id` and `title`).

Return type: `Promise<Array<...>>` (inferred from Prisma include shape).

### FR-003 — updateMutationStatus server action

`updateMutationStatus` lives in the same file.

Signature: `updateMutationStatus(id: string, newStatus: string): Promise<string | null>`

Validation:
- `id` must be a non-empty string
- `newStatus` must be a value present in `Object.values(MutationStatus)` from `@template/domain`

On success:
- Calls `prisma.mutation.update({ where: { id }, data: { status: newStatus as MutationStatus } })`
- Calls `revalidatePath('/mutations')`
- Returns `null`

On validation failure: returns an error string.

### FR-004 — MutationForm component

`MutationForm` lives at `apps/web/src/app/probes/[id]/MutationForm.tsx`.

Props: `{ probeId: string }`

It is a client component (`'use client'`) that uses `useActionState` to bind `createMutation`.

Fields rendered:
- `sourceProbeId` — hidden input pre-filled with `probeId`
- `mutationType` — `<select>` with one `<option>` per `MutationType` enum value; default option has value `""` and label `"Select type"`
- `description` — `<textarea>` with `name="description"`, required

It displays the error string returned by `createMutation` when non-null.

It renders a submit button with label `"Create Mutation"`.

### FR-005 — Probe detail page integration

`apps/web/src/app/probes/[id]/page.tsx` imports and renders:
- `MutationForm` (passing `probeId={probe.id}`)
- A mutation list section that renders `probe.mutations` (already included in the `loadProbe` query at line 22)

The mutation list section renders each mutation's `mutationType`, `description`, `status`, and `createdAt`.

Each mutation in the list renders a "Create probe from mutation" link (FR-006).

The existing `loadProbe` query already includes `mutations: { orderBy: { createdAt: 'desc' } }` — no change to the query is needed.

### FR-006 — "Create probe from mutation" link

For each mutation in the probe detail page mutation list, a link navigates to `/probes/new` pre-filled with:
- `rawInput` set to the mutation's `description` (URL-encoded)
- `parentProbeId` set to `mutation.sourceProbeId`

The link is rendered as a Next.js `<Link>`:

```
href={`/probes/new?rawInput=${encodeURIComponent(mutation.description)}&parentProbeId=${mutation.sourceProbeId}`}
```

Label: `"Create probe from mutation"`

This is a link navigation, not a server action. No form submission occurs.

### FR-007 — /mutations page

`apps/web/src/app/mutations/page.tsx` is a server component.

It calls `listMutations()` and renders a table or list of all OPEN mutations.

Each row displays:
- Source probe title (linked to `/probes/${mutation.sourceProbe.id}`)
- `mutationType`
- `description`
- `status`
- `createdAt` (formatted as ISO date string)
- The "Create probe from mutation" link (same href pattern as FR-006)

It renders an empty-state message when no OPEN mutations exist.

## File Layout

```
apps/web/src/app/mutations/
  actions.ts          — createMutation, listMutations, updateMutationStatus
  actions.test.ts     — unit tests for the three server actions
  page.tsx            — /mutations list page (server component)
  page.test.tsx       — render test for the list page

apps/web/src/app/probes/[id]/
  MutationForm.tsx       — client component, form to create a mutation
  MutationForm.test.tsx  — render and interaction tests
  page.tsx               — modified to include MutationForm and mutation list
```

## Domain Types Used

`MutationType` and `MutationStatus` are already defined in `packages/domain/src/enums.ts` and re-exported from `packages/domain/src/index.ts`. Import them from `@template/domain` in all files — do not re-define them.

## Enum Values (for test assertions)

`MutationType`: HOOK, AUDIENCE, PAIN, PROMISE, FORMAT, PLATFORM, CTA, TONE, PROOF, VISUAL, OTHER

`MutationStatus`: OPEN, DRAFTED, PUBLISHED, DONE, SKIPPED

## Out of Scope (this issue)

- Editing or deleting an existing mutation
- Filtering /mutations by status other than OPEN
- Automated mutation generation
- Pagination on the /mutations page
- The `/probes/new` page itself reading query-string pre-fill (that is a separate issue)

## Critical Invariant (ADR 0105)

All persistence goes through server actions. No API routes. No `'use client'` in `actions.ts`.

The "Create probe from mutation" interaction is a link navigation — it does not submit a form or call a server action.

`redirect()` in `createMutation` is called outside any try/catch block.
