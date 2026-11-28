# Family OS regression acceptance

No shared permission changes or new paid infrastructure are authorised by this checklist.

## Verified so far
- Family OS project healthy; seven existing edge functions active.
- Backend execution retained for three restricted identity RPCs; family identity predicates remain accessible.
- Butterflii isolated endpoint automated tests passed.

## Outstanding live checks
- Existing parent sign-in and session refresh.
- Existing child and surface sign-in; do not reset or reprovision working devices solely for testing.
- Physical TV home, Academy and existing navigation.
- Existing Family Chat and media viewing, where configured.
- Review errors after checks; do not record tokens or family data.

## Inventory connection gate
Keep butterflii_inventory_reader NOLOGIN until inherited networking access is resolved. Do not use a broad service-role key as a substitute. A candidate alternative is a dedicated read-only capability RPC with fixed projection and independent authentication, subject to security review, explicit deployment design and disposable-environment tests. No live deployment until authorised parent read, artist denial, anonymous denial and unrelated data isolation are demonstrated.

Record date, tester and pass/fail for each live check. Infrastructure health is not a substitute for application regression acceptance.
