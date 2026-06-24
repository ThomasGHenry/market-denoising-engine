setup() {
  RUNNER="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)/check-renovate-token.sh"
  WORK_DIR="$(mktemp -d "$BATS_TMPDIR/check-renovate-token.XXXXXX")"
  OUTPUT_FILE="$WORK_DIR/github-output"
  cd "$WORK_DIR"
}

teardown() {
  rm -rf "$WORK_DIR"
}

@test "absent token no-ops with a skip line and a false output" {
  run env -u RENOVATE_TOKEN GITHUB_OUTPUT="$OUTPUT_FILE" "$RUNNER"
  [ "$status" -eq 0 ]
  [[ "$output" == *"RENOVATE_TOKEN secret absent"* ]]
  [[ "$output" == *"gh secret set RENOVATE_TOKEN"* ]]
  grep -q '^RENOVATE_TOKEN_PRESENT=false$' "$OUTPUT_FILE"
}

@test "empty token is treated as absent" {
  run env RENOVATE_TOKEN= GITHUB_OUTPUT="$OUTPUT_FILE" "$RUNNER"
  [ "$status" -eq 0 ]
  grep -q '^RENOVATE_TOKEN_PRESENT=false$' "$OUTPUT_FILE"
}

@test "present token reports true without leaking the value" {
  run env RENOVATE_TOKEN=ghp_secretvalue GITHUB_OUTPUT="$OUTPUT_FILE" "$RUNNER"
  [ "$status" -eq 0 ]
  [[ "$output" == *"RENOVATE_TOKEN present"* ]]
  [[ "$output" != *"ghp_secretvalue"* ]]
  grep -q '^RENOVATE_TOKEN_PRESENT=true$' "$OUTPUT_FILE"
  ! grep -q 'ghp_secretvalue' "$OUTPUT_FILE"
}

@test "runs without GITHUB_OUTPUT for local invocation" {
  run env -u RENOVATE_TOKEN -u GITHUB_OUTPUT "$RUNNER"
  [ "$status" -eq 0 ]
  [[ "$output" == *"RENOVATE_TOKEN secret absent"* ]]
}
