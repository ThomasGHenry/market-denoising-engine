# Issue 014: PlatformPost CRUD — Record Manually Published Posts

## User Journeys

### Journey 1: Record a manually published post

A user has manually published a probe to LinkedIn. They open the probe detail page, fill in the platform, URL, and published-at date, then submit. The record appears in the platform posts list and the probe status advances to PUBLISHED automatically.

### Journey 2: Record a post when probe is already READY

A user's probe is in READY status. They record the post. The probe advances directly from READY to PUBLISHED (one step only).

### Journey 3: Record a post when probe is already PUBLISHED

A user already marked the probe published. They record an additional post (e.g. cross-posted to X). The probe status does not change.

### Journey 4: Validation error on missing field

A user submits the form without selecting a platform. They see a clear error message and no record is created.

## Acceptance Criteria

- AC-1: A platform post can be recorded with: platform (required), URL (required), publishedAt (required), caption (optional).
- AC-2: Submitting the form when probeId is missing returns an error.
- AC-3: Submitting the form when platform is missing returns an error.
- AC-4: Submitting the form when URL is missing returns an error.
- AC-5: Submitting the form when publishedAt is missing returns an error.
- AC-6: On success the user is redirected to the probe detail page.
- AC-7: When probe status is DRAFT, the probe transitions DRAFT→READY then READY→PUBLISHED.
- AC-8: When probe status is READY, the probe transitions READY→PUBLISHED only.
- AC-9: When probe status is PUBLISHED or other, no status transition occurs.
- AC-10: The platform posts list on the probe detail page renders platform name and URL for each post.
- AC-11: Every external link in the platform posts list opens in a new tab with rel="noopener noreferrer".
