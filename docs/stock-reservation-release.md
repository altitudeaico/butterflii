# Stock lifecycle release gates
The four SQL drafts are tested together by database/stock-reservation-test.sql in a disposable PostgreSQL database. They are not production migrations.
Apply in order: stock-reservation-draft.sql, stock-sale-draft.sql, stock-cancellation-draft.sql, stock-expiry-draft.sql.
All functions are SECURITY INVOKER and deny public, anon and authenticated execution. Do not grant runtime access or apply to Family OS until the backend permission boundary has been verified.
Before activation:
- Verify current production schema and constraints, RLS, grants and migration rollback plan.
- Implement trusted session binding, Stripe signature verification, paid status, GBP amount and order identity verification.
- Confirm terminal unpaid Stripe expiry before cancellation or expiry. Browser redirects and local timers are insufficient.
- Recover reservations when session creation fails or session binding is interrupted; reconcile uncertain Stripe responses before release.
- Verify simultaneous checkout and competing terminal events using separate database sessions.
- Verify dedicated backend permissions and isolation from Family OS; never expose service credentials to browser.
- Run test-mode end-to-end purchase, cancellation, expiry and replay tests.
- Obtain launch approval before live keys or real stock activation.
No live migration or runtime grant is authorised by this document.
