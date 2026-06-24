# Spec: ADR 0105 — Next.js 15 App Router Architecture

## Feature

Issue #10 — [Tooling]: ADR 0105 — Next.js 15 App Router architecture

## Problem

Seven CRUD feature issues (#9, #12–#18, #19) are blocked because there is no documented,
agreed-upon architectural pattern for how Next.js 15 App Router is used in MDE. Without
this, each feature implementer would independently choose server action vs API route,
server component vs client component, and form library — producing an incoherent codebase
across the seven entities.

## User Outcome

When an engineer implements any CRUD route for any of the seven MDE entities (Generation,
Probe, PlatformPost, MetricSnapshot, SignalReview, GenerationReview, Mutation), they have
a single authoritative reference that answers:

- Where does the route live?
- How does data get fetched?
- How does a mutation happen?
- What does a form look like?
- Where does domain logic execute?
- How are errors and loading states shown?

They should be able to implement a new entity CRUD route by following the pattern, not by
making architectural decisions.

## Scope

### In scope

- Route structure convention for all seven MDE entity types
- Server Actions vs API Routes decision (mutations pattern)
- Data fetching pattern (server vs client components)
- Form pattern (what library / primitive handles form state and submission)
- Error and loading state pattern
- Domain logic placement rule (which layer, called from where)
- Database access placement rule (import from @template/db, server-side only)
- Key invariant: SignalReview and GenerationReview three-field separation (ADR 0102)

### Out of scope

- Implementation of any specific CRUD route (that is the job of #12–#18, #9, #19)
- Authentication and authorization patterns (not yet required for MVP)
- Pagination and search patterns (deferred until a route exists to need them)
- Real-time / optimistic UI patterns

## Success Criteria

1. `docs/adr/0105-nextjs-app-router-architecture.md` exists with `status: accepted`
2. `bash scripts/ci/validate-adrs.sh docs/adr` exits 0
3. `npm run lint` exits 0
4. All seven blocked feature issues have their architectural questions answered by the ADR
5. The ADR is committed to main
