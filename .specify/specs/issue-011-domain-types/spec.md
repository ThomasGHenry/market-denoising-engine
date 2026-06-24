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

## Clarifications

### Enum Style

All status and categorical values are expressed as plain TypeScript `enum` (not `const enum`, not string union types). Each enum member's string value equals its identifier name exactly.

### Nullable vs Optional Fields

Fields that may have no value use `| null` (not `| undefined`). Optional relation references use the `?` suffix on the property name with a non-nullable type.

### Interface Naming

Interface names match Prisma model names exactly: `Generation`, `Probe`, `PlatformPost`, `MetricSnapshot`, `SignalReview`, `GenerationReview`, `Mutation`.

### DateTime Fields

All timestamp and date fields use the TypeScript `Date` type.

### Array Fields

All array fields use TypeScript array syntax: `string[]`, `Probe[]`, `PlatformPost[]`, etc.

### Relation Fields

Relation references (non-scalar fields pointing to other entities) are included as optional properties with the `?` suffix. Foreign key scalar fields (`generationId`, `probeId`, etc.) are required strings.

### Numeric Fields from Prisma Int

Prisma `Int` and `Int?` fields map to TypeScript `number` and `number | null` respectively.

### Probe effortMinutes

The Prisma schema shows `effortMinutes Int @default(10)`. In the domain interface this is `effortMinutes: number | null` to allow probes where effort has not been estimated.

### Transition Guards

`isValidGenerationTransition(from: GenerationStatus, to: GenerationStatus): boolean`
`isValidProbeTransition(from: ProbeStatus, to: ProbeStatus): boolean`

Both functions use a `Set<string>` of `"FROM:TO"` encoded pairs for O(1) lookup. RETIRED is a valid destination from every status including RETIRED itself.
