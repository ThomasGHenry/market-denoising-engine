#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib/common.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

ZERO_SHA="0000000000000000000000000000000000000000"

main() {
  require_inside_git_repo
  local from to
  from="$(range_from)"
  to="$(range_to)"
  lint_range "$from" "$to"
}

range_from() {
  case "${GITHUB_EVENT_NAME:-local}" in
    pull_request) printf '%s' "origin/${GITHUB_BASE_REF}" ;;
    push) push_range_from ;;
    *) printf 'HEAD' ;;
  esac
}

range_to() {
  case "${GITHUB_EVENT_NAME:-local}" in
    pull_request | push) printf '%s' "${GITHUB_SHA}" ;;
    *) printf 'HEAD' ;;
  esac
}

push_range_from() {
  local before="${GITHUB_EVENT_BEFORE:-$ZERO_SHA}"
  if [ "$before" = "$ZERO_SHA" ] || ! git cat-file -e "$before^{commit}" 2>/dev/null; then
    printf 'HEAD^'
    return 0
  fi
  printf '%s' "$before"
}

lint_range() {
  local from="$1" to="$2"
  local commits
  commits="$(git log --format='%H %s' "$from..$to" 2>/dev/null)" || {
    log "no commits to lint (empty range $from..$to)"
    return 0
  }
  if [ -z "$commits" ]; then
    log "no commits to lint in $from..$to"
    return 0
  fi
  local failed=0
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    local sha subject
    sha="${line%% *}"
    subject="${line#* }"
    lint_commit "$sha" "$subject" || failed=1
  done <<< "$commits"
  return "$failed"
}

lint_commit() {
  local sha="$1" subject="$2"
  is_merge_commit "$subject" && return 0
  validate_subject "$sha" "$subject"
}

is_merge_commit() {
  local subject="$1"
  [[ "$subject" =~ ^Merge\ pull\ request\ \#[0-9]+ ]] && return 0
  [[ "$subject" =~ ^Merge\ branch\ \' ]] && return 0
  [[ "$subject" =~ ^Merge\ [0-9a-f]{40}\ into\ [0-9a-f]{40}$ ]] && return 0
  return 1
}

validate_subject() {
  local sha="$1" subject="$2"
  local failed=0
  check_type_prefix "$sha" "$subject" || failed=1
  check_header_length "$sha" "$subject" || failed=1
  check_subject_case "$sha" "$subject" || failed=1
  return "$failed"
}

CONVENTIONAL_PATTERN='^(feat|fix|chore|docs|test|refactor|perf|ci|build|revert)(\(.+\))?!?: '

check_type_prefix() {
  local sha="$1" subject="$2"
  if [[ ! "$subject" =~ $CONVENTIONAL_PATTERN ]]; then
    log "$sha: invalid type prefix: $subject"
    return 1
  fi
}

check_header_length() {
  local sha="$1" subject="$2"
  if [ "${#subject}" -gt 80 ]; then
    log "$sha: header exceeds 80 chars (${#subject}): $subject"
    return 1
  fi
}

check_subject_case() {
  local sha="$1" subject="$2" description
  description="${subject#*: }"
  description="${description#*\): }"
  local first_char="${description:0:1}"
  if [[ "$first_char" =~ [A-Z] ]]; then
    log "$sha: subject must not start with uppercase: $subject"
    return 1
  fi
}

main "$@"
