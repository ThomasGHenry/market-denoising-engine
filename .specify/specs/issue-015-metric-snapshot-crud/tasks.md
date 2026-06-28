# MetricSnapshot CRUD — Tasks

All implementation tasks are preceded by a failing test (RED before GREEN).

## 1. actions.test.ts scaffold (RED → GREEN)

- [x] Write `actions.test.ts` with vi.mock setup and import of all three action functions
- [x] Run: confirm RED (module not found)
- [x] Create `actions.ts` stub exporting the three function signatures
- [x] Run: confirm GREEN (imports resolve, no test failures yet)
- [x] Commit: `test: scaffold actions test for MetricSnapshot CRUD (#15)`

## 2. createMetricSnapshot — validation (RED → GREEN → REFACTOR)

- [x] Write test: returns error when `platformPostId` is missing
- [x] Write test: returns error when `capturedAt` is missing
- [x] Run: confirm RED
- [x] Implement validation guards in `createMetricSnapshot`
- [x] Run: confirm GREEN
- [x] Commit: `feat: validate required fields in createMetricSnapshot (#15)`

## 3. createMetricSnapshot — happy path (RED → GREEN → REFACTOR)

- [x] Write test: calls `prisma.metricSnapshot.create` with correct data and redirects
- [x] Run: confirm RED
- [x] Implement full `createMetricSnapshot` body (parseOptionalInt, create, revalidate, redirect)
- [x] Run: confirm GREEN
- [x] Commit: `feat: implement createMetricSnapshot (#15)`

## 4. updateMetricSnapshot — validation (RED → GREEN)

- [x] Write test: returns error when `id` is missing
- [x] Write test: returns error when `platformPostId` is missing
- [x] Write test: returns error when `capturedAt` is missing
- [x] Run: confirm RED
- [x] Implement validation guards in `updateMetricSnapshot`
- [x] Run: confirm GREEN

## 5. updateMetricSnapshot — happy path (RED → GREEN → REFACTOR)

- [x] Write test: calls `prisma.metricSnapshot.update` with correct data, revalidates, returns null
- [x] Run: confirm RED
- [x] Implement full `updateMetricSnapshot` body
- [x] Run: confirm GREEN
- [x] Commit: `feat: implement updateMetricSnapshot (#15)`

## 6. deleteMetricSnapshot — validation (RED → GREEN)

- [x] Write test: returns error when `id` is missing
- [x] Write test: returns error when `platformPostId` is missing
- [x] Run: confirm RED
- [x] Implement validation guards in `deleteMetricSnapshot`
- [x] Run: confirm GREEN

## 7. deleteMetricSnapshot — happy path (RED → GREEN → REFACTOR)

- [x] Write test: calls `prisma.metricSnapshot.delete`, revalidates, returns null
- [x] Run: confirm RED
- [x] Implement full `deleteMetricSnapshot` body
- [x] Run: confirm GREEN
- [x] Commit: `feat: implement deleteMetricSnapshot (#15)`

## 8. MetricSnapshotList (RED → GREEN → REFACTOR)

- [x] Write `MetricSnapshotList.test.tsx`: renders snapshot capturedAt and impressions/likes
- [x] Write test: renders empty-state message when snapshots array is empty
- [x] Run: confirm RED
- [x] Create `MetricSnapshotList.tsx` server component
- [x] Run: confirm GREEN
- [x] Commit: `feat: add MetricSnapshotList component (#15)`

## 9. MetricSnapshotForm (RED → GREEN → REFACTOR)

- [x] Write `MetricSnapshotForm.test.tsx`: hidden `platformPostId` input is present
- [x] Write test: `capturedAt` input is present and required
- [x] Run: confirm RED
- [x] Create `MetricSnapshotForm.tsx` client component
- [x] Run: confirm GREEN
- [x] Commit: `feat: add MetricSnapshotForm component (#15)`

## 10. Platform post detail page (RED → GREEN)

- [x] Create `apps/web/src/app/platform-posts/[id]/page.tsx`
- [x] Run full test suite to confirm all GREEN
- [x] Commit: `feat: add platform post detail page with MetricSnapshot CRUD (#15)`

## 11. Gate check

- [x] `npx nx run-many -t test` — all pass
- [x] `npx nx run-many -t typecheck` — no errors
- [x] `npx nx run-many -t lint` — no errors
