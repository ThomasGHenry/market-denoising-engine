# Tasks: Generation CRUD — Issue #12

## Phase 1: Schema & Domain Foundations

- [x] T01: Add ARCHIVED to GenerationStatus in prisma/schema.prisma
- [x] T02: Add fitnessScore Float? to Probe model in prisma/schema.prisma
- [x] T03: Add ARCHIVED to GenerationStatus in packages/domain/src/enums.ts
- [x] T04: Add fitnessScore: number | null to Probe interface in packages/domain/src/interfaces.ts
- [x] T05: Run typecheck to confirm schema+domain changes compile

## Phase 2: Server Actions — Test First

- [x] T06: Create apps/web/src/app/generations/actions.test.ts — write failing test: createGeneration returns error when title is empty
- [x] T07: Create apps/web/src/app/generations/actions.ts — stub createGeneration to make T06 pass (red → green)
- [x] T08: Refactor: implement full createGeneration validation (title, theme, fitnessFunction, parentId lookup)
- [x] T09: Write failing test: createGeneration happy path creates generation with DRAFT status
- [x] T10: Implement prisma.generation.create call to make T09 pass
- [x] T11: Write failing test: updateGenerationStatus rejects invalid transitions (DRAFT→RETIRED)
- [x] T12: Stub updateGenerationStatus to make T11 pass
- [x] T13: Write failing test: updateGenerationStatus valid transitions (DRAFT→ACTIVE, ACTIVE→ARCHIVED, ACTIVE→RETIRED)
- [x] T14: Implement full updateGenerationStatus with valid transition map
- [x] T15: Run npx nx run web:test — all tests green

## Phase 3: Pages

- [x] T16: Create apps/web/src/app/generations/loading.tsx
- [x] T17: Create apps/web/src/app/generations/error.tsx
- [x] T18: Create apps/web/src/app/generations/page.tsx — list page (empty state + table)
- [x] T19: Create apps/web/src/app/generations/new/GenerationForm.tsx — client form with useActionState
- [x] T20: Create apps/web/src/app/generations/new/page.tsx — loads eligible parents, renders GenerationForm
- [x] T21: Create apps/web/src/app/generations/[id]/loading.tsx
- [x] T22: Create apps/web/src/app/generations/[id]/error.tsx
- [x] T23: Create apps/web/src/app/generations/[id]/StatusControls.tsx — client component for status transitions
- [x] T24: Create apps/web/src/app/generations/[id]/page.tsx — detail page with probes ranked by fitness

## Phase 4: Quality Gates

- [x] T25: npm run typecheck — must pass with 0 errors
- [x] T26: npm run lint — must pass with 0 errors
- [x] T27: npm run build — must pass
- [x] T28: Mark all tasks complete, commit with message: feat: Generation CRUD — server actions and pages (#12)
