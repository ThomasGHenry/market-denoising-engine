# Tasks: Mutation CRUD (Issue #18)

## Phase 1 — Server Actions

- [x] T-01: Create spec artifacts (spec.md, tasks.md)
- [x] T-02: Write `apps/web/src/app/mutations/actions.test.ts` (RED) — import test: assert the module exports `createMutation`, `listMutations`, and `updateMutationStatus`; run, see fail
- [x] T-03: Create `apps/web/src/app/mutations/actions.ts` stub exporting three empty/throwing functions (GREEN for T-02)
- [x] T-04: Commit: `test: add actions stub import test for mutations (#18)`
- [x] T-05: Write test (RED) — `createMutation` returns error string when `sourceProbeId` is empty
- [x] T-06: Implement `sourceProbeId` presence guard in `createMutation` (GREEN)
- [x] T-07: Write test (RED) — `createMutation` returns error string when `mutationType` is not in `MutationType` enum values
- [x] T-08: Implement `mutationType` enum validation (GREEN)
- [x] T-09: Write test (RED) — `createMutation` returns error string when `description` is blank
- [x] T-10: Implement `description` presence guard (GREEN)
- [x] T-11: Write test (RED) — `createMutation` calls `prisma.mutation.create` with correct data when all fields are valid; mock `prisma` and `redirect`
- [x] T-12: Implement `prisma.mutation.create` call, `revalidatePath` calls, and `redirect` call in `createMutation` (GREEN)
- [x] T-13: Commit: `feat: add createMutation server action (#18)`
- [x] T-14: Write test (RED) — `updateMutationStatus` returns error string when `id` is empty
- [x] T-15: Implement `id` guard in `updateMutationStatus` (GREEN)
- [x] T-16: Write test (RED) — `updateMutationStatus` returns error string when `newStatus` is not in `MutationStatus` enum values
- [x] T-17: Implement `newStatus` enum validation (GREEN)
- [x] T-18: Write test (RED) — `updateMutationStatus` calls `prisma.mutation.update` and `revalidatePath('/mutations')` when inputs are valid
- [x] T-19: Implement `prisma.mutation.update` and `revalidatePath` calls in `updateMutationStatus` (GREEN)
- [x] T-20: Commit: `feat: add updateMutationStatus server action (#18)`
- [x] T-21: Write test (RED) — `listMutations` calls `prisma.mutation.findMany` with `where: { status: 'OPEN' }`, `orderBy: { createdAt: 'desc' }`, and `include: { sourceProbe: { select: { id: true, title: true } } }`
- [x] T-22: Implement `listMutations` (GREEN)
- [x] T-23: Commit: `feat: add listMutations server action (#18)`

## Phase 2 — MutationForm Component

- [x] T-24: Write `apps/web/src/app/probes/[id]/MutationForm.test.tsx` (RED) — render test: assert the component renders a `<form>` containing a hidden `sourceProbeId` input, a `<select>` for `mutationType`, and a `<textarea>` for `description`
- [x] T-25: Create `MutationForm.tsx` stub that renders the required elements (GREEN)
- [x] T-26: Commit: `test: add MutationForm render test (#18)`
- [x] T-27: Write test (RED) — `MutationForm` renders one `<option>` for each `MutationType` enum value plus the default empty option
- [x] T-28: Implement full `<select>` option list from `Object.values(MutationType)` (GREEN)
- [x] T-29: Write test (RED) — `MutationForm` displays an error string when the action state is non-null
- [x] T-30: Implement error display using `useActionState` state value (GREEN)
- [x] T-31: Commit: `feat: add MutationForm component (#18)`

## Phase 3 — /mutations Page

- [x] T-32: Write `apps/web/src/app/mutations/page.test.tsx` (RED) — render test: mock `listMutations` returning an empty array; assert the page renders an empty-state message
- [x] T-33: Create `apps/web/src/app/mutations/page.tsx` that calls `listMutations` and renders empty-state (GREEN)
- [x] T-34: Commit: `test: add mutations list page empty-state test (#18)`
- [x] T-35: Write test (RED) — `page.tsx` renders one row per mutation including source probe title, `mutationType`, `description`, `status`, and a "Create probe from mutation" link with correct `href`
- [x] T-36: Implement full mutation row rendering including the promote link (GREEN)
- [x] T-37: Commit: `feat: add /mutations list page (#18)`

## Phase 4 — Probe Detail Page Integration

- [x] T-38: Write test (RED) — probe detail `page.tsx` renders `MutationForm` when probe has no mutations (update existing page test or add a new test file for the mutations section)
- [x] T-39: Modify `apps/web/src/app/probes/[id]/page.tsx` to import and render `MutationForm` and the mutation list section (GREEN)
- [x] T-40: Write test (RED) — probe detail page renders a "Create probe from mutation" link for each mutation in `probe.mutations` with the correct `href`
- [x] T-41: Implement the mutation list section in `page.tsx` with the promote link per FR-006 (GREEN)
- [x] T-42: Commit: `feat: add MutationForm and mutation list to probe detail page (#18)`

## Phase 5 — Gate Checks and Close

- [x] T-43: Run `npx nx run-many -t test` — all tests pass
- [x] T-44: Run `npx nx run-many -t typecheck` — no errors
- [x] T-45: Run `npx nx run-many -t lint` — no errors
- [x] T-46: Push branch and close issue #18
