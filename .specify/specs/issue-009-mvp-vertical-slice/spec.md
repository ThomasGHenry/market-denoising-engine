# Spec: Issue #9 — MVP Vertical Slice (Dashboard + Home Redirect)

**Status:** Ready for implementation
**PRD reference:** §12 MVP Pages
**ADR reference:** ADR-0105 (server-component-only data fetching)

---

## Scope

Two functional requirements remain from issue #9. All CRUD entities (#12–18) and fitness computation (#16) are complete. This spec covers only:

1. Home route redirect
2. Dashboard page with five learning-state cards

---

## FR-1: Home Route Redirect

**Route:** `GET /`

When a user navigates to `/`, the server immediately redirects to `/dashboard` with no intermediate render.

**Acceptance criteria:**

- Navigating to `/` results in a 307/308 redirect to `/dashboard`
- No HTML body is rendered for the `/` route
- The redirect is performed server-side using Next.js `redirect()`

**File:** `apps/web/src/app/page.tsx`

---

## FR-2: Dashboard Page

**Route:** `GET /dashboard`

The dashboard is a read-only, server-rendered overview of the current learning state. It surfaces five cards defined in PRD §12. No client-side interactivity is required for MVP.

**File:** `apps/web/src/app/dashboard/page.tsx`

**Constraints (ADR-0105):**

- The page component must be an async server component
- No `'use client'` directive anywhere in the dashboard module
- Must declare `export const dynamic = 'force-dynamic'` to prevent stale cached renders
- All database queries run in a single `loadDashboardData()` async helper via `Promise.all`

---

### Card 1 — Active Generation

**Purpose:** Identifies which generation is currently being run.

**Query logic:**

1. Find the most recent `Generation` where `status = ACTIVE`, ordered by `createdAt DESC`, limit 1
2. If no `ACTIVE` generation exists, fall back to the most recent generation by `createdAt DESC`, regardless of status
3. If no generations exist at all, display an empty state

**Displayed fields:** `id`, `title`, `status`, `theme`, `createdAt`, probe count

---

### Card 2 — Population Fitness Ranking

**Purpose:** Shows which probes are performing best within the active generation.

**Query logic:**

1. Uses the generation resolved in Card 1 (or null if none)
2. Calls `computeProbesFitness(generationId)` imported from `../generations/[id]/computeProbesFitness`
3. Result is already sorted by `rawScore DESC` (ties broken by `createdAt ASC`) by that function
4. Displays all probes in the active generation with their `rawScore`, `title`, `format`, `status`

**Empty state:** When no active generation exists or the generation has no probes, display a placeholder row.

---

### Card 3 — Open Mutations

**Purpose:** Shows the backlog of hypothesised mutations awaiting action.

**Query logic:**

- All `Mutation` records where `status = OPEN`, ordered by `createdAt DESC`
- Include `sourceProbe.id` and `sourceProbe.title` for each mutation

**Displayed fields:** count of open mutations, per-mutation: `id`, `mutationType`, `description`, `sourceProbe.title`

---

### Card 4 — Needs Metrics Capture

**Purpose:** Surfaces PUBLISHED probes that lack measurement data, prompting the user to capture snapshots.

A probe "needs metrics capture" if it meets either condition:

- Condition A: The probe has `status = PUBLISHED` AND zero `PlatformPost` records
- Condition B: The probe has `status = PUBLISHED` AND at least one `PlatformPost` with zero `MetricSnapshot` records

**Query logic:**

```
SELECT probes WHERE status = PUBLISHED
  AND (
    platformPosts is empty
    OR EXISTS (platformPost WHERE snapshots is empty)
  )
```

Implemented as a single Prisma query using `include` + post-filter in application code, or via a `where` clause with `OR` and nested `_count` / `none` filters.

**Displayed fields:** count, per-probe: `id`, `title`, `format`

---

### Card 5 — Needs Review

**Purpose:** Surfaces PUBLISHED probes that have not yet had a signal review, prompting the user to write observations.

A probe "needs review" if: `status = PUBLISHED` AND zero `SignalReview` records.

**Query logic:**

```
SELECT probes WHERE status = PUBLISHED AND reviews is empty
```

Implemented as a Prisma query with `where: { status: 'PUBLISHED', reviews: { none: {} } }`.

**Displayed fields:** count, per-probe: `id`, `title`, `format`

---

## Data loading contract

`loadDashboardData()` is an async function co-located in `apps/web/src/app/dashboard/page.tsx` (or extracted to `apps/web/src/app/dashboard/loadDashboardData.ts` if the file grows beyond ~120 lines).

It returns a single typed object:

```
{
  activeGeneration: GenerationRow | null
  fitnessRanking: ProbeWithFitness[]
  openMutations: MutationRow[]
  needsMetricsCapture: ProbeRow[]
  needsReview: ProbeRow[]
}
```

The five queries (and the fitness computation) run concurrently via `Promise.all`. The fitness computation depends on `activeGeneration.id`, so it runs after the generation query resolves — the remaining four queries run fully in parallel.

---

## Out of scope

- Write actions on the dashboard (no forms, no status changes)
- Pagination or infinite scroll
- Real-time updates or polling
- "Next recommended human action" inference (PRD §12 extended list; deferred post-MVP)
- "Probes published this week" filter (deferred)
- "Latest snapshots" feed (deferred)
- "Current strongest signal" (deferred)
