# Probe CRUD — Server Actions and Pages

## Feature

Issue #13. Adds the ability to create probes and view probe detail within the MDE learning loop.

## User Stories

**US-01**: As a user, I can navigate to `/probes/new` (optionally with a `?generationId=xxx` query param) and fill out a form to create a new probe attached to a generation.

**US-02**: As a user, I can view `/probes/[id]` to see the full detail of a probe: its content, tags, format, status, fitness score, platform posts, metric snapshots, signal reviews, mutations, and parent probe lineage.

**US-03**: As a user, I can change the status of a probe from its detail page using status transition buttons.

## Acceptance Scenarios

**Scenario 1 — Create probe from active generation:**
Given a generation in ACTIVE status, when I submit the create-probe form at `/probes/new`, then the probe appears in the generation's probe list at `/generations/[id]` with status DRAFT.

**Scenario 2 — View fitness score and metrics:**
Given a probe with metric snapshots, when I view `/probes/[id]`, then I see the computed fitness score (or "—" if null) and the raw metric breakdown via the platform posts chain.

## Pages

- `/probes/new` — create form: generation (select, pre-selectable via `?generationId` query param), title, raw input, content text, format (enum dropdown), tags (comma-separated), effort minutes, optional parent probe (probes from the same generation in DRAFT/READY/PUBLISHED status)
- `/probes/[id]` — probe detail: all probe fields, fitness score, platform posts list with metric snapshots, signal reviews, mutations, parent probe lineage link

## Out of Scope

- `/probes` list/index page (probes are listed inside `/generations/[id]`)
- Platform post creation (issue #14)
- Metric snapshot entry (issue #15)
- Probe edit page
- Fitness computation (issue #16 / #7) — display raw DB value or "—"
