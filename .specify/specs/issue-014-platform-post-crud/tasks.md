# Issue 014: TDD Task List

10 RED-GREEN-REFACTOR cycles. One at a time. No cycle begins before the previous is GREEN.

## actions.test.ts cycles

- [x] Cycle 1: action returns error when probeId is missing
- [x] Cycle 2: action returns error when platform is missing
- [x] Cycle 3: action returns error when url is missing
- [x] Cycle 4: action returns error when publishedAt is missing
- [x] Cycle 5: action calls prisma.platformPost.create with correct data (probe already PUBLISHED)
- [x] Cycle 6: action calls probe.update twice when probe is DRAFT (DRAFT→READY, READY→PUBLISHED)
- [x] Cycle 7: action calls probe.update once when probe is READY (READY→PUBLISHED)
- [x] Cycle 8: action does not call probe.update when probe is already PUBLISHED

## PlatformPostList.test.tsx cycles

- [x] Cycle 9: PlatformPostList renders platform name and URL for each post
- [x] Cycle 10: external link has target="_blank" and rel="noopener noreferrer"

## Post-cycle work

- [x] Create PlatformPostForm.tsx
- [x] Modify probes/[id]/page.tsx to render PlatformPostList and PlatformPostForm
- [x] Full test suite passes
- [x] Typecheck passes
- [x] Lint passes
- [x] Commit and push
- [x] Close issue #14
