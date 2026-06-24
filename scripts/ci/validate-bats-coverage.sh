#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib/common.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

main() {
  require_inside_git_repo
  check_coverage
  report_violations
}

check_coverage() {
  local script
  while IFS= read -r script; do
    check_sibling_suite "$script"
  done < <(find_ci_scripts)
}

find_ci_scripts() {
  find "$REPO_ROOT/scripts/ci" -maxdepth 1 -type f -name '*.sh' | sort
}

check_sibling_suite() {
  local script="$1" suite="${1%.sh}.bats"
  local rel_script rel_suite
  rel_script="${script#"$REPO_ROOT/"}"
  rel_suite="${suite#"$REPO_ROOT/"}"
  [ -f "$suite" ] || add_violation "$rel_script: missing sibling BATS suite $rel_suite"
}

main "$@"
