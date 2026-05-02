# Practice Problem 1 — ShopEasy (E-Commerce Security Audit)

## Vulnerabilities
- Negative prices shown in results → missing server-side validation, weak query filtering.
- Admin access bypass → missing RBAC checks or trusting client flags.
- Search crashes on special chars → unsafe regex construction, unbounded input.
- Review pop-ups/redirects → stored XSS.
- Sessions expire too quickly + stored in memory → poor session config + non-scalable store.

## Threat Modeling (examples)
- **Stored XSS in reviews**: attacker submits `<script>`/event handlers; impacts account takeover, payment fraud.
- **AuthZ bypass**: attacker calls admin endpoints directly; impacts data exposure and inventory manipulation.
- **Regex DOS/crash**: attacker sends `(`, `.*` etc; impacts availability.
- **Session storage in memory**: multi-server breaks sessions; impacts reliability and security (sticky sessions).

## Implementation (where)
- Sessions with MongoStore: [src/security/session.js](../../src/security/session.js)
- RBAC middleware: [src/modules/auth.js](../../src/modules/auth.js)
- Injection-safe search + regex escaping: [src/modules/products.js](../../src/modules/products.js)
- Review sanitization (XSS allowlist): [src/modules/reviews.js](../../src/modules/reviews.js)
- Helmet/CSP baseline: [src/security/helmet.js](../../src/security/helmet.js)
- Rate limiting: [src/security/rateLimit.js](../../src/security/rateLimit.js)

## Test Coverage
See [tests/security.test.js](../../tests/security.test.js)
