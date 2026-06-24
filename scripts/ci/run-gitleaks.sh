#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib/common.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

main() {
  require_inside_git_repo
  require_gitleaks
  case "${1:-full}" in
    full) scan_full ;;
    staged) scan_staged ;;
    *) die "usage: ${0##*/} [full|staged]" ;;
  esac
}

require_gitleaks() {
  command -v gitleaks > /dev/null 2>&1 || die "gitleaks not found; install it: brew install gitleaks"
}

scan_full() {
  gitleaks git --redact --no-banner .
}

scan_staged() {
  gitleaks git --pre-commit --staged --redact --no-banner .
}

main "$@"
