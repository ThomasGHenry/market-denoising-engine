setup() {
  VALIDATOR="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)/validate-bats-coverage.sh"
  WORK_DIR="$(mktemp -d)"
  cd "$WORK_DIR"
}

teardown() {
  rm -rf "$WORK_DIR"
}

@test "outside a git repository dies with message" {
  run "$VALIDATOR"
  [ "$status" -eq 1 ]
  [[ "$output" == *"not a git repository"* ]]
}

@test "repo with no ci scripts exits 0" {
  git init -q .
  mkdir -p scripts/ci
  run "$VALIDATOR"
  [ "$status" -eq 0 ]
}

@test "ci script without sibling suite fails with message" {
  git init -q .
  mkdir -p scripts/ci
  touch scripts/ci/deploy.sh
  run "$VALIDATOR"
  [ "$status" -eq 1 ]
  [[ "$output" == *"scripts/ci/deploy.sh: missing sibling BATS suite scripts/ci/deploy.bats"* ]]
}

@test "ci script with sibling suite passes" {
  git init -q .
  mkdir -p scripts/ci
  touch scripts/ci/deploy.sh
  touch scripts/ci/deploy.bats
  run "$VALIDATOR"
  [ "$status" -eq 0 ]
}

@test "every uncovered ci script is reported" {
  git init -q .
  mkdir -p scripts/ci
  touch scripts/ci/first.sh
  touch scripts/ci/second.sh
  run "$VALIDATOR"
  [ "$status" -eq 1 ]
  [[ "$output" == *"scripts/ci/first.sh: missing sibling BATS suite scripts/ci/first.bats"* ]]
  [[ "$output" == *"scripts/ci/second.sh: missing sibling BATS suite scripts/ci/second.bats"* ]]
}
