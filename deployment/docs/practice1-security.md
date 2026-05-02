# Practice 1 — Security & Compliance Notes

## TLS in Transit (Production)

- IIS production site must have an **HTTPS binding** with a valid certificate.
- [web.config](web.config) enforces HTTPS redirect and sets HSTS.

## Encryption at Rest

- MongoDB Atlas encrypts storage at rest by default.
- Use a dedicated **production** cluster for production data.

## Secrets Management

- Do not store real secrets in repo files.
- Store secrets as environment variables:
  - Heroku config vars (dev/staging)
  - IIS App Pool / machine environment variables (prod)

## Audit Logs (Deployments)

- Deployment/rollback scripts append JSON lines to `audit/deployments.log`.
- Production deployments require a `QaSignoffId`.
- Staging deployments require an `ApprovalId`.

## Health Monitoring

- Use `scripts/healthcheck.js` scheduled every 5 minutes.
- Configure `ALERT_WEBHOOK_URL` to push down alerts into your alerting system.
