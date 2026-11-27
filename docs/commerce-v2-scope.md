# Butterflii commerce v2 — 27 November 2026

## Confirmed by owner
- Altitude AI Consulting Stripe account; owner states not VAT registered, no VAT collection. Confirm legal trading status before live activation.
- GoHighLevel for mailing list; Altitude firm funnel for enquiries; destination olatoyefirm@gmail.com. Exact funnel endpoints and credentials still required.
- Retain existing catalogue and inventory records; verify physical availability before enabling sales.
- Proper basket, checkout, delivery and order management; family companion app for artwork and supporting videos; synchronised purchases and notifications.

## Proposed implementation
- GitHub source, commercial-compatible static hosting; hosting account/domain access unverified.
- Dedicated Supabase project preferred to isolate public commerce/customer data from private Family OS. No existing project changes without approval.
- Parent-approved product drafts, media uploads, integer GBP minor-unit prices, SKU/variant stock, published catalogue, atomic reservations and expiry reconciliation.
- Server-created Stripe hosted Checkout sessions with authoritative prices, UK shipping, no automatic tax, verified webhook signatures, idempotent events, paid-state validation and stock reconciliation. No card data stored. Never trust browser totals or redirect as proof of payment.
- Parent-only order/address/refund access; artist role drafts and non-identifying sales achievements. No public child contact details. Invite-only authentication, RLS and storage policies, private draft media and approved public assets.
- In-app notifications and parent email first; optional push after permission. GoHighLevel integration server-side; separate newsletter consent, unsubscribe and enquiry purpose.
- Courier tracking and dispatch emails; manual label purchase initially.

## Acceptance gates
1. Isolated backend and permission tests, including anonymous and artist denial of customer data.
2. Product/media draft and approval workflow, live catalogue sync, inventory/variant edits.
3. Test checkout, concurrent single-stock purchase, failed/expired session recovery, duplicate webhook replay, refunds and order status.
4. Dispatch/tracking and notification tests; GHL test enquiry and opt-in.
5. Visual review, privacy/consumer policies, approved shipping/stock, commercial hosting and DNS rollback.

Existing static preview remains intact. This document is a scope baseline, not evidence of implementation. No production payment, database or DNS changes authorised by this commit.
