#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib/common.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

main() {
  require_inside_git_repo
  lint_shell_scripts
}

lint_shell_scripts() {
  local scripts=()
  collect_scripts "$REPO_ROOT/scripts"
  collect_scripts "$REPO_ROOT/.github/scripts"
  if [ "${#scripts[@]}" -eq 0 ]; then
    log "no shell scripts to lint"
    return 0
  fi
  shellcheck -x -P SCRIPTDIR --severity=warning "${scripts[@]}"
}

collect_scripts() {
  local dir="$1"
  [ -d "$dir" ] || return 0
  local script
  while IFS= read -r script; do
    scripts+=("$script")
  done < <(find "$dir" -type f -name '*.sh' | sort)
}

main "$@"
