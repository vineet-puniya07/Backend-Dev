# Practice 1 — Incident Response Plan

## Severity Levels

- **SEV-1**: Production down, security event, or widespread transaction failures.
- **SEV-2**: Degraded performance (p95 > 200ms), intermittent errors.
- **SEV-3**: Minor issue, workaround exists.

## Detection

- Automated health checks (every 5 minutes) hit `/readyz`.
- Metrics endpoint `/metrics` scraped by Prometheus.
- Alerts:
  - Service down (healthcheck failure)
  - Error rate spike (5xx)
  - Latency regression (p95)

## Triage Checklist (first 5 minutes)

- Confirm scope: dev / staging / production.
- Check `/dashboard` and `/metrics`.
- Check recent deployments in `audit/deployments.log`.
- Validate MongoDB Atlas status + connection errors.

## Containment / Mitigation

- If deployment-related: execute rollback (see `docs/practice1-rollback.md`).
- If MongoDB failure:
  - Fail readiness (`/readyz` should return 503)
  - Switch to backup/secondary plan per your Atlas setup

## Communications

- Establish an incident channel and a single incident commander.
- For SEV-1, notify stakeholders immediately.

## Post-Incident

- Write a brief postmortem:
  - Timeline
  - Root cause
  - Fix + preventive actions
  - Follow-up owners and dates
