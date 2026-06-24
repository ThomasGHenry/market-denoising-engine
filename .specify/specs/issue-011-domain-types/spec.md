# Spec: Domain Types and Transition Guards

## Problem

The MDE system spans multiple consumers — a web application and a scoring engine — that both need to reason about the same business entities. Without a shared, framework-agnostic domain vocabulary, each consumer risks defining its own partial view of the domain, leading to drift, duplication, and unsafe assumptions about what values are valid.

## What Consumers Gain

Once this package delivers a complete domain vocabulary:

- The web application can import entity shapes and status enumerations without coupling to any persistence or rendering framework
- The scoring engine can reference the same entity types without importing persistence concerns
- Any future consumer gains type-safe access to the domain model from day one
- Status transitions can be validated at both compile time (wrong enum value) and runtime (illegal state change) across every consumer

## Business Rules

### Generation Lifecycle

A generation is a themed collection of probes. Its lifecycle reflects the editorial and experimental progress of a content generation campaign:

- A generation begins as a draft
- It becomes active when selected for content creation
- It advances to published once probes have been distributed
- After signal review, it reaches reviewed status
- A reviewed generation may spawn mutations, marking it as mutated
- Any generation at any lifecycle stage may be retired — a terminal state

### Probe Lifecycle

A probe is a single content execution within a generation. Its lifecycle parallels the generation lifecycle but is independently tracked:

- A probe begins as a draft
- When ready for production, it advances to ready
- After distribution, it is published
- After signal review, it reaches reviewed status
- A reviewed probe may be mutated
- Any probe at any stage may be retired — a terminal state

### Auditability Guarantee

Signal reviews carry three mandatory, separate fields: observation, interpretation, and decision. These fields must never be collapsed into one. The separation is the auditability guarantee — it preserves the full chain of reasoning from raw observation through interpretation to the final editorial decision. Collapsing them would destroy the ability to audit why a decision was reached.

## Success Criteria

- A type-safe domain model is importable across all packages using a single package name
- All domain entity shapes are expressed purely in terms of the domain — no persistence framework, rendering framework, or external library is required to use them
- Status enumerations cover all valid values for all lifecycle-bearing entities
- Status transition rules are enforced at runtime: a call to a transition guard returns a boolean answer to whether a given status change is permitted
- The auditability guarantee is structurally enforced: observation, interpretation, and decision exist as three separate, named fields on signal reviews
