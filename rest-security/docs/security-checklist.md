# Production Security Checklist (Generic)

## Transport
- Enforce HTTPS end-to-end (TLS termination + secure internal hops).
- Set `trust proxy` correctly when behind a reverse proxy.

## Sessions & Cookies
- Store sessions in shared storage (MongoStore/Redis), not in-memory.
- Cookies: `HttpOnly`, `Secure` (prod), `SameSite=Lax/Strict`.
- Session expiry: set idle timeout + absolute timeout (document your policy).
- Rotate session ID on login (`req.session.regenerate`).

## Authentication
- Password hashing with bcrypt/argon2.
- Strong password policy (min length 12+, block common passwords).
- MFA for privileged roles and high-risk actions.
- Account lockout/backoff on repeated failures.

## Authorization
- Enforce object-level access checks (user can only access own resources).
- Use RBAC/ABAC middleware.

## Input Validation & Sanitization
- Validate request shapes (schema validation).
- Sanitize user-provided HTML (allowlist tags only).
- Prevent Mongo operator injection (strip `$` and `.` keys).

## Web Security Headers
- Helmet enabled.
- CSP tuned for CDN images, YouTube embeds, payment gateways.

## Rate Limiting
- Stricter limits on login/OTP/password reset.
- Global API abuse limits.
- Distributed store for rate limiter in multi-node deployments.

## Logging & Monitoring
- Centralized logs, structured format.
- Audit logs for sensitive reads/writes.
- Alerts for suspicious activity.

## Error Handling
- No stack traces or DB details in production responses.

## Dependencies & Secrets
- Use env vars/secret manager; never commit secrets.
- Regular dependency scanning.

## Backups & Recovery
- Automated DB backups, restore drills.
- Session store availability plan.
