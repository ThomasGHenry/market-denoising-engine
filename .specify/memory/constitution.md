# Market Denoising Engine — Project Constitution

## Purpose

MDE is a decision-learning system for emergent brand strategy.

It treats content as **market probes** — rough, low-cost experiments published to
platforms, observed for response, evaluated for relative fitness, and used to generate
the next population of variants.

The goal is not to automate content creation. The goal is a **learning spine**: make
the process of discovering what resonates visible, measurable, and repeatable.

## North Star

> Which content and brand decisions are moving us toward a viable audience, market,
> message, offer, and trust position — with what evidence, at what confidence, and
> what should we try next?

## Philosophy

**Strategy is derived, not prescribed.** Do not require the user to define a complete
brand strategy upfront. Let strategy emerge from repeated interaction with the market.

**Bounded noise, not destructive randomness.** Rough, half-formed, weird content is
acceptable. Dishonest, untagged, or unlearnable content is not.

**Compare within generations.** There is no universal quality score. Probes are
evaluated relative to their generation population.

**Fitness is multi-dimensional.** Engagement alone is not fitness. A single qualified
DM may outweigh many empty likes. Optimize for learning, not vanity metrics.

**Observations, interpretations, and decisions are separate.** Raw metrics, human
interpretation, and strategic conclusions must never be collapsed into a single record.
This separation is what keeps the system auditable.

**Human judgment is first-class.** Metrics are evidence, not truth. The system
surfaces signal; humans decide what it means and what comes next.

**Manual-first.** Automate only after a human process has been repeated enough to
understand it, its inputs and outputs are stable, and its failure modes are acceptable.

**Audit trail over polish.** Preserving what happened, when, and why a decision was
made is more important than beautiful UI.

## Process Non-Negotiables

These apply to all work on this project and may not be overridden by any ticket,
deadline, or convenience argument.

1. Add an ADR before any consequential architecture choice.
2. Update the PRD or a feature spec before implementing non-trivial changes.
3. Keep domain logic outside UI components.
4. Keep the system manual-first; do not add automation prematurely.
5. Separate observations, interpretations, and decisions — always, everywhere.
6. Make fitness functions explicit and versioned; never hide the formula.
7. Preserve the full audit trail; do not delete or collapse historical records.
8. The first successful learning loop matters more than polished UI.

## Work Selection

1. Work selection rubric: work-selection-rubric skill.
2. Cooling period: **none** — the backlog is PRD-derived and systematically decomposed; impulse-filing protection is not needed.
3. Issue sequence: rubric C3 (force multiplier) determines order; delegate one issue at a time to the SDD agent.

## Inherited Governance (tgh-template)

1. All template governance ADRs apply unchanged.
2. `commit-validation` is the sole required GitHub branch protection check.
3. Conventional commits; 72-character header max.
4. Squash-only merges; linear history.
5. Phase 0 (governance) gates Phase 1 (compute) in CI.
6. Layer 2 ADRs start at 0100 to namespace away from template ADRs.
