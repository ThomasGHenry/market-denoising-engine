#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '%s\n' "$*"
}

die() {
  printf '%s\n' "$*" >&2
  exit 1
}

require_inside_git_repo() {
  git rev-parse --git-dir > /dev/null 2>&1 || die "not a git repository: $PWD"
}

VIOLATIONS=()

add_violation() {
  VIOLATIONS+=("$1")
}

report_violations() {
  if [ "${#VIOLATIONS[@]}" -eq 0 ]; then
    return 0
  fi
  printf '%s\n' "${VIOLATIONS[@]}"
  return 1
}
