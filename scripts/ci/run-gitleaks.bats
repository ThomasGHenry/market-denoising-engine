setup() {
  RUNNER="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)/run-gitleaks.sh"
  WORK_DIR="$(mktemp -d "$BATS_TMPDIR/run-gitleaks.XXXXXX")"
  cd "$WORK_DIR"
}

teardown() {
  rm -rf "$WORK_DIR"
}

plant_fake_aws_key() {
  local path="$1"
  printf 'aws_access_key_id = %s%s\n' 'AKIA' 'IMNOJVGFDXXXE4OA' > "$path"
}

commit_tracked_file() {
  local path="$1"
  git add "$path"
  git -c user.email=bats@example.com -c user.name=bats commit -qm fixture
}

@test "outside a git repository dies with message" {
  run "$RUNNER"
  [ "$status" -eq 1 ]
  [[ "$output" == *"not a git repository"* ]]
}

@test "unknown mode dies with usage" {
  git init -q .
  run "$RUNNER" bogus
  [ "$status" -eq 1 ]
  [[ "$output" == *"usage"* ]]
}

@test "missing gitleaks binary dies with install message" {
  git init -q .
  local stub_path tool
  stub_path="$(mktemp -d "$BATS_TMPDIR/stub-path.XXXXXX")"
  for tool in bash git dirname; do
    ln -s "$(command -v "$tool")" "$stub_path/$tool"
  done
  run env PATH="$stub_path" "$RUNNER"
  [ "$status" -eq 1 ]
  [[ "$output" == *"gitleaks not found"* ]]
}

@test "clean history passes" {
  git init -q .
  printf 'plain text\n' > notes.txt
  commit_tracked_file notes.txt
  run "$RUNNER"
  [ "$status" -eq 0 ]
}

@test "history containing planted secret fails" {
  git init -q .
  plant_fake_aws_key credentials.txt
  commit_tracked_file credentials.txt
  run "$RUNNER"
  [ "$status" -ne 0 ]
  [[ "$output" == *"leaks found"* ]]
}

@test "clean staged changes pass" {
  git init -q .
  printf 'plain text\n' > notes.txt
  git add notes.txt
  run "$RUNNER" staged
  [ "$status" -eq 0 ]
}

@test "staged planted secret fails" {
  git init -q .
  plant_fake_aws_key credentials.txt
  git add credentials.txt
  run "$RUNNER" staged
  [ "$status" -ne 0 ]
  [[ "$output" == *"leaks found"* ]]
}
