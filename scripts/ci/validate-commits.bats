ZERO_SHA="0000000000000000000000000000000000000000"

setup() {
  VALIDATOR="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)/validate-commits.sh"
  WORK_DIR="$(mktemp -d)"
  ORIGIN_DIR="$WORK_DIR/origin"
  CLONE_DIR="$WORK_DIR/clone"
  create_seeded_origin
  clone_fixture_repo
  cd "$CLONE_DIR"
}

teardown() {
  rm -rf "$WORK_DIR"
}

create_seeded_origin() {
  git init -q -b main "$ORIGIN_DIR"
  configure_identity "$ORIGIN_DIR"
  commit_in "$ORIGIN_DIR" "chore: seed fixture repository"
}

clone_fixture_repo() {
  git clone -q "$ORIGIN_DIR" "$CLONE_DIR"
  configure_identity "$CLONE_DIR"
}

configure_identity() {
  local dir="$1"
  git -C "$dir" config user.name "Fixture"
  git -C "$dir" config user.email "fixture@example.com"
  git -C "$dir" config commit.gpgsign false
}

commit_in() {
  local dir="$1" message="$2"
  echo entry >> "$dir/notes.txt"
  git -C "$dir" add notes.txt
  git -C "$dir" commit -q -m "$message"
}

fixture_commit() {
  commit_in "$CLONE_DIR" "$1"
}

@test "valid conventional commit passes" {
  local before
  before="$(git rev-parse HEAD)"
  fixture_commit "feat: add valid feature"
  export GITHUB_EVENT_NAME=push
  export GITHUB_SHA="$(git rev-parse HEAD)"
  export GITHUB_EVENT_BEFORE="$before"
  run "$VALIDATOR"
  [ "$status" -eq 0 ]
}

@test "commit missing type prefix fails" {
  local before
  before="$(git rev-parse HEAD)"
  fixture_commit "added stuff without type"
  export GITHUB_EVENT_NAME=push
  export GITHUB_SHA="$(git rev-parse HEAD)"
  export GITHUB_EVENT_BEFORE="$before"
  run "$VALIDATOR"
  [ "$status" -ne 0 ]
  [[ "$output" == *"invalid type prefix"* ]]
}

@test "header exceeding 72 chars fails" {
  local before
  before="$(git rev-parse HEAD)"
  fixture_commit "feat: this is a very long commit message subject that exceeds the limit of seventy-two characters"
  export GITHUB_EVENT_NAME=push
  export GITHUB_SHA="$(git rev-parse HEAD)"
  export GITHUB_EVENT_BEFORE="$before"
  run "$VALIDATOR"
  [ "$status" -ne 0 ]
  [[ "$output" == *"header exceeds 72 chars"* ]]
}

@test "merge PR commit is skipped" {
  local before
  before="$(git rev-parse HEAD)"
  fixture_commit "Merge pull request #42 from user/feature"
  export GITHUB_EVENT_NAME=push
  export GITHUB_SHA="$(git rev-parse HEAD)"
  export GITHUB_EVENT_BEFORE="$before"
  run "$VALIDATOR"
  [ "$status" -eq 0 ]
}

@test "uppercase subject after type fails" {
  local before
  before="$(git rev-parse HEAD)"
  fixture_commit "feat: This starts with uppercase"
  export GITHUB_EVENT_NAME=push
  export GITHUB_SHA="$(git rev-parse HEAD)"
  export GITHUB_EVENT_BEFORE="$before"
  run "$VALIDATOR"
  [ "$status" -ne 0 ]
  [[ "$output" == *"subject must not start with uppercase"* ]]
}
