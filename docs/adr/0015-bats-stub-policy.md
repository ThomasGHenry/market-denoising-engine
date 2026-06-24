---
status: proposed
date: 2026-06-24
tags: [testing, tdd, shell, bats]
---

## Context

PRD §9.5 mandates that every `*.sh` file in `scripts/ci/` has a corresponding `.bats` test
file in the same directory. The scaffold was built with three BATS files (`validate-adrs.bats`,
`validate-commits.bats`, `run-shellcheck.bats`), each containing a single stub test that
only checks file existence:

```bash
#!/usr/bin/env bats
# stub test — full coverage in later step
@test "script exists" {
  [ -f "scripts/ci/validate-adrs.sh" ]
}
```

Two scripts have no BATS file at all (`run-gitleaks.sh`, `run-actionlint.sh`). One script
(`validate-aggregate.sh`) has no BATS file. The three files that do exist do not test any
behaviour — they test only that the `.sh` file is present on disk.

The CI pipeline currently has no job that enforces the BATS sibling rule nor runs BATS suites.
A stub that passes unconditionally produces false confidence: `npx nx run-many -t test` will
show green even though zero shell script behaviour has been verified.

## Decision

1. Stub BATS files are temporary scaffolding only. A BATS file is not considered to satisfy
   PRD §9.5 unless it contains at least one `@test` block that exercises a behavioural
   property of the script under test (e.g., exit code on valid/invalid input, specific output
   text, mode switching). A test that only asserts `[ -f scripts/ci/validate-adrs.sh ]` does
   not satisfy the mandate.

2. Each `scripts/ci/*.sh` must have a sibling `.bats` file with substantive tests before the
   script is considered done. "Substantive" means: tests cover the primary success path, at
   least one failure path, and any branching behaviour documented in the PRD spec for that
   script.

3. The three stub files (`validate-adrs.bats`, `validate-commits.bats`, `run-shellcheck.bats`)
   must be replaced with real test suites as a tracked issue.

4. New BATS files for `run-gitleaks.bats`, `run-actionlint.bats`, and
   `validate-aggregate.bats` must be created.

5. A `validate-bats-coverage.sh` script must be added to `scripts/ci/` to enforce the
   sibling rule in CI: for every `scripts/ci/*.sh`, a sibling `*.bats` must exist and contain
   at least one non-stub `@test` block. This script should itself have a BATS file.

## Consequences

- Three stub BATS files must be replaced, not merely supplemented.
- Three BATS files must be created from scratch.
- One new enforcement script (`validate-bats-coverage.sh`) must be added and wired into
  Phase 0 of `1-commit.yml`.
- Until this ADR is fully implemented, the CI test job passes despite zero shell behaviour
  being verified.
- The `@test "script exists"` pattern is a known false-positive indicator: grep for it in CI
  enforcement to detect regressions.
