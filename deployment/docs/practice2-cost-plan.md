# Practice 2 — Cost Projection & Optimization Plan

## Budget

- Cap: $50,000 for 72 hours.

## Major Cost Drivers

- Heroku dynos (scale up to 500)
- MongoDB Atlas M60/M80
- CDN bandwidth
- Redis cache tier
- Message queue / add-ons

## Controls

- Hard cap autoscaling max dynos.
- Scale down immediately post-peak (scheduled policy).
- Use caching to reduce DB load.
- Use queue to smooth bursts instead of overprovisioning.

## Tracking

- Review cost dashboards hourly during peak.
- Alert when forecasted spend exceeds budget threshold.
