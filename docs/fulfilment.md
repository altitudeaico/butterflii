# Parent-managed fulfilment

## Quote-first sales process

1. Receive artwork and destination enquiry in the studio mailbox.
2. Confirm artist approval, physical availability, dimensions, packed weight and destination postal code.
3. Obtain a tracked courier quote and check destination restrictions.
4. Send an itemised GBP quote with artwork price, delivery, total, validity period, estimated dispatch and applicable trading terms. Explain potential import charges.
5. On acceptance, reserve the unique artwork in the private order register and mark the catalogue reserved. Do not offer the same original to another buyer while reserved.
6. Once the legal seller and Stripe configuration are approved, issue a customer-specific Stripe invoice or payment request for the agreed total. Do not request card details by email.
7. Verify payment in Stripe, not from a customer screenshot. Mark artwork sold and reconcile the payment reference.
8. Pack, dispatch with tracking, and send confirmation.
9. If a reservation expires, cancel any outstanding payment request before releasing stock. Review any late payment manually.

## Quote email template

Subject: Your Butterflii artwork and delivery quote

Hello [first name],

Thank you for your interest in [artwork].

Artwork: £[amount]
Tracked delivery to [destination]: £[amount]
Total: £[amount]

Estimated dispatch: [estimate]
Quote valid until: [date and time]

[Applicable import charges and trading terms]

If you would like to go ahead, please reply to confirm. We will check availability again and arrange a secure payment request.

The Butterflii Art Studio team

## Private order register

Keep order reference, SKU, quote amount, delivery amount, quote expiry, reservation status, Stripe reference, payment status, courier, tracking reference, dispatch date and refund status in an adult-controlled private system. Never store customer records or credentials in this public repository.

## Dispatch email template

Subject: Your Butterflii order is on its way!

Hello [first name],

Thank you for supporting Butterflii Art Studio. Your order [reference] has been dispatched with [courier]. You can follow its journey here: [tracking URL].

If you need help, reply to this email with your order reference.

The Butterflii Art Studio team

## Launch gates

Confirm legal seller, business address, returns and privacy terms, artist approval, physical stock, shipping costs and Stripe configuration before accepting payment. The process is manual and does not provide atomic inventory locking. Reconcile payments, reservations and shipments regularly.
