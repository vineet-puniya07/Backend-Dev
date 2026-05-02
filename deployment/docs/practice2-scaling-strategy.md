# Practice 2 — Scaling Strategy (Black Friday / Cyber Monday)

## Targets

- Normal: ~10,000 req/min
- Peak: ~500,000 req/min (50x)
- Zero downtime for 72 hours

## App Scaling (Heroku)

- Use Heroku autoscaling (Performance dynos / paid plans) with:
  - minimum dynos to cover baseline
  - max dynos capped to budget
- Scale on **custom metrics** (p95 latency, queue depth, error rate) instead of CPU only.

## Database Scaling (MongoDB Atlas)

- Start M60, scale to M80 during peak.
- Use connection pooling and keep pool sizes bounded.
- Pre-create required indexes and test them with peak-like queries.

## Cache

- Redis cache for:
  - product details
  - pricing
  - inventory reads
- Goal: > 80% cache hit rate for read-heavy endpoints.

## Queue

- Queue order submissions when payment gateway is degraded.
- Worker processes retry with backoff; dead-letter queue for manual review.

## External Services Resilience

- Circuit breaker for payment and search providers.
- Fallback behavior:
  - accept order intent, queue payment
  - show cached product pages

## Geo Distribution

- CDN for static assets, images.
- Consider multiple Heroku regions or edge caching depending on constraints.
