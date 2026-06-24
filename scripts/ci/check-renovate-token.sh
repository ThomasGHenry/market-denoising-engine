#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib/common.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

write_step_output() {
  printf '%s=%s\n' "$1" "$2" >> "${GITHUB_OUTPUT:-/dev/null}"
}

main() {
  if [ -z "${RENOVATE_TOKEN:-}" ]; then
    log "RENOVATE_TOKEN secret absent: skipping renovate (founder action: gh secret set RENOVATE_TOKEN)"
    write_step_output "RENOVATE_TOKEN_PRESENT" "false"
    return 0
  fi
  log "RENOVATE_TOKEN present: renovate proceeds"
  write_step_output "RENOVATE_TOKEN_PRESENT" "true"
}

main "$@"
