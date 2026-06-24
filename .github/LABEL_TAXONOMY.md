# Label Taxonomy

All labels are created by `infra/github/main.tf`. Do not create labels manually via the GitHub UI.

## Labels

| Label | Color | Purpose | Category |
|---|---|---|---|
| `enhancement` | `#0075ca` | New capability | Type (one required) |
| `bug` | `#d73a4a` | Something is wrong | Type (one required) |
| `documentation` | `#0075ca` | Documentation only | Type (one required) |
| `tooling` | `#5319e7` | CI/infra/governance work | Type (one required) |
| `needs-triage` | `#e4e669` | Received, unexamined | Status (one required) |
| `needs-spec` | `#fbca04` | Triaged, needs spec | Status (one required) |
| `needs-adr` | `#fbca04` | Needs architectural decision | Status |
| `in-progress` | `#0e8a16` | Active work | Status |
| `acceptance-failure` | `#b60205` | CI failure (auto-created by auto-triage.yml) | Auto |
| `incident` | `#b60205` | Production incident (DORA CFR/MTTR tracking) | Manual |
| `needs-adr-review` | `#b60205` | Major dependency update (applied by Renovate) | Auto (Renovate) |
| `backlog` | `#c5def5` | Not prioritized soon | Timeline |
| `candidate-for-removal` | `#e4e669` | Evaluate for deletion | Optional |
| `good-first-issue` | `#7057ff` | Suitable for new contributors | Optional |

## Rules

- Every issue must have exactly one **Type** label.
- Every issue must have exactly one **Status** label on creation.
- **Auto** labels are applied by workflows — do not apply them manually.
- **Optional** labels may be added at any time as needed.
- Status labels progress: `needs-triage` → `needs-spec` or `needs-adr` → `in-progress`.
