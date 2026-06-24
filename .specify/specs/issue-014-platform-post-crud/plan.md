# Issue 014: Technical Plan

## Server Action: `createPlatformPost`

File: `apps/web/src/app/platform-posts/actions.ts`

Signature:
```typescript
'use server'
export async function createPlatformPost(
  prevState: string | null,
  formData: FormData
): Promise<string | null>
```

### Validation (in order)
1. Extract `probeId` — error if missing/empty
2. Extract `platform` — error if missing/empty
3. Extract `url` — error if missing/empty
4. Extract `publishedAt` — error if missing/empty

### Probe auto-transition logic
- Call `prisma.probe.findUnique` to get current status
- If status === `DRAFT`: call `prisma.probe.update` with `READY`, then again with `PUBLISHED`
- If status === `READY`: call `prisma.probe.update` with `PUBLISHED` once
- Otherwise: skip probe updates

### Record creation
- Call `prisma.platformPost.create` with validated fields
- Redirect to `/probes/[probeId]`

### Critical constraint
Do NOT add a DRAFT→PUBLISHED shortcut to the domain package. Use two sequential prisma update calls.

## Components

### `PlatformPostList`

File: `apps/web/src/app/probes/[id]/PlatformPostList.tsx`

Props:
```typescript
interface PlatformPostListProps {
  posts: { id: string; platform: string; url: string | null }[]
}
```

Renders a list. For each post: platform name + URL as an external link with `target="_blank" rel="noopener noreferrer"`.

### `PlatformPostForm`

File: `apps/web/src/app/probes/[id]/PlatformPostForm.tsx`

`'use client'` component using `useActionState(createPlatformPost, null)`.

Fields: hidden `probeId`, `platform` (select from Platform enum values), `url` (text, required), `publishedAt` (datetime-local, required), `caption` (textarea, optional).

### Probe Detail Page modification

File: `apps/web/src/app/probes/[id]/page.tsx`

Import and render `<PlatformPostList posts={probe.platformPosts} />` and `<PlatformPostForm probeId={probe.id} />` below the reviews section.

## Test Files

- `apps/web/src/app/platform-posts/actions.test.ts` — 8 Vitest cycles for server action
- `apps/web/src/app/probes/[id]/PlatformPostList.test.tsx` — 2 Vitest cycles for the list component
