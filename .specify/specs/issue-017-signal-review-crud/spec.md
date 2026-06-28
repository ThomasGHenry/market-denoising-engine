# Spec: SignalReview CRUD (Issue #17)

## Status: approved

## Context

Probes require signal reviews to capture the human-judgment layer of market learning. A SignalReview encodes what was observed, what it means, and what to do next — as three permanently separate fields per ADR 0102. This separation is the auditability guarantee.

The inline review rendering in `apps/web/src/app/probes/[id]/page.tsx` (lines 61–75) will be replaced by dedicated `SignalReviewList` and `SignalReviewForm` components, and a `createSignalReview` server action will persist the data.

## Functional Requirements

- FR-001: A reviewer can submit a SignalReview for a probe with: signal strength, confidence, observation, interpretation, and optional decision.
- FR-002: The form presents `observation`, `interpretation`, and `decision` as three separately labeled sections — never merged.
- FR-003: `createSignalReview` validates that `probeId`, `signal`, `confidence`, `observation`, and `interpretation` are present; returns an error string if missing.
- FR-004: On successful creation the path `/probes/{probeId}` is revalidated and the user is redirected there.
- FR-005: `SignalReviewList` renders all reviews in reverse-chronological order (`reviewedAt desc`) with `observation`, `interpretation`, and `decision` displayed as separate labeled items.
- FR-006: `SignalReviewList` renders an empty-state message when no reviews exist.
- FR-007: The probe detail page (`page.tsx`) imports and renders `SignalReviewForm` and `SignalReviewList`, replacing the inline review block.

## Out of Scope (for this issue)

- Update / delete SignalReview
- `inferredAudience`, `inferredProblem`, `inferredPromise`, `inferredTags` fields (captured by schema, not by form)
- `trustAligned`, `shouldMutate` toggle UI (schema defaults apply)

## Critical Invariant (ADR 0102)

`observation`, `interpretation`, and `decision` MUST be stored and displayed as separate fields. The `createSignalReview` action writes them as three distinct Prisma fields. The form renders them as three distinct labeled controls. The list renders them as three distinct labeled values.
