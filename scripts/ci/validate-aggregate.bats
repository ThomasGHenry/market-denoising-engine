setup() {
  VALIDATOR="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)/validate-aggregate.sh"
}

@test "all success exits 0" {
  run env NEEDS_JSON='{"validate-adrs":{"result":"success"},"validate-commits":{"result":"success"}}' "$VALIDATOR"
  [ "$status" -eq 0 ]
  [[ "$output" == *"All required jobs succeeded."* ]]
}

@test "one failure exits 1 with job name" {
  run env NEEDS_JSON='{"validate-adrs":{"result":"failure"},"validate-commits":{"result":"success"}}' "$VALIDATOR"
  [ "$status" -eq 1 ]
  [[ "$output" == *"validate-adrs: failure"* ]]
}

@test "missing NEEDS_JSON exits 1" {
  run env -u NEEDS_JSON "$VALIDATOR"
  [ "$status" -eq 1 ]
  [[ "$output" == *"NEEDS_JSON environment variable is required"* ]]
}

@test "skipped job exits 0" {
  run env NEEDS_JSON='{"validate-adrs":{"result":"skipped"}}' "$VALIDATOR"
  [ "$status" -eq 0 ]
  [[ "$output" == *"All required jobs succeeded."* ]]
}

@test "cancelled job exits 1" {
  run env NEEDS_JSON='{"e2e-smoke":{"result":"cancelled"}}' "$VALIDATOR"
  [ "$status" -eq 1 ]
  [[ "$output" == *"e2e-smoke: cancelled"* ]]
}
