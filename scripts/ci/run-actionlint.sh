#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib/common.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

main() {
  require_inside_git_repo
  require_actionlint
  lint_workflows
}

require_actionlint() {
  command -v actionlint > /dev/null 2>&1 || die "actionlint not found; install it: brew install actionlint"
}

lint_workflows() {
  if ! workflow_files_exist; then
    log "no workflow files to lint"
    return 0
  fi
  actionlint
}

workflow_files_exist() {
  compgen -G '.github/workflows/*.yml' > /dev/null ||
    compgen -G '.github/workflows/*.yaml' > /dev/null
}

main "$@"
