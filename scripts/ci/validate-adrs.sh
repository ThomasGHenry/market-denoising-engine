#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib/common.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

main() {
  local adr_dir="${1:-docs/adr}"
  [ -d "$adr_dir" ] || die "ADR directory not found: $adr_dir"
  validate_corpus "$adr_dir"
  report_violations
}

validate_corpus() {
  local adr_dir="$1" file
  for file in "$adr_dir"/*.md; do
    [ -e "$file" ] || continue
    skip_file "$file" && continue
    validate_adr "$file"
  done
}

skip_file() {
  local name
  name="$(basename "$1")"
  case "$name" in
    0000-template.md | README.md) return 0 ;;
    *) return 1 ;;
  esac
}

validate_adr() {
  local file="$1"
  check_filename "$file"
  check_frontmatter "$file"
  check_required_sections "$file"
  check_supersedes_reference "$file"
}

check_filename() {
  local file="$1" name
  name="$(basename "$file")"
  if [[ ! "$name" =~ ^[0-9]{4}-[a-z0-9]+(-[a-z0-9]+)*\.md$ ]]; then
    add_violation "$file: filename must match NNNN-kebab-case-title.md"
  fi
}

check_frontmatter() {
  local file="$1" frontmatter
  if ! frontmatter="$(read_frontmatter "$file")"; then
    add_violation "$file: missing frontmatter"
    return 0
  fi
  check_required_keys "$file" "$frontmatter"
  check_status_enum "$file" "$frontmatter"
  check_date_format "$file" "$frontmatter"
  check_implementation_key "$file" "$frontmatter"
}

check_required_keys() {
  local file="$1" frontmatter="$2" key
  for key in status date tags; do
    if ! grep -q "^$key:" <<< "$frontmatter"; then
      add_violation "$file: missing frontmatter key '$key'"
    fi
  done
}

check_status_enum() {
  local file="$1" frontmatter="$2" status
  status="$(frontmatter_value "$frontmatter" status)"
  [ -n "$status" ] || return 0
  case "$status" in
    proposed | accepted | rejected | deprecated | superseded) ;;
    *) add_violation "$file: invalid status '$status'" ;;
  esac
}

check_date_format() {
  local file="$1" frontmatter="$2" date
  date="$(frontmatter_value "$frontmatter" date)"
  [ -n "$date" ] || return 0
  if [[ ! "$date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    add_violation "$file: invalid date '$date', expected YYYY-MM-DD"
  fi
}

check_implementation_key() {
  local file="$1" frontmatter="$2" status tags
  status="$(frontmatter_value "$frontmatter" status)"
  tags="$(frontmatter_value "$frontmatter" tags)"
  [ "$status" = "accepted" ] || return 0
  [[ "$tags" == *tooling* ]] || return 0
  if ! grep -q "^implementation:" <<< "$frontmatter"; then
    add_violation "$file: accepted tooling ADR missing 'implementation:' field"
  fi
}

check_required_sections() {
  local file="$1" section
  for section in '## Context' '## Decision' '## Consequences'; do
    if ! grep -q "^$section" "$file"; then
      add_violation "$file: missing required section '$section'"
    fi
  done
}

check_supersedes_reference() {
  local file="$1" frontmatter supersedes_val target
  frontmatter="$(read_frontmatter "$file")" || return 0
  supersedes_val="$(frontmatter_value "$frontmatter" supersedes)"
  [ -n "$supersedes_val" ] || return 0
  target="$(dirname "$file")/$supersedes_val"
  if [ ! -e "$target" ]; then
    add_violation "$file: supersedes references '$supersedes_val' which does not exist"
  fi
}

read_frontmatter() {
  awk '
    NR == 1 { if ($0 != "---") exit 1; next }
    /^---$/ { closed = 1; exit }
    { print }
    END { exit (closed ? 0 : 1) }
  ' "$1"
}

frontmatter_value() {
  local frontmatter="$1" key="$2"
  sed -n "s/^$key:[[:space:]]*//p" <<< "$frontmatter" | head -1
}

main "$@"
