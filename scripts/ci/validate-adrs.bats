setup() {
  VALIDATOR="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)/validate-adrs.sh"
  WORK_DIR="$(mktemp -d)"
  mkdir -p "$WORK_DIR/docs/adr"
  cd "$WORK_DIR"
}

teardown() {
  rm -rf "$WORK_DIR"
}

edit_file() {
  local expression="$1" file="$2"
  sed -i.sedbak "$expression" "$file"
  rm "$file.sedbak"
}

write_valid_adr() {
  local number="$1" slug="$2" status="${3:-proposed}"
  cat > "docs/adr/$number-$slug.md" <<EOF
---
status: $status
date: 2026-06-10
tags: [process]
---

## Context

Background.

## Decision

Choice.

## Consequences

Outcome.
EOF
}

@test "empty corpus exits 0" {
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 0 ]
}

@test "missing ADR directory exits 1 with message" {
  run "$VALIDATOR" docs/missing
  [ "$status" -eq 1 ]
  [[ "$output" == *"docs/missing"* ]]
}

@test "valid ADR passes" {
  write_valid_adr 0001 record-decisions
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 0 ]
}

@test "filename without zero-padded number fails" {
  write_valid_adr 0001 record-decisions
  mv docs/adr/0001-record-decisions.md docs/adr/1-record-decisions.md
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 1 ]
  [[ "$output" == *"filename must match NNNN-kebab-case-title.md"* ]]
}

@test "missing frontmatter fails" {
  write_valid_adr 0001 record-decisions
  edit_file '1,3d' docs/adr/0001-record-decisions.md
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 1 ]
  [[ "$output" == *"missing frontmatter"* ]]
}

@test "invalid status value fails" {
  write_valid_adr 0001 record-decisions wip
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 1 ]
  [[ "$output" == *"invalid status 'wip'"* ]]
}

@test "missing Context section fails" {
  write_valid_adr 0001 record-decisions
  edit_file 's/^## Context$/## Background/' docs/adr/0001-record-decisions.md
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 1 ]
  [[ "$output" == *"missing required section '## Context'"* ]]
}

@test "missing Decision section fails" {
  write_valid_adr 0001 record-decisions
  edit_file 's/^## Decision$/## Choice/' docs/adr/0001-record-decisions.md
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 1 ]
  [[ "$output" == *"missing required section '## Decision'"* ]]
}

@test "missing Consequences section fails" {
  write_valid_adr 0001 record-decisions
  edit_file 's/^## Consequences$/## Outcomes/' docs/adr/0001-record-decisions.md
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 1 ]
  [[ "$output" == *"missing required section '## Consequences'"* ]]
}

@test "accepted tooling ADR without implementation field fails" {
  write_valid_adr 0001 adr-tooling accepted
  edit_file 's/^tags:.*/tags: [tooling]/' docs/adr/0001-adr-tooling.md
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 1 ]
  [[ "$output" == *"accepted tooling ADR missing 'implementation:' field"* ]]
}

@test "accepted tooling ADR with implementation field passes" {
  cat > docs/adr/0001-adr-tooling.md <<EOF
---
status: accepted
date: 2026-06-10
tags: [tooling]
implementation: scripts/ci/validate-adrs.sh
---

## Context

Background.

## Decision

Choice.

## Consequences

Outcome.
EOF
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 0 ]
}

@test "proposed tooling ADR without implementation passes" {
  write_valid_adr 0001 adr-tooling proposed
  edit_file 's/^tags:.*/tags: [tooling]/' docs/adr/0001-adr-tooling.md
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 0 ]
}

@test "0000-template.md is skipped" {
  cat > docs/adr/0000-template.md <<EOF
---
status: wip
date: bad-date
tags: []
---

No sections here.
EOF
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 0 ]
}

@test "README.md is skipped" {
  printf '# ADR Index\n' > docs/adr/README.md
  write_valid_adr 0001 record-decisions
  run "$VALIDATOR" docs/adr
  [ "$status" -eq 0 ]
}
