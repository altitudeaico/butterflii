# Private artwork studio release

## Release gates
- Require successful catalogue, artwork and database CI jobs on the release commit.
- Verify actual Supabase schema, role types, grants and membership prerequisites.
- Confirm authorised parent and artist identity mappings without guessing IDs.
- Obtain explicit approval before changing shared Family OS production.
- Prefer a dedicated least-privilege database credential; do not deploy a broad Family OS service-role credential without risk approval.

## Worker configuration
Deploy separately using server/wrangler.jsonc. Set HQ_URL, HQ_PUBLISHABLE_KEY, COMMERCE_URL, HQ_ALLOWED_ORIGIN and the approved server credential via secure Worker configuration. Never commit secrets. Configure VITE_ARTWORK_API_URL to the verified HTTPS Worker origin in HQ. Keep the existing public site deployment unchanged.

## Acceptance
Use authorised test accounts: submit artwork, verify isolation, review with feedback, approve a separate submission, reject duplicate review, verify catalogue unchanged. Verify sign-out and denied access. Image upload, resubmission and publication are not included in this release.

## Rollback
Disable the HQ artwork API configuration and roll back the separate Worker. Preserve submission records; do not drop tables containing user data. Review database rollback separately. Record release commit, migration results and acceptance evidence.
