# Butterflii launch gates

Do not merge or deploy commercially until these checks pass.

- Confirm legal seller, parent-controlled Stripe account and business contact details.
- Verify each artwork's actual availability, GBP price, shipping address collection, postage and payment-link purchase limit. Do not accept multiple purchases of unique originals.
- Recover and verify merchandise catalogue, photos, prices and stock.
- Configure enquiry and mailing-list endpoints, spam protection, consent records, unsubscribe and privacy notice; test actual delivery.
- Confirm UK delivery and returns terms and legal seller information before accepting orders.
- Test all links, images, mobile navigation, share fallback, checkout and failed payment behaviour in a preview environment.
- Verify production hosting terms, DNS, TLS and rollback before switching domain.

## Parent-managed fulfilment
1. Verify payment in Stripe (never trust a browser redirect alone).
2. Check stock and disable sold-out links; record order in private system only.
3. Pack artwork, purchase tracked postage and send customer a dispatch email with tracking URL.
4. Record dispatch date and tracking reference privately; handle refunds and returns through the legal seller.

No customer data or credentials belong in this public repository.
