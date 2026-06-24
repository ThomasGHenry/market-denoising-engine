---
status: proposed
date: 2026-06-24
tags: [quality, tooling, architecture]
---

## Context

`eslint.config.mjs` configures `@nx/enforce-module-boundaries` with `depConstraints`
referencing `scope:web`, `scope:domain`, and `scope:shared` tags. The ESLint rule reads
project tags from each project's `project.json` file (`"tags": ["scope:web"]`).

No `project.json` files exist anywhere in the repository (`find . -name "project.json"`
returns empty). Without `project.json` files declaring tags, NX cannot assign tags to
projects, and the `@nx/enforce-module-boundaries` rule has no tag data to enforce against.
The rule becomes a no-op: any project can import from any other project, and no lint error
is raised.

Additionally, NX 22 supports two project discovery modes: legacy (requires `project.json`)
and inference via plugins (the `@nx/next/plugin`, `@nx/vite/plugin` entries in `nx.json`).
With plugin inference only, NX derives project names and targets from config files
(`next.config.ts`, `vite.config.ts`), but it does not derive project tags. Tags must still
be declared in `project.json` or `nx.json` `projects` array for boundary enforcement to work.

## Decision

Create a `project.json` file for each NX project declaring its scope tag:

- `apps/web/project.json`: `"tags": ["scope:web"]`
- `apps/web-e2e/project.json`: `"tags": ["scope:web"]`
- `packages/ui/project.json`: `"tags": ["scope:shared"]`
- `packages/config/project.json`: `"tags": ["scope:shared"]`
- `packages/db/project.json`: `"tags": ["scope:shared"]`
- `packages/domain/project.json`: `"tags": ["scope:domain"]`

Each `project.json` should declare `"name"` (matching the npm package name without the
`@template/` prefix) and `"targets": {}` (empty targets are valid; plugin inference
handles the actual targets).

This is a template-layer decision. Projects instantiated from this template inherit the
tag taxonomy and should add their own packages with appropriate tags.

## Consequences

- `@nx/enforce-module-boundaries` becomes active — lint will fail if `scope:domain`
  imports from `scope:web`
- Adds 6 small JSON files to the repository
- Teams using NX's project graph (`nx graph`) gain accurate visual dependency display
- Tag taxonomy (`scope:web`, `scope:domain`, `scope:shared`) is locked in as the
  standard; extensions should follow the same pattern
- The `scope:shared` catch-all may need refinement as the project grows (e.g., splitting
  into `scope:ui` and `scope:data`)
