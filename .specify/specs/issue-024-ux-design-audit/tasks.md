# Tasks: UX Design Audit and Design System Foundation

**Issue:** #24
**Spec:** `.specify/specs/issue-024-ux-design-audit/spec.md`

TDD order: each component gets a failing test, then implementation, then refactor, then usage in pages.

---

## Phase 1: Tailwind Config and CSS Custom Properties

### Task 1 — Add `tailwind.config.ts` to `apps/web`

File: `apps/web/tailwind.config.ts`

Create a minimal config that:
- Sets `content` to `["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"]`
- Extends theme with `primary` color mapped to `var(--color-primary)` and `primary-foreground` mapped to `var(--color-primary-foreground)`
- Extends with `background` mapped to `var(--background)`, `accent` mapped to `var(--color-accent)`, `accent-foreground` mapped to `var(--color-accent-foreground)`, `input` border mapped to `var(--color-input)`

### Task 2 — Add `globals.css` with CSS custom properties

File: `apps/web/src/app/globals.css` (create)

Declare `@tailwind base; @tailwind components; @tailwind utilities;` and `:root` block:
```
--color-primary: #2563eb;
--color-primary-foreground: #ffffff;
--background: #ffffff;
--color-accent: #f3f4f6;
--color-accent-foreground: #111827;
--color-input: #d1d5db;
```

### Task 3 — Import `globals.css` in root layout

File: `apps/web/src/app/layout.tsx`

Add `import './globals.css'` at the top. This is the single point of import for all token CSS.

---

## Phase 2: `StatusBadge` component (TDD)

### Task 4 — Write failing test for `StatusBadge`

File: `packages/ui/src/components/status-badge.test.tsx` (create)

Test cases:
- renders a `<span>` element
- renders the status string as text content
- applies a gray class for `DRAFT`
- applies a blue class for `ACTIVE`
- applies a green class for `PUBLISHED`
- applies a purple class for `REVIEWED`
- applies a gray class for an unknown status string

Run `npx nx run ui:test` — expect RED (file not found / import error).

### Task 5 — Implement `StatusBadge`

File: `packages/ui/src/components/status-badge.tsx` (create)

Use CVA. Variant map:
- `DRAFT`, `OPEN` → `gray` variant: `bg-gray-100 text-gray-700`
- `ACTIVE`, `READY` → `blue` variant: `bg-blue-100 text-blue-700`
- `PUBLISHED` → `green` variant: `bg-green-100 text-green-700`
- `REVIEWED` → `purple` variant: `bg-purple-100 text-purple-700`
- `MUTATED`, `DONE` → `teal` variant: `bg-teal-100 text-teal-700`
- `RETIRED`, `SKIPPED` → `red` variant: `bg-red-100 text-red-700`
- default → `gray` variant

Export `StatusBadge` and `StatusBadgeProps`.

Run `npx nx run ui:test` — expect GREEN.

### Task 6 — Export `StatusBadge` from `packages/ui/src/index.ts`

File: `packages/ui/src/index.ts`

Add: `export { StatusBadge } from './components/status-badge';`
Add: `export type { StatusBadgeProps } from './components/status-badge';`

---

## Phase 3: `PageHeader` component (TDD)

### Task 7 — Write failing test for `PageHeader`

File: `packages/ui/src/components/page-header.test.tsx` (create)

Test cases:
- renders the title string
- renders without an action slot when `action` prop is omitted
- renders the action slot content when `action` prop is provided

Run `npx nx run ui:test` — expect RED.

### Task 8 — Implement `PageHeader`

File: `packages/ui/src/components/page-header.tsx` (create)

```tsx
export interface PageHeaderProps {
  title: string
  action?: React.ReactNode
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  )
}
```

Run `npx nx run ui:test` — expect GREEN.

### Task 9 — Export `PageHeader` from `packages/ui/src/index.ts`

File: `packages/ui/src/index.ts`

Add: `export { PageHeader } from './components/page-header';`
Add: `export type { PageHeaderProps } from './components/page-header';`

---

## Phase 4: `AppShell` component (TDD)

### Task 10 — Write failing test for `AppShell`

File: `packages/ui/src/components/app-shell.test.tsx` (create)

