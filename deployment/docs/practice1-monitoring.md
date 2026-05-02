# Practice 1 — Monitoring & Alerting

## Endpoints

- `GET /healthz` — liveness
- `GET /readyz` — readiness (Mongo ping)
- `GET /metrics` — Prometheus metrics
- `GET /dashboard` — simple in-app dashboard

## Prometheus

Example scrape config:

```yaml
scrape_configs:
  - job_name: tx-system
    static_configs:
      - targets:
          - "your-host:3000"
```

## Grafana

Import [monitoring/grafana-dashboard.json](monitoring/grafana-dashboard.json) and point it at your Prometheus datasource.

Key metrics:

- Request rate: `sum(rate(http_requests_total[1m]))`
- Error rate: `sum(rate(http_requests_total{status=~"5.."}[1m]))`
- p95 latency: `histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (le))`
- Transactions: `rate(transactions_accepted_total[1m])`

## Automated Health Checks (every 5 minutes)

- Run: `node scripts/healthcheck.js`
- Configure scheduler:
  - Heroku Scheduler (dev/staging): run every 10 minutes (closest option)
  - Windows Task Scheduler (prod) or cron: run every 5 minutes

Set:

- `HEALTHCHECK_BASE_URL` (e.g. `https://<app>.herokuapp.com`)
- Optional: `ALERT_WEBHOOK_URL`
