# Release acceptance

Verified baseline: commit 96f9b3a9d0c9158bdd0fdecf318d5abf9357e0b7, GitHub Actions run 46054468905. Static checks and Chromium smoke tests at 390px and 1440px passed against packaged dist. Screenshot and deployable-preview artifacts available on that run.

## Preview acceptance
- [ ] Deploy preview to separate hosting project, without custom domain.
- [ ] Restrict preview access where supported; noindex alone is not private.
- [ ] Visually inspect all six pages on actual phones and desktop.
- [ ] Verify social destinations and share links.

## Production acceptance
- [ ] Confirm legal seller, parent-managed business contact and Stripe account.
- [ ] Verify original artwork availability and enforce one completed purchase per original.
- [ ] Confirm merchandise variants, fulfilment and stock before enabling purchases.
- [ ] Test shipping charges, address collection, receipts and dispatch workflow.
- [ ] Connect enquiry and newsletter services; test actual delivery, consent and unsubscribe.
- [ ] Approve and publish applicable customer policies.
- [ ] Build production separately; remove preview indexing restrictions only after approval.
- [ ] Verify DNS, TLS and rollback plan; preserve email DNS records.

No production release is approved by this document. Passing smoke tests does not establish payment or form delivery readiness.
