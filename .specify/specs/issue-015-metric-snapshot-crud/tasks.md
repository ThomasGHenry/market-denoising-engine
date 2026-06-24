# MetricSnapshot CRUD — Tasks

All implementation tasks are preceded by a failing test (RED before GREEN).

## 1. actions.test.ts scaffold (RED → GREEN)

- [ ] Write `actions.test.ts` with vi.mock setup and import of all three action functions
- [ ] Run: confirm RED (module not found)
- [ ] Create `actions.ts` stub exporting the three function signatures
- [ ] Run: confirm GREEN (imports resolve, no test failures yet)
- [ ] Commit: `test: scaffold actions test for MetricSnapshot CRUD (#15)`

## 2. createMetricSnapshot — validation (RED → GREEN → REFACTOR)

- [ ] Write test: returns error when `platformPostId` is missing
- [ ] Write test: returns error when `capturedAt` is missing
- [ ] Run: confirm RED
- [ ] Implement validation guards in `createMetricSnapshot`
- [ ] Run: confirm GREEN
- [ ] Commit: `feat: validate required fields in createMetricSnapshot (#15)`

## 3. createMetricSnapshot — happy path (RED → GREEN → REFACTOR)

- [ ] Write test: calls `prisma.metricSnapshot.create` with correct data and redirects
- [ ] Run: confirm RED
- [ ] Implement full `createMetricSnapshot` body (parseOptionalInt, create, revalidate, redirect)
- [ ] Run: confirm GREEN
- [ ] Commit: `feat: implement createMetricSnapshot (#15)`

## 4. updateMetricSnapshot — validation (RED → GREEN)

- [ ] Write test: returns error when `id` is missing
- [ ] Write test: returns error when `platformPostId` is missing
- [ ] Write test: returns error when `capturedAt` is missing
- [ ] Run: confirm RED
- [ ] Implement validation guards in `updateMetricSnapshot`
- [ ] Run: confirm GREEN

## 5. updateMetricSnapshot — happy path (RED → GREEN → REFACTOR)

- [ ] Write test: calls `prisma.metricSnapshot.update` with correct data, revalidates, returns null
- [ ] Run: confirm RED
- [ ] Implement full `updateMetricSnapshot` body
- [ ] Run: confirm GREEN
- [ ] Commit: `feat: implement updateMetricSnapshot (#15)`

## 6. deleteMetricSnapshot — validation (RED → GREEN)

- [ ] Write test: returns error when `id` is missing
- [ ] Write test: returns error when `platformPostId` is missing
- [ ] Run: confirm RED
- [ ] Implement validation guards in `deleteMetricSnapshot`
- [ ] Run: confirm GREEN

## 7. deleteMetricSnapshot — happy path (RED → GREEN → REFACTOR)

- [ ] Write test: calls `prisma.metricSnapshot.delete`, revalidates, returns null
- [ ] Run: confirm RED
- [ ] Implement full `deleteMetricSnapshot` body
- [ ] Run: confirm GREEN
- [ ] Commit: `feat: implement deleteMetricSnapshot (#15)`

## 8. MetricSnapshotList (RED → GREEN → REFACTOR)

- [ ] Write `MetricSnapshotList.test.tsx`: renders snapshot capturedAt and impressions/likes
- [ ] Write test: renders empty-state message when snapshots array is empty
- [ ] Run: confirm RED
- [ ] Create `MetricSnapshotList.tsx` server component
- [ ] Run: confirm GREEN
- [ ] Commit: `feat: add MetricSnapshotList component (#15)`

## 9. MetricSnapshotForm (RED → GREEN → REFACTOR)

- [ ] Write `MetricSnapshotForm.test.tsx`: hidden `platformPostId` input is present
- [ ] Write test: `capturedAt` input is present and required
- [ ] Run: confirm RED
- [ ] Create `MetricSnapshotForm.tsx` client component
- [ ] Run: confirm GREEN
- [ ] Commit: `feat: add MetricSnapshotForm component (#15)`

## 10. Platform post detail page (RED → GREEN)

- [ ] Create `apps/web/src/app/platform-posts/[id]/page.tsx`
- [ ] Run full test suite to confirm all GREEN
- [ ] Commit: `feat: add platform post detail page with MetricSnapshot CRUD (#15)`

## 11. Gate check

- [ ] `npx nx run-many -t test` — all pass
- [ ] `npx nx run-many -t typecheck` — no errors
- [ ] `npx nx run-many -t lint` — no errors
