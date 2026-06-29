#!/usr/bin/env bash
set -euo pipefail

ZERO_SHA="0000000000000000000000000000000000000000"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

while IFS=' ' read -r _local_ref local_sha _remote_ref remote_sha; do
  [ "$local_sha" = "$ZERO_SHA" ] && continue

  if [ "$remote_sha" = "$ZERO_SHA" ]; then
    remote_sha="$(git rev-parse origin/main 2>/dev/null || echo "$ZERO_SHA")"
  fi

  GITHUB_EVENT_NAME=push \
  GITHUB_EVENT_BEFORE="$remote_sha" \
  GITHUB_SHA="$local_sha" \
    bash "$SCRIPT_DIR/../ci/validate-commits.sh"
done
