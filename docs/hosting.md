# Hosting and cutover

Recommended: Cloudflare Pages static hosting connected to GitHub. No Shopify runtime required. Verify current service terms and account access before setup.

Preview build command: node scripts/build-preview.cjs
Output directory: dist
Use weekend-launch-2026-11-27 branch. Restrict preview access using Cloudflare Access where available; noindex is not access control. Do not attach the public domain yet. Preview output intentionally blocks search indexing.

Check all local assets and external scripts, review screenshots and complete payment, forms, policies and stock gates. Production build must explicitly remove preview-only indexing restrictions after approval. Verify DNS records, preserve mail records, configure TLS, record old DNS values for rollback and only then switch domain. Do not commit credentials or customer data.
