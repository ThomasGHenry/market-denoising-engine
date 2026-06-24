---
status: accepted
date: 2026-06-24
tags: [architecture]
---

# 0003. NextJS-Vercel-Prisma as First Overlay

## Context

The template needs at least one concrete stack overlay to be immediately useful. The overlay
must be representatve of the stack most commonly used in new projects.

## Decision

The first overlay is: Next.js 15 (App Router), Vercel (deployment), Prisma (ORM), Neon
Postgres (database), Vitest (unit tests), Playwright (E2E tests).

## Consequences

Instantiators using this stack get a working setup with no additional scaffolding. Projects
on different stacks (Flutter, Node/AWS, etc.) must delete overlay files and add their own.
A second overlay will be introduced when a project requires it, potentially with a setup.sh
to handle overlay selection on clone.
