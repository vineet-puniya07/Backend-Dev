# Practice 2 — Peak Incident Response Runbook

## Triggers

- Response time > 2s (critical)
- Error rate spike
- Payment gateway failures

## Actions

- Scale web dynos up (within budget cap).
- Inspect Redis hit rate; enable/extend caching TTLs.
- If payment gateway degraded:
  - enable circuit breaker
  - queue orders and communicate delayed processing

## Communications

- SEV-1: SMS alerts + exec comms
- Status page updates every 15 minutes

## Recovery

- After stability, scale down gradually.
- Capture timeline + key graphs for post-peak analysis.
