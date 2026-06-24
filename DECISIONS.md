# Decisions

Non-ADR decisions. Quick, low-ceremony record of choices that don't warrant a full ADR.
Use this file when: the decision is tactical, reversible, or specific to implementation
details. Use docs/adr/ when: the decision is architectural, has significant tradeoffs, or
will guide future choices.

## Format

| Date | Decision | Alternatives considered | Rationale |
|---|---|---|---|

## Log

| 2026-06-24 | commitlint.config.js uses CJS (module.exports) not ESM until package.json lands with "type": "module" | ESM export default | No package.json in Phase A — ESM requires "type":"module" to resolve. Will migrate to ESM in Phase H when root package.json is committed. |
