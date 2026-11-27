# Parent-managed fulfilment

Use the verified seller's Stripe dashboard as the payment record. Maintain dispatch information in a private access-controlled system, not this public repository.

## Private order register fields
Order reference, Stripe payment reference, SKU, quantity, amount GBP, payment status, order date, fulfilment status, courier, tracking reference, dispatch date, refund status. Keep delivery addresses in the authorised payment or shipping system rather than duplicating them unnecessarily.

## Workflow
- Confirm successful payment and physical stock before packing.
- Check unique artwork purchase limits before opening sales; disable sold-out payment links and update catalogue promptly.
- Purchase tracked postage, retain proof, and send dispatch confirmation.
- Reconcile payments, shipments and refunds weekly.

## Dispatch email template
Subject: Your Butterflii order is on its way!

Hello [first name],

Thank you for supporting Butterflii Art Studio. Your order [reference] has been dispatched with [courier]. You can follow its journey here: [tracking URL].

If you need help, reply to this email with your order reference.

The Butterflii Art Studio team

## Launch requirements
Confirm legal seller, business support address, shipping rates, delivery estimates, returns policy and privacy notice before taking orders. No customer data or credentials in GitHub.
