#!/usr/bin/env bash
set -euo pipefail

if [ -z "${NEEDS_JSON:-}" ]; then
  echo "NEEDS_JSON environment variable is required"
  exit 1
fi

FAILED=$(echo "$NEEDS_JSON" | \
  jq -r 'to_entries[] | select(.value.result != "success") | "\(.key): \(.value.result)"')

if [ -n "$FAILED" ]; then
  echo "The following required jobs did not succeed:"
  echo "$FAILED"
  exit 1
fi

echo "All required jobs succeeded."
