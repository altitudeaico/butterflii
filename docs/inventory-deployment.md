# Inventory deployment gates
- Existing HQ and Family OS projects only.
- Read-only query: SELECT p.slug,p.name,p.kind,i.stock,i.reserved,i.verified FROM butterflii.products p JOIN butterflii.inventory i ON i.product_id=p.id.
- Use a dedicated restricted database login, not the project service-role key. Audit inherited PUBLIC privileges before provisioning; stop if isolation cannot be demonstrated.
- Configure credentials only in server secret storage. Never in VITE variables.
- Bind inventory handler to HQ authenticator and restricted reader. Allow only the deployed HQ origin.
- Run Node 24 tests for inventory status and handler. Verify real parent access, artist denial, anonymous denial, no writes, and no access to unrelated schemas before deployment acceptance.
- Do not activate checkout or alter inventory.
