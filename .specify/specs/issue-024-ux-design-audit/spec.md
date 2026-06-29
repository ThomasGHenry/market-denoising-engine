# Spec: UX Design Audit and Design System Foundation

**Issue:** #24
**Status:** Draft
**Scope:** `packages/ui`, `apps/web/src/app/layout.tsx`, and all six main page surfaces

---

## 1. Problem Statement

Each page is a standalone island. There is no persistent shell, no navigation, and no visual consistency between surfaces. A user jumping from `/generations` to `/probes/[id]` must use the browser back button and has no orientation cues. Components like buttons, page headers, and data tables are re-implemented with slight variations in every file.

The goal is not a redesign. The goal is a shared shell and a small set of shared components so that a single change propagates everywhere.

---

## 2. Audit Findings

### 2.1 Global Navigation

`apps/web/src/app/layout.tsx` renders `<html><body>{children}</body></html>` — no nav, no shell, no title. Every page is disconnected.

Required nav destinations per PRD §12:
- Dashboard (`/dashboard`)
- Generations (`/generations`)
- Mutations (`/mutations`)

### 2.2 Heading Hierarchy

| Page | Root element | h1 | h2 |
|---|---|---|---|
| `/dashboard` | `<main>` | `<h1>Dashboard</h1>` (unstyled) | unstyled |
| `/generations` | `<div className="p-8">` | `<h1 className="text-2xl font-bold">` | — |
| `/generations/[id]` | `<div className="p-8">` | `<h1 className="text-2xl font-bold">` | `<h2 className="text-xl font-semibold">` |
| `/probes/[id]` | `<main>` | `<h1>` (unstyled) | `<h2>` (unstyled) |
| `/platform-posts/[id]` | `<main>` | `<h1>` (unstyled) | `<h2>` (unstyled) |
| `/mutations` | `<main>` | `<h1>Open Mutations</h1>` (unstyled) | — |

Three distinct heading styles exist across six pages. Dashboard and probe detail use bare HTML elements with browser defaults.

### 2.3 Button Styles

`GenerationForm.tsx` (line 86): `className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"`

`generations/page.tsx` (line 32): `className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"`

`generations/[id]/page.tsx` (line 66): `className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"`

`ProbeForm.tsx` (line 58): `<button type="submit" disabled={isPending}>` — no className, browser default.

`SignalReviewForm.tsx` (line 45): `<button type="submit" disabled={isPending}>` — no className.

`MutationForm.tsx` (line 31): `<button type="submit" disabled={isPending}>` — no className.

`packages/ui` exports a `Button` component backed by CVA with `default`, `outline`, and `ghost` variants. It is not used anywhere in `apps/web`.

### 2.4 Form Layout Inconsistency

`GenerationForm.tsx`: uses `className="space-y-4 max-w-lg"` on the form, label+input stacked with `className="block text-sm font-medium mb-1"` on labels, `className="w-full border rounded px-3 py-2"` on inputs.

`ProbeForm.tsx`: bare `<form>` with no className, bare `<label>` and `<input>` with no className — unstyled browser defaults.

`SignalReviewForm.tsx`: bare `<form>` with no className, bare labels and textareas.

`MutationForm.tsx`: bare `<form>` with no className, bare labels and textareas.

### 2.5 Missing Breadcrumbs

Entity hierarchy: Generation → Probe → PlatformPost → MetricSnapshot

`/probes/[id]/page.tsx` (line 49) links back to the parent generation inline as a paragraph `<p>Generation: <Link>...</Link></p>`. There is no breadcrumb pattern — no consistent location, no visual treatment.

`/platform-posts/[id]/page.tsx` shows the probe title as `<p>Probe: {post.probe.title}</p>` with no link back to the probe.

### 2.6 Table Styling Inconsistency

`generations/page.tsx`: `<table className="w-full border-collapse">`, `<th className="text-left py-2 pr-4">`, `<tr className="border-b hover:bg-gray-50">`.

`mutations/page.tsx`: `<table>` with no className, `<th>` and `<td>` with no className — unstyled.

### 2.7 Status Badge

Status values (`DRAFT`, `ACTIVE`, `PUBLISHED`, `REVIEWED`, `MUTATED`, `RETIRED`) appear as raw enum strings in every table and detail view. No visual differentiation.

### 2.8 Tailwind Configuration

No `tailwind.config.ts` exists in `apps/web` or anywhere in the monorepo (outside `node_modules`). Tailwind is used via class strings in JSX but there is no token extension layer — no custom colors, no custom spacing scale, no design tokens.

`packages/ui/src/components/button.tsx` references CSS custom properties (`bg-primary`, `text-primary-foreground`, `bg-accent`, `text-accent-foreground`, `border-input`, `bg-background`) that are not defined anywhere. The Button component's default and outline variants will not render correctly until these variables are defined.

---

## 3. Scope

### In scope

**Phase 1: Shell and navigation**
- Add a global `AppShell` layout component to `packages/ui` with a top nav bar linking to Dashboard, Generations, and Mutations
- Wire it into `apps/web/src/app/layout.tsx`

