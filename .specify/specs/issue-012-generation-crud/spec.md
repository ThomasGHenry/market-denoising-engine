# Spec: Generation CRUD — Issue #12

## Overview

Users need to create and track generations — the top-level containers in the MDE learning loop. A generation is a named population of probes that share a theme and are evaluated together for fitness.

## User Stories

### US-01: Browse Generations
As a user, I want to see all my generations listed in one place so I can track the health of my learning loop at a glance.

Acceptance:
- Navigating to `/generations` shows a table of all generations
- Each row shows: title, status, theme, probe count, top fitness score, created date
- When no generations exist, an empty state appears with a "Create Generation" call to action
- Probe count reflects the number of probes attached to that generation
- Top fitness shows the highest non-null fitness score across all probes in that generation, formatted as a decimal; "—" when none exist

### US-02: Create a Generation
As a user, I want to create a new generation by providing a title, theme, and fitness function so I can start a new learning experiment.

Acceptance:
- Navigating to `/generations/new` shows a create form
- Required fields: title, theme
- Fitness function field defaults to "default_v0" and is the only available option at this time
- Optional parent generation selector shows existing generations with status ACTIVE or ARCHIVED, displayed by title
- Submitting a valid form creates the generation with status DRAFT
- After successful creation the user is redirected to `/generations`
- Submitting with missing required fields shows inline validation errors; the form does not navigate away

### US-03: View Generation Detail
As a user, I want to see a generation's full detail — its theme, status, and probes ranked by fitness — so I can evaluate what worked and decide what to try next.

Acceptance:
- Navigating to `/generations/[id]` shows the generation's title, theme, status, fitness function, and created date
- Probes are listed in a table ranked by raw fitness score descending (highest first)
- Probes with null fitness scores sort below scored probes; their fitness cell shows "—"
- The page includes a "Create Next Generation" button (visible, links to `/generations/new` with this generation as parent pre-selected)
- Status transition controls appear based on current status:
  - DRAFT → "Activate" button
  - ACTIVE → "Archive" button and "Retire" button
  - ARCHIVED / RETIRED → no transition controls

### US-04: Transition Generation Status
As a user, I want to change a generation's status so I can move it through its lifecycle deliberately.

Acceptance:
- Clicking "Activate" on a DRAFT generation updates status to ACTIVE
- Clicking "Archive" on an ACTIVE generation updates status to ARCHIVED
- Clicking "Retire" on an ACTIVE generation updates status to RETIRED
- Status transitions other than the three above are rejected
- The page reflects the new status after transition without full reload (revalidation)

## Out of Scope

- Auto-populating child probes from mutations (Issue #18)
- Editing generation title, theme, or fitness function after creation
- Pagination or search on the list view
- Authentication / authorisation

## Business Rules

- A generation is created in DRAFT status
- Valid transitions: DRAFT → ACTIVE, ACTIVE → ARCHIVED, ACTIVE → RETIRED
- All other status transitions are invalid and must be rejected with an error
- Fitness scores live on probes, not on generations; the generation list derives "top fitness" by querying probe data
- The fitness function name is stored on the generation for audit purposes; "default_v0" is the only valid value at this time
