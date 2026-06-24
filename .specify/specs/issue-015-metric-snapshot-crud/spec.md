# MetricSnapshot CRUD — Spec

## Resolved Ambiguities (Phase III — Clarify)

1. **UI location**: Dedicated `/platform-posts/[id]` page. Cleaner than inline on the probe detail page and matches the navigation structure already established for platform posts.
2. **capturedAt input**: Required `datetime-local` input. The user must set the point-in-time explicitly; no defaulting to now.
3. **Validation pattern**: Check required fields, return an error string on failure, no Zod. Matches the pattern in `apps/web/src/app/platform-posts/actions.ts`.
4. **Scope**: Full CRUD — create, read (list), update, delete.
5. **After create**: Redirect to `/platform-posts/[id]`.
6. **Update**: Edit form pre-populated with existing values via a hidden `id` field; on success, stay on `/platform-posts/[id]` (no redirect, just revalidate).
7. **Delete**: A form with hidden `id` and `platformPostId`, single submit button; on success, revalidate and return `null`.

---


## What the user can do

From the platform post detail page, a user can:

- **Create** a metric snapshot by filling in a form with a required capture timestamp and optional numeric metrics (impressions, views, likes, comments, shares, saves, follows, profile clicks, link clicks, leads, qualitative score, hours since post) and optional notes text.
- **View** all metric snapshots for the platform post, ordered most-recent first, showing at minimum the capture timestamp, impressions, and likes for each snapshot.
- **Update** an existing metric snapshot by navigating to an edit form pre-populated with current values, changing any fields, and submitting.
- **Delete** a metric snapshot by submitting a delete form containing only the snapshot identifier, with no confirmation dialog required.

## Business rules

- A metric snapshot belongs to exactly one platform post and cannot be reassigned.
- `capturedAt` is required; the user must explicitly choose the point-in-time the metrics represent.
- All numeric metric fields (impressions, views, likes, comments, shares, saves, follows, profile clicks, link clicks, leads, qualitative score, hours since post) are optional; any subset may be provided.
- `notes` is optional free text.

## Success criteria

- After creating a snapshot, the user lands on the platform post detail page and the new snapshot appears in the list.
- After updating a snapshot, the platform post detail page reflects the updated values.
- After deleting a snapshot, the platform post detail page no longer shows that snapshot.
- Submitting the create form without a `capturedAt` value keeps the user on the form and displays an error message.
- Submitting update or delete without the required identifiers returns an error.
