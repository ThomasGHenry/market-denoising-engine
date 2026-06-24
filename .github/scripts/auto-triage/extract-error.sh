#!/usr/bin/env bash
set -euo pipefail

grep -iE "(error|failed|fatal)" | head -5 || echo "No error pattern found"
