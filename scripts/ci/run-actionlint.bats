setup() {
  RUNNER="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)/run-actionlint.sh"
  WORK_DIR="$(mktemp -d "$BATS_TMPDIR/run-actionlint.XXXXXX")"
  cd "$WORK_DIR"
}

teardown() {
  rm -rf "$WORK_DIR"
}

write_workflow_missing_runs_on() {
  mkdir -p .github/workflows
  printf 'name: broken\non: [push]\njobs:\n  build:\n    steps:\n      - run: echo hi\n' > .github/workflows/broken.yml
}

write_clean_workflow() {
  mkdir -p .github/workflows
  printf 'name: clean\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n' > .github/workflows/clean.yml
}

@test "outside a git repository dies with message" {
  run "$RUNNER"
  [ "$status" -eq 1 ]
  [[ "$output" == *"not a git repository"* ]]
}

@test "missing actionlint binary dies with install message" {
  git init -q .
  write_clean_workflow
  local stub_path tool
  stub_path="$(mktemp -d "$BATS_TMPDIR/stub-path.XXXXXX")"
  for tool in bash git dirname; do
    ln -s "$(command -v "$tool")" "$stub_path/$tool"
  done
  run env PATH="$stub_path" "$RUNNER"
  [ "$status" -eq 1 ]
  [[ "$output" == *"actionlint not found"* ]]
}

@test "repo without workflow files exits 0" {
  git init -q .
  run "$RUNNER"
  [ "$status" -eq 0 ]
  [[ "$output" == *"no workflow files"* ]]
}

@test "clean workflow passes" {
  git init -q .
  write_clean_workflow
  run "$RUNNER"
  [ "$status" -eq 0 ]
}

@test "workflow with schema error fails" {
  git init -q .
  write_workflow_missing_runs_on
  run "$RUNNER"
  [ "$status" -ne 0 ]
  [[ "$output" == *'"runs-on" section is missing'* ]]
}