**Phase 2: Shared component extraction**
- `PageHeader` — page title + optional action slot (replaces the repeated `<div className="flex justify-between...">` pattern)
- `StatusBadge` — maps enum string to a colored badge (eliminates raw enum display)
- The existing `Button` from `packages/ui` — fix its CSS variable dependency and use it everywhere

**Phase 3: Apply to all pages**
- Apply `Button` to all forms: `GenerationForm`, `ProbeForm`, `SignalReviewForm`, `MutationForm`, and submit buttons in `StatusControls`/`ProbeStatusControls`
- Apply `PageHeader` to all six page-level layouts
- Apply `StatusBadge` to generation status and probe status cells in list and detail views
- Add breadcrumb links in `PlatformPostDetailPage` and `ProbeDetailPage` using the existing `Link` component (no new component needed)

**Phase 4: Tailwind config and CSS custom properties**
- Add `tailwind.config.ts` to `apps/web` with a minimal token extension (primary color, neutral scale)
- Add CSS custom properties for `packages/ui` Button tokens in the root stylesheet

### Out of scope

- Accessibility audit
- Animations or transitions
- Public-facing polish or branding
- New packages — extend `packages/ui` only
- Form validation UI overhaul
- Responsive/mobile layout
- Full rebrand or color system redesign

---

## 4. Component Contracts

### 4.1 `AppShell`

Location: `packages/ui/src/components/app-shell.tsx`

```
Props:
  children: ReactNode

Renders: nav bar with site name + links to /dashboard, /generations, /mutations
         plus a <main> wrapper around children
```

Does not import from `@template/db` or `@template/domain`. Pure React + Tailwind.

### 4.2 `PageHeader`

Location: `packages/ui/src/components/page-header.tsx`

```
Props:
  title: string
  action?: ReactNode  (optional slot for a primary CTA button)

Renders: <div className="flex justify-between items-center mb-6">
           <h1>{title}</h1>
           {action && <div>{action}</div>}
         </div>
```

### 4.3 `StatusBadge`

Location: `packages/ui/src/components/status-badge.tsx`

```
Props:
  status: string

Renders: <span> with variant-mapped color classes

Variant map (CVA):
  DRAFT / OPEN      → gray
  ACTIVE / READY    → blue
  PUBLISHED         → green
  REVIEWED          → purple
  MUTATED / DONE    → teal
  RETIRED / SKIPPED → red
  default           → gray
```

### 4.4 `Button` (existing — fix CSS variables)

The existing `button.tsx` in `packages/ui` references `bg-primary`, `text-primary-foreground`, etc. These must resolve against CSS custom properties declared in the root stylesheet before the Button is usable.

---

## 5. Design Token Decisions

### 5.1 Primary color

Existing pages use `bg-blue-600` / `hover:bg-blue-700` as a de-facto primary. Codify this as `--color-primary` in the CSS and `primary` in Tailwind config.

### 5.2 Neutral surface

Pages use `text-gray-500` for secondary text, `hover:bg-gray-50` for table rows, `border-b` for dividers. These are already Tailwind defaults — no extension needed.

### 5.3 Decision: extend Tailwind config vs. CSS-only

Use both: a `tailwind.config.ts` in `apps/web` that maps `primary` to the CSS variable, plus a `globals.css` that declares the CSS custom properties. This matches the shadcn pattern already implied by the Button component's token names (`bg-primary`, `bg-background`, etc.) and requires zero new dependencies.

### 5.4 Recommendation on shared design system package

Do not extract a separate design system package. `packages/ui` already exists with the right boundary rules (React peer dep, no db/domain imports). Extend it with three additional components. Future packages can consume `@template/ui` as is.

---

## 6. Navigation Structure

```
Global nav (AppShell):
  [Market Denoising Engine]   /dashboard   /generations   /mutations

Breadcrumb pattern (inline, not a new component):
  /probes/[id]           → "← Generation: {title}" link at top
  /platform-posts/[id]   → "← Probe: {title}" link at top
```

Entity hierarchy for breadcrumb: Generation → Probe → PlatformPost

No breadcrumb needed at `/dashboard`, `/generations`, `/mutations` (top-level pages already in nav).

---

## 7. Success Criteria

- `AppShell` renders at the root layout level; all six pages show the nav bar without per-page changes after the layout change
- `Button` from `@template/ui` renders visually (blue primary fill, correct hover) — CSS variables resolve
- `PageHeader` is used on all six page-level surfaces; no page re-implements the title+action flex pattern inline
- `StatusBadge` displays colored chips for status values on the generations list, generation detail probe table, and mutations list
- Breadcrumb links exist at the top of `/probes/[id]` and `/platform-posts/[id]`
- `MutationForm`, `ProbeForm`, and `SignalReviewForm` use `<Button>` from `@template/ui` — no bare unstyled submit buttons remain
- A single change to the `--color-primary` CSS variable changes the primary button color on all pages
- All new components have passing unit tests before being used in any page
