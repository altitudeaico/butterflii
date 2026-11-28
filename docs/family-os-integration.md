# Family OS integration decision
Approved by the owner on 28 November 2026.

## Architecture
Family OS Supabase, isolated butterflii schema, is the authoritative commerce store. Existing HQ authentication and artwork workflows remain in place until a separately verified integration is ready. Do not duplicate authoritative stock or order records.

## Access
- Public shop: published catalogue and availability only.
- Parent HQ: authenticated, authorised business operations; inventory reader initially read-only.
- Artist HQ: own creative work and approved aggregate achievements; no customer personal information.
- Family TV: explicitly authorised aggregate milestones and approved artwork only. Earnings and inventory displays optional, off until configured. No customer personal information, order management or private expenses.
- Use server-side restricted credentials and deny access by default. Never embed privileged credentials in clients. TV access must not inherit parent administration rights.

## Release gates
Audit inherited database privileges before creating a dedicated inventory reader. Verify access isolation and denied writes, then integrate HQ authentication, run tests, deploy and verify. Future TV integration uses a separately scoped read-only projection. No additional paid infrastructure, stock changes or live checkout activation authorised by this decision.
