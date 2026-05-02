# Practice Problem 5 — QuickBank (Banking Transaction System)

## Key Issues
- Parameter tampering for transfer amount.
- Transaction search data exposure.
- Operator injection via account numbers.
- Unlimited sessions across devices.
- Unlimited login attempts.
- XSS in notification descriptions.
- Verbose errors.
- Non-expiring reusable password reset tokens.

## Strategy
- Server-side validation of amounts/limits + authorization.
- Strict user scoping on queries.
- Operator injection protection.
- Session/device controls (limit active sessions per user).
- Strong rate limiting and lockout policy.
- Sanitization of user-generated descriptions.
- Safe error handler.
- Single-use expiring reset tokens.
