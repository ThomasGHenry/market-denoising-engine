#!/usr/bin/env bash
set -euo pipefail

TITLE="CI Failure: ${WORKFLOW_NAME}"
LABEL="acceptance-failure"

existing=$(gh issue list \
  --repo "$GITHUB_REPOSITORY" \
  --label "$LABEL" \
  --state open \
  --search "$TITLE" \
  --json number \
  --jq '.[0].number // empty')

if [ -n "$existing" ]; then
  gh issue comment "$existing" \
    --repo "$GITHUB_REPOSITORY" \
    --body "**New failure** at commit \`${COMMIT_SHA}\`
Run: ${RUN_URL}
Actor: ${ACTOR}"
else
  gh issue create \
    --repo "$GITHUB_REPOSITORY" \
    --title "$TITLE" \
    --label "$LABEL" \
    --label "needs-triage" \
    --body "## CI Failure

**Workflow:** ${WORKFLOW_NAME}
**Commit:** \`${COMMIT_SHA}\`
**Run:** ${RUN_URL}
**Actor:** ${ACTOR}

Investigate and resolve before merging further changes."
fi
