# Practice 2 — CDN Configuration

Goal: serve 90%+ of static assets from the CDN.

## Recommended

- Put static assets (images, JS/CSS bundles) behind a CDN (Cloudflare/Fastly/Akamai).
- Use cache-friendly URLs (content hashes) and long `Cache-Control`.

## Verification

- Check CDN analytics and response headers.
- Confirm origin hit rate is low during peak.
