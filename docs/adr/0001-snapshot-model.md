---
status: accepted
date: 2026-06-24
tags: [architecture, process]
---

# 0001. Template as Snapshot, Not Generator

## Context

New projects need a starting point with governance, CI, and stack scaffolding. Two
approaches exist: a generator that produces projects and can push updates over time, or a
template repository that is cloned once and owned entirely by the instantiating project.

## Decision

This repository is a GitHub Template Repository. Projects clone it once. They own the
result entirely. No generator infrastructure, no versioning, no Renovate PRs from a parent template,
no "what version of the template am I on" questions.

## Consequences

Simpler: no npm package to publish, no versioning, no Renovate PRs from a parent template,
no "what version of the template am I on" questions.

Harder: bug fixes in governance scripts (ADR validation, gitleaks config) do not
automatically reach existing projects. Backporting is manual.
