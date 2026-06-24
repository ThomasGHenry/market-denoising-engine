---
status: accepted
date: 2026-06-24
tags: [domain, data-model, auditability]
implementation: packages/domain/src/signal-review.ts
---

# 0102. Separate Observations, Interpretations, Decisions

## Context

MDE produces three epistemically distinct artifacts per signal review cycle:

- **Observations**: raw metric snapshots — what the platform reported, with no inference.
- **Interpretations**: what the operator believes the metrics indicate about probe performance or market signal.
- **Decisions**: what action to take next (mutate, retire, amplify, hold).

These three artifact types are frequently collapsed in analytics and CMS tooling into a
single "notes" or "review" field. Collapsing them destroys the audit trail: historical
records become ambiguous because it is no longer possible to distinguish "what the data
said" from "what we believed at the time" from "what we chose to do." This ambiguity
makes it impossible to review past decisions critically, identify interpretation bias, or
retrain the strategy model on clean inputs.

## Decision

`SignalReview` has three explicit, separate fields: `observation` (raw metrics, no
inference permitted), `interpretation` (operator's belief about what the metrics mean),
and `decision` (the chosen action and rationale). These fields are never merged, never
summarized into a single score, and never inferred from each other. `GenerationReview`
follows the same three-field pattern at the generation level.

Forms and APIs that write review records must present and accept these three fields as
distinct inputs. Read paths may aggregate or display them together, but write paths must
preserve their separateness.

## Consequences

The data model is more verbose than a single-field review. Forms require three distinct
input sections. Queries cannot reduce a review to a single value without losing
information. In return: every historical review remains unambiguous regardless of how
strategy evolves; hindsight bias cannot be introduced by editing a combined field;
observation data is clean enough to use as training signal for future fitness functions.