Test cases:
- renders children
- renders a nav element
- nav contains a link to `/dashboard`
- nav contains a link to `/generations`
- nav contains a link to `/mutations`

Note: `AppShell` must NOT import from `next/link` — it is a UI package and cannot couple to Next.js. Use `<a>` tags. (The constraint is no db/domain imports; Next.js is a valid peer dependency for a UI package, but `<a>` tags keep it framework-agnostic and easier to test without JSDOM Next.js mocking.)

Run `npx nx run ui:test` — expect RED.

### Task 11 — Implement `AppShell`

File: `packages/ui/src/components/app-shell.tsx` (create)

```tsx
export interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <nav className="flex items-center gap-6 px-6 py-3 border-b bg-white">
        <span className="font-semibold text-sm text-gray-900">MDE</span>
        <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</a>
        <a href="/generations" className="text-sm text-gray-600 hover:text-gray-900">Generations</a>
        <a href="/mutations" className="text-sm text-gray-600 hover:text-gray-900">Mutations</a>
      </nav>
      <main className="px-6 py-8">{children}</main>
    </>
  )
}
```

Run `npx nx run ui:test` — expect GREEN.

### Task 12 — Export `AppShell` from `packages/ui/src/index.ts`

File: `packages/ui/src/index.ts`

Add: `export { AppShell } from './components/app-shell';`
Add: `export type { AppShellProps } from './components/app-shell';`

---

## Phase 5: Wire `AppShell` into root layout

### Task 13 — Update `apps/web/src/app/layout.tsx`

File: `apps/web/src/app/layout.tsx`

Replace the bare `<body>{children}</body>` with `<body><AppShell>{children}</AppShell></body>`.

Import `AppShell` from `@template/ui`. Import `globals.css`.

Remove `<main>` wrappers from pages that now live inside `AppShell`'s `<main>` — see tasks below.

Expected result: run `npm run dev`, navigate between pages, nav bar appears on all pages.

---

## Phase 6: Apply `PageHeader` to pages

Each page task is atomic. Run `npx nx run web:typecheck` after each to confirm no type errors.

### Task 14 — Apply `PageHeader` to `apps/web/src/app/generations/page.tsx`

Remove the inline `<div className="flex justify-between items-center mb-6">...</div>` header block (lines ~29–38 in both the empty-state branch and the main branch).

Replace with `<PageHeader title="Generations" action={<Link href="/generations/new" ...>Create Generation</Link>} />`.

The `Link` button should use `<Button>` from `@template/ui` (see Phase 7).

Remove the wrapping `<div className="p-8">` — padding is now from `AppShell`'s `<main>`.

### Task 15 — Apply `PageHeader` to `apps/web/src/app/generations/[id]/page.tsx`

Remove the inline header div (lines ~37–44). Replace with `<PageHeader title={generation.title} action={<StatusControls .../>} />`.

Remove the wrapping `<div className="p-8">`.

### Task 16 — Apply `PageHeader` to `apps/web/src/app/probes/[id]/page.tsx`

Replace `<h1>{probe.title}</h1>` with `<PageHeader title={probe.title} action={<ProbeStatusControls .../>} />`.

Remove `<main>` wrapper (now provided by `AppShell`).

### Task 17 — Apply `PageHeader` to `apps/web/src/app/platform-posts/[id]/page.tsx`

Replace `<h1>{post.url}</h1>` with `<PageHeader title={post.platform} action={undefined} />`.

Remove `<main>` wrapper.

### Task 18 — Apply `PageHeader` to `apps/web/src/app/mutations/page.tsx`

Replace `<h1>Open Mutations</h1>` with `<PageHeader title="Open Mutations" />`.

Remove `<main>` wrapper.

### Task 19 — Apply `PageHeader` to `apps/web/src/app/dashboard/page.tsx`

Replace `<h1>Dashboard</h1>` with `<PageHeader title="Dashboard" />`.

Remove `<main>` wrapper.

---

## Phase 7: Apply `Button` from `packages/ui` to all forms

The `Button` component in `packages/ui` requires the CSS custom property tokens added in Phase 1. After Task 3, the tokens resolve and `Button` renders correctly.

