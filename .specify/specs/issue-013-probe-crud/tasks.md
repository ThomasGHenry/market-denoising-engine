# Tasks — Probe CRUD

## Phase 1: Server Actions (TDD)

- [x] T01: Write failing test — `createProbe` returns error when title is empty
- [x] T02: Implement `createProbe` stub to pass T01
- [x] T03: Write failing test — `createProbe` returns error when generationId is empty
- [x] T04: Implement generationId validation to pass T03
- [x] T05: Write failing test — `createProbe` calls prisma.probe.create with correct data on happy path
- [x] T06: Implement full `createProbe` happy path to pass T05
- [x] T07: Write failing test — `updateProbeStatus` rejects invalid transition (e.g. PUBLISHED→DRAFT)
- [x] T08: Implement `updateProbeStatus` stub to pass T07
- [x] T09: Write failing test — `updateProbeStatus` allows valid transition (DRAFT→READY) and calls prisma
- [x] T10: Implement full `updateProbeStatus` happy path to pass T09

## Phase 2: Pages

- [x] T11: Create `/probes/new/ProbeForm.tsx` client component
- [x] T12: Create `/probes/new/page.tsx` server component
- [x] T13: Create `/probes/[id]/ProbeStatusControls.tsx` client component
- [x] T14: Create `/probes/[id]/page.tsx` server component with full probe detail

## Phase 3: Quality Gates

- [x] T15: `npx nx run web:test` — all tests pass
- [x] T16: `npm run typecheck` — clean
- [x] T17: `npm run lint` — clean
- [x] T18: `npm run build` — clean
- [x] T19: Commit with message `feat: Probe CRUD — server actions and pages (#13)`
