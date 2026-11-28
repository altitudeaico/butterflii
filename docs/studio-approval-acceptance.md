# Studio approval release gate

## Verified 28 November 2026
- Family OS butterflii.members contains zero rows.
- Authenticated users have SELECT only on members, with self-only RLS.
- Existing order, order item and delivery SELECT policies require parent membership.
- HQ README identifies a separate Supabase project. Do not assume user UUIDs match across projects.

## Before deployment
Map parent and artist accounts to verified Family OS auth identities through an authorised provisioning process. Never copy password/PIN credentials or infer identity from a UUID in the other project. Do not grant membership automatically from client input.

## Staging acceptance matrix
| Actor | Operation | Expected |
|---|---|---|
| Anonymous | Read or write submissions | Denied |
| Authenticated non-member | Read submissions | No rows |
| Authenticated non-member | Submit artwork | Denied |
| Artist | Submit title, description and positive proposed price | Allowed, pending |
| Artist | Set artist_id, status or reviewer on insert | Denied |
| Artist | Read another artist's submissions | No rows |
| Artist | Approve or edit review metadata | Denied |
| Artist | Read customer orders or deliveries | No rows |
| Parent | Read submissions | Allowed |
| Parent | Review pending submission with own reviewer ID | Allowed |
| Parent | Review using another reviewer ID | Denied |
| Parent | Re-review a resolved submission | No rows updated |
| Parent | Approve submission | Public catalogue and inventory unchanged |

Record actual results for each case before deployment. Use synthetic staging accounts only. The current draft permits parent-supplied review timestamps; replace with server-generated review timestamps before claiming trustworthy audit history. Image upload, revision/resubmission and publication remain separate work.

No production migration or account provisioning performed during this checkpoint.
