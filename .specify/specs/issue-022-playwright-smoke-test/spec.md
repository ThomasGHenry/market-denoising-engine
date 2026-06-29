# Spec: Playwright Smoke Test — Full Learning Loop Critical Path

**Issue:** #22
**PRD reference:** §16, acceptance criterion #11 ("at least one Playwright smoke test")
**Status:** ready

---

## 1. Purpose

Verify that the minimum viable learning loop can be completed end-to-end in a running
instance of the app. The test exercises exactly the five steps that make a probe visible
with a non-zero fitness score on a generation detail page.

This is a correctness smoke test, not an exhaustive CRUD test. It fails fast when
any step in the critical path is broken.

---

## 2. Acceptance Scenario

**Given** the app is running and reachable at `PLAYWRIGHT_BASE_URL`
**And** the database is empty or in a clean state (no preconditions required on existing data)

**When** the user completes this sequence in order:

1. Creates a generation at `/generations/new`
2. Creates a probe attached to that generation at `/probes/new?generationId=<id>`
3. Records a platform post for that probe on `/probes/<id>` (PlatformPostForm)
4. Enters a metric snapshot for that platform post on `/platform-posts/<id>` (MetricSnapshotForm)

**Then** navigating to `/generations/<id>` shows the probe in the probes table with a
fitness score greater than zero displayed under the "Best Observed Fitness" column.

---

## 3. Form Fields and Selectors

The test must target these elements by their label text or HTML attributes as they exist
in the current components. All selectors are listed with their `id` attributes or label
text so the test is independent of CSS class names.

### 3.1 Create Generation — `/generations/new`

Page heading: `Create Generation` (h1)

| Field | Element | `id` / label | Notes |
|-------|---------|--------------|-------|
| Title | `<input type="text">` | `#title` | Required |
| Theme | `<input type="text">` | `#theme` | Required |
| Fitness Function | `<select>` | `#fitnessFunction` | Defaults to `default_v0`; do not change |
| Submit | `<button type="submit">` | text: `Create Generation` | |

After submit: server action redirects to `/generations` (list page).
The test must navigate to the newly created generation by finding its title link on the list page.

### 3.2 Create Probe — `/probes/new?generationId=<id>`

Page heading: `New Probe` (h1)

| Field | Element | `id` / label | Notes |
|-------|---------|--------------|-------|
| Generation | `<select>` | `#generationId` | Pre-selected via `defaultGenerationId` prop when URL param supplied |
| Title | `<input type="text">` | `#title` | Required |
| Raw Input | `<textarea>` | `#rawInput` | Required |
| Format | `<select>` | `#format` | First option is `SHORT_TEXT` |
| Submit | `<button type="submit">` | text: `Create Probe` | |

After submit: server action redirects to `/generations/<generationId>`.
The test must find the probe's link on the generation detail page and navigate to it.

### 3.3 Record Platform Post — `/probes/<id>` (PlatformPostForm section)

Section heading: `Platform Posts` (h2)

| Field | Element | `id` / label | Notes |
|-------|---------|--------------|-------|
| Platform | `<select>` | `#platform` | Select `LINKEDIN` |
| URL | `<input type="url">` | `#url` | Required; use any valid URL |
| Published At | `<input type="datetime-local">` | `#publishedAt` | Required |
| Submit | `<button type="submit">` | text: `Record Post` | |

After submit: server action redirects back to `/probes/<id>`.
The test must locate the platform post link rendered by `PlatformPostList` to get the post id,
then navigate to `/platform-posts/<postId>`.

### 3.4 Enter Metric Snapshot — `/platform-posts/<id>` (MetricSnapshotForm section)

Section heading: `Metric Snapshots` (h2)

Labels wrap their inputs directly (`<label>` contains `<input>`). Target by label text.

| Field | Label text | `name` attribute | Notes |
|-------|-----------|-----------------|-------|
| Captured At | `Captured At` | `capturedAt` | Required; `datetime-local` |
| Likes | `Likes` | `likes` | Set to `5` — sufficient to produce rawScore > 0 via `likes * 1` |
| Submit | — | — | text: `Add Snapshot` |

Only `capturedAt` and one metric value are strictly required to produce a non-zero score.
Use `likes: 5` for determinism; `5 * weight(1) = 5` raw score.

After submit: server action redirects back to `/platform-posts/<id>`.

### 3.5 Verify Fitness — `/generations/<id>`

Table column header: `Best Observed Fitness` (th)

The probe row must be visible in the table.
The cell in the "Best Observed Fitness" column must contain a numeric string that, when
parsed as a float, is greater than zero.

The fitness column is the fourth `<td>` in each `<tr>` in the `<tbody>`.
Text content is formatted as `rawScore.toFixed(2)` (e.g., `"5.00"`).

---

## 4. Out of Scope

- Testing every CRUD field on every form
- Negative / validation error paths
- Multiple probes in one generation
- Signal reviews, mutations, or generation status transitions
- Authentication (app has none in MVP)
- Mobile viewport or non-Chromium browsers
- Performance or accessibility assertions

---

## 5. Infrastructure Context

- E2E app: `apps/web-e2e`
- Playwright config: `apps/web-e2e/playwright.config.ts`
- `testDir`: `./src` — all spec files live under `apps/web-e2e/src/`
- Existing placeholder: `apps/web-e2e/src/smoke.spec.ts` (two template-scaffold tests that must be replaced)
- CI workflow: `.github/workflows/2-e2e.yml` — runs `npx nx run web-e2e:e2e` after commit validation passes on `main`; sets `PLAYWRIGHT_BASE_URL` from `secrets.VERCEL_PREVIEW_URL`
- Local run: `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx nx run web-e2e:e2e`

---

## 6. Constraints

- No comments in test code
- Named functions for all callbacks (no inline arrow functions)
- TypeScript
- `page.goto`, `page.fill`, `page.click`, `page.waitForURL`, `page.getByRole`, `page.getByLabel`, `expect` from `@playwright/test`
- One `test` block for the full critical path; no `beforeAll` seeding scripts
