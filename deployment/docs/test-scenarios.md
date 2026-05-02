# Test Scenarios

## Practice 1

### 1) Deploy to all three environments simultaneously

- Dev: run `scripts/deploy-dev.ps1`
- Staging: run `scripts/deploy-staging.ps1` (with ApprovalId)
- Prod: run `scripts/deploy-prod-iis.ps1` (with QaSignoffId; maintenance window enforced)

Verify in each environment:

- `/healthz` returns 200
- `/readyz` returns 200
- `/dashboard` loads

### 2) Verify environment isolation

- Ensure each environment uses a different Atlas cluster and DB:
  - `MONGODB_URI` differs per environment
  - `MONGODB_DB` differs per environment

Validation approach:

- Write a marker document into dev DB and confirm it does not exist in staging/prod.

### 3) Simulate production DB failure and verify automatic alert

- Temporarily break production `MONGODB_URI` (or block outbound to Atlas).
- Confirm:
  - `/readyz` returns 503
  - healthcheck job fails and triggers webhook (if `ALERT_WEBHOOK_URL` configured)

## Practice 2

### 1) Load test at 100,000 req/min

- Run `k6 run loadtests/peak-100k.js` (tune stages for your runner capacity).
- Verify autoscaling triggers and p95 remains within target.

### 2) Load test at 500,000 req/min

- Run `k6 run loadtests/peak-500k.js` using distributed runners.
- Verify system stability and scaling policies.

### 3) Simulate payment gateway failure

- Wrap payment calls in circuit breaker (`src/practice2/circuitBreaker.js`).
- When failing, enqueue orders (`src/practice2/orderQueue.js`) for later processing.

### 4) Inventory reservation during concurrent checkouts

- Validate DB atomic updates / transactions (implementation-specific).

### 5) Verify CDN serving 90%+ assets

- Confirm CDN cache headers and analytics.

### 6) Test cache hit rates

- Validate `> 80%` hit rate via Redis metrics and application instrumentation.
