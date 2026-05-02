# Practice Problem 2 — ConnectHub (Social Media API Security)

## Key Issues
- Broken object-level authorization (BOLA) for private messages.
- XSS in posts/bios/comments.
- Weak validation for email.
- Profile picture URL abuse (open redirects / malicious links).
- Sessions never expire.

## Strategy
- Validate + sanitize all inputs at boundary (schema + sanitizers).
- Enforce object-level access checks on every read/write.
- Allow limited HTML formatting only via allowlist sanitizer.
- CORS allowlist for web/mobile clients.
- Session expiry policy (idle + absolute), secure cookies.

(Reference implementation uses the shared middleware in `src/security/*` and `zod` schemas.)
