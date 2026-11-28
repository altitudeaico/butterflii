# HQ commerce authentication boundary (proposed)

HQ currently uses its own Supabase Auth session and hq.profiles. Commerce uses Family OS Supabase and butterflii.members. Do not pass HQ JWTs directly to Family OS PostgREST or assume matching UUIDs.

## Proposed integration
A server endpoint validates the HQ access token against the configured HQ Auth issuer, checks expiry and audience, retrieves the current HQ profile using that verified identity, and resolves an explicit administrator-provisioned identity mapping to a commerce member. Deny unknown mappings and roles. Never accept a role or member ID from the client. Do not expose service credentials to the browser.

The existing draft RLS policies depend on auth.uid() in the Family OS project. A service-role call would bypass those policies and cannot simply reuse them. Before implementation, choose a supported delegated identity mechanism or narrowly scoped server-only database functions with explicit membership checks, immutable audit records and no general-purpose SQL access. Test the selected approach against both projects. Do not mint Family OS JWTs using signing secrets.

## Acceptance
- Existing HQ login remains unchanged.
- Expired, invalid, wrong-issuer and unmapped sessions denied.
- Artist cannot review, publish or access customer records.
- Parent permissions derived server-side, not from request body.
- No cross-project credentials in frontend or repository.
- No live account changes until identity mapping is verified.

Status: design only; no bridge deployed. The existing HQ auth code was inspected, but live sessions were not tested.