### Task 20 — Use `Button` in `apps/web/src/app/generations/new/GenerationForm.tsx`

Replace `<button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">` with `<Button type="submit" disabled={isPending}>`.

Replace the inline action button in `PageHeader` in `GenerationDetailPage` (`px-4 py-2 bg-blue-600...`) with `<Button asChild>` wrapping `<Link>` or a plain `<Button onClick>`.

### Task 21 — Use `Button` in `apps/web/src/app/probes/new/ProbeForm.tsx`

Replace `<button type="submit" disabled={isPending}>` with `<Button type="submit" disabled={isPending}>`.

### Task 22 — Use `Button` in `apps/web/src/app/probes/[id]/signal-reviews/SignalReviewForm.tsx`

Replace `<button type="submit" disabled={isPending}>` with `<Button type="submit" disabled={isPending}>`.

### Task 23 — Use `Button` in `apps/web/src/app/probes/[id]/MutationForm.tsx`

Replace `<button type="submit" disabled={isPending}>` with `<Button type="submit" disabled={isPending}>`.

### Task 24 — Use `Button` in status control components

Files: `apps/web/src/app/generations/[id]/StatusControls.tsx`, `apps/web/src/app/probes/[id]/ProbeStatusControls.tsx`

Replace any inline-styled or unstyled `<button>` elements with `<Button variant="outline">` for secondary status actions.

---

## Phase 8: Apply `StatusBadge` to list and detail views

### Task 25 — Apply `StatusBadge` to `apps/web/src/app/generations/page.tsx`

In the table body, replace `<td className="py-2 pr-4">{gen.status}</td>` with `<td className="py-2 pr-4"><StatusBadge status={gen.status} /></td>`.

### Task 26 — Apply `StatusBadge` to `apps/web/src/app/generations/[id]/page.tsx`

In the `<dl>`, replace `<dd>{generation.status}</dd>` with `<dd><StatusBadge status={generation.status} /></dd>`.

In the probes table, replace `<td className="py-2 pr-4">{probe.status}</td>` with `<td className="py-2 pr-4"><StatusBadge status={probe.status} /></td>`.

### Task 27 — Apply `StatusBadge` to `apps/web/src/app/mutations/page.tsx`

Replace `<td>{mutation.status}</td>` with `<td><StatusBadge status={mutation.status} /></td>`.

---

## Phase 9: Add breadcrumb links

No new component — use existing `Link` from `next/link`.

### Task 28 — Add breadcrumb to `apps/web/src/app/probes/[id]/page.tsx`

Below `PageHeader`, add a breadcrumb line before the first `<section>`:

```tsx
<p className="text-sm text-gray-500 mb-4">
  <Link href={`/generations/${probe.generation.id}`} className="hover:underline">
    ← {probe.generation.title}
  </Link>
</p>
```

Remove the existing inline `<p>Generation: <Link>...</Link></p>` paragraph (it is now redundant with the breadcrumb).

### Task 29 — Add breadcrumb and probe link to `apps/web/src/app/platform-posts/[id]/page.tsx`

Replace `<p>Probe: {post.probe.title}</p>` with a breadcrumb link:

```tsx
<p className="text-sm text-gray-500 mb-4">
  <Link href={`/probes/${post.probe.id}`} className="hover:underline">
    ← {post.probe.title}
  </Link>
</p>
```

---

## Phase 10: Table polish for `mutations/page.tsx`

### Task 30 — Add Tailwind classes to `apps/web/src/app/mutations/page.tsx` table

The mutations table uses bare `<table>`, `<th>`, `<td>` with no className. Apply the same classes already used in `generations/page.tsx`:

- `<table className="w-full border-collapse">`
- `<th className="text-left py-2 pr-4">`
- `<tr className="border-b hover:bg-gray-50">`
- `<td className="py-2 pr-4">`

---

## Verification

After all tasks:

- `npx nx run ui:test` — all tests pass (StatusBadge, PageHeader, AppShell, Button)
- `npx nx run web:typecheck` — zero errors
- `npm run dev` — nav bar visible on all pages, consistent heading style, colored status chips, breadcrumbs on probe and platform-post detail pages, styled buttons on all forms
- `npm run test` — all existing tests continue to pass
