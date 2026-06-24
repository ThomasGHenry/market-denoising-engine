---
status: accepted
date: 2026-06-24
tags: [domain, scoring, versioning]
implementation: packages/scoring/src/fitness.ts
---

# 0103. Versioned Fitness Function

## Context

Fitness scores rank probes within a generation. The formula that produces these scores
encodes the current understanding of what makes a probe valuable — a judgment that will
change as the operator learns more about which metrics predict durable brand signal.

If the fitness formula is mutated in place, historical scores become inconsistent:
probes from older generations were ranked under different rules. Comparing a generation
scored under `v0` to one scored under `v1` is meaningless unless the comparison is
explicit and intentional. Silent in-place formula changes also make it impossible to
audit why a past generation ranked its probes as it did.

## Decision

Each `Generation` record stores a `fitnessFunction` field containing the string name of
the formula used to score it (e.g. `"default_v0"`). The `packages/scoring` package
dispatches computation by resolving this name to a registered implementation at call
time. When a generation's fitness is recomputed (e.g. for display), the stored name is
used — not the current default.

New formula versions are added as new named implementations. Existing named
implementations are never mutated. Breaking changes to scoring logic require a new
version name. The `computeFitness` function is pure: no DB access, no side effects, no
global mutable state.

## Consequences

Named formula implementations must be retained as long as any `Generation` record
references them. Adding a new formula requires a new implementation and a new name string;
it does not affect existing generations. Deployments that change scoring logic are
additive, never destructive. Historical fitness scores remain reproducible and
cross-generation comparisons are valid when the `fitnessFunction` names match.
