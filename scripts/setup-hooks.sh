#!/usr/bin/env bash
set -euo pipefail

command -v pre-commit >/dev/null 2>&1 || {
  echo "pre-commit not found. Install with: pip install pre-commit"
  exit 1
}

pre-commit install --hook-type pre-commit --hook-type commit-msg
echo "Git hooks installed."
