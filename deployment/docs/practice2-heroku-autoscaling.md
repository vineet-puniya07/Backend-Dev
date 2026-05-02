# Practice 2 — Heroku Auto-Scaling Configuration

## What to configure

- Minimum dynos: keep warm (avoid cold start)
- Maximum dynos: cap for budget control
- Autoscaling signals:
  - p95 latency
  - request rate
  - error rate
  - queue depth (orders)

## Suggested policy

- Scale up when:
  - p95 > 1s for product page OR
  - p95 > 3s for checkout OR
  - queue depth rising for > 2 minutes

- Scale down when:
  - sustained low traffic for 15–30 minutes

## Notes

- Heroku autoscaling is plan-dependent and configured in Heroku UI or via platform features.
- Use Prometheus/Grafana to validate the scaling triggers.
