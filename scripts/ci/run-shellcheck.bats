setup() {
  RUNNER="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)/run-shellcheck.sh"
  WORK_DIR="$(mktemp -d)"
  cd "$WORK_DIR"
}

teardown() {
  rm -rf "$WORK_DIR"
}

write_clean_script() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  printf '#!/usr/bin/env bash\nset -euo pipefail\n\nprintf "ok\\n"\n' > "$path"
}

write_dirty_script() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  printf 'echo $1\n' > "$path"
}

@test "outside a git repository dies with message" {
  run "$RUNNER"
  [ "$status" -eq 1 ]
  [[ "$output" == *"not a git repository"* ]]
}

@test "repo with no shell scripts exits 0" {
  git init -q .
  run "$RUNNER"
  [ "$status" -eq 0 ]
  [[ "$output" == *"no shell scripts to lint"* ]]
}

@test "clean scripts in scripts/ pass" {
  git init -q .
  write_clean_script scripts/deploy.sh
  run "$RUNNER"
  [ "$status" -eq 0 ]
}

@test "clean scripts in .github/scripts/ pass" {
  git init -q .
  write_clean_script .github/scripts/auto-triage/triage.sh
  run "$RUNNER"
  [ "$status" -eq 0 ]
}

@test "dirty script in scripts/ fails" {
  git init -q .
  write_dirty_script scripts/dirty.sh
  run "$RUNNER"
  [ "$status" -ne 0 ]
}

@test "dirty script in .github/scripts/ fails" {
  git init -q .
  write_dirty_script .github/scripts/auto-triage/dirty.sh
  run "$RUNNER"
  [ "$status" -ne 0 ]
}
