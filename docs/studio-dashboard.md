# Butterflii Studio Management Dashboard

## Artist workspace
Artwork title, image, description, proposed price, artist approval, display preference. No customer records, payment credentials or direct customer messaging.

## Parent workspace
Approve publication and pricing; confirm stock; manage enquiries, quotes, reservations, payment references, dispatch and refunds. Review revenue and outstanding orders.

## Data model
Artwork: SKU, title, description, image reference, proposed price, approved price, artist approval, parent approval, availability.
Quote: reference, SKU, artwork amount, delivery amount, currency, expiry, reservation status.
Order: reference, quote reference, payment reference, payment status, fulfilment status, courier, tracking reference.
Customer contact and addresses remain in authorised CRM/payment/shipping systems where possible.

## Access and implementation gates
Separate authenticated private application, not a hidden route on the public site. Parent-only administration, least privilege, server-enforced permissions, audit history and secure secret storage. Artist workspace access must be parent-managed. No production customer data in GitHub or browser local storage. Do not provision paid services or connect production data without approval.

## MVP acceptance
Parent can approve a piece and change availability; artist can review artwork without accessing customer data; parent can record a quote and reservation; payment status is verified against Stripe; concurrent reservations cannot claim the same original; public catalogue publishes only approved fields. Test access isolation and reservation concurrency before launch.

## Status
Design only. No authenticated dashboard or database has been deployed.
