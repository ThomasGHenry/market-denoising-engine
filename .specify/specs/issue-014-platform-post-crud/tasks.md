# Issue 014: TDD Task List

10 RED-GREEN-REFACTOR cycles. One at a time. No cycle begins before the previous is GREEN.

## actions.test.ts cycles

- [ ] Cycle 1: action returns error when probeId is missing
- [ ] Cycle 2: action returns error when platform is missing
- [ ] Cycle 3: action returns error when url is missing
- [ ] Cycle 4: action returns error when publishedAt is missing
- [ ] Cycle 5: action calls prisma.platformPost.create with correct data (probe already PUBLISHED)
- [ ] Cycle 6: action calls probe.update twice when probe is DRAFT (DRAFT→READY, READY→PUBLISHED)
- [ ] Cycle 7: action calls probe.update once when probe is READY (READY→PUBLISHED)
- [ ] Cycle 8: action does not call probe.update when probe is already PUBLISHED

## PlatformPostList.test.tsx cycles

- [ ] Cycle 9: PlatformPostList renders platform name and URL for each post
- [ ] Cycle 10: external link has target="_blank" and rel="noopener noreferrer"

## Post-cycle work

- [ ] Create PlatformPostForm.tsx
- [ ] Modify probes/[id]/page.tsx to render PlatformPostList and PlatformPostForm
- [ ] Full test suite passes
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Commit and push
- [ ] Close issue #14
