# Plan: SignalReview CRUD (Issue #17)

## Implementation Order

TDD discipline: each step is RED → GREEN → REFACTOR → commit.

### Step 1 — Server action scaffold (RED)

Write `actions.test.ts` with a single failing import test. Run — see it fail because the file does not exist.

### Step 2 — Server action GREEN

Create `actions.ts` with `createSignalReview` that satisfies all action tests:
- Validates `probeId`, `signal`, `confidence`, `observation`, `interpretation`
- Calls `prisma.signalReview.create`
- Calls `revalidatePath('/probes/{probeId}')`
- Calls `redirect('/probes/{probeId}')`

### Step 3 — SignalReviewList scaffold (RED)

Write `SignalReviewList.test.tsx` with a failing import test.

### Step 4 — SignalReviewList GREEN

Create `SignalReviewList.tsx` implementing the list with:
- Empty-state message
- Per-review rendering with observation / interpretation / decision as separate items

### Step 5 — SignalReviewForm scaffold (RED)

Write `SignalReviewForm.test.tsx` with a failing import test.

### Step 6 — SignalReviewForm GREEN

Create `SignalReviewForm.tsx` with:
- `useActionState(createSignalReview, null)`
- Separate labeled sections for observation / interpretation / decision
- Signal and confidence selects using domain enums

### Step 7 — Wire into probe detail page

Modify `apps/web/src/app/probes/[id]/page.tsx`:
- Import `SignalReviewForm` and `SignalReviewList`
- Remove inline review block (lines 61–75)
- Render `<SignalReviewList reviews={probe.reviews} />` and `<SignalReviewForm probeId={probe.id} />`

### Step 8 — Gate checks

Run all three nx targets (test, typecheck, lint). Fix any issues. Push.

## Architecture Notes

- Action lives under `apps/web/src/app/probes/[id]/signal-reviews/actions.ts` (co-located with the probe route segment)
- Form and List components live in the same directory
- `SignalStrength` and `Confidence` enums imported from `@template/domain`
- `prisma.signalReview` is the Prisma model accessor (lowercase, camelCase)
- No API routes (ADR 0105)
