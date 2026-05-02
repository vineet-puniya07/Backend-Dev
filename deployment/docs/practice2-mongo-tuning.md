# Practice 2 — MongoDB Atlas Performance Tuning

## Connection Pooling

- Use one shared client per process.
- Keep `maxPoolSize` bounded; avoid per-request connects.

## Indexing

- Ensure indexes for:
  - product lookup by SKU/slug
  - inventory reservation by (productId, status)
  - cart retrieval by (userId/sessionId)

## Peak Preparation

- Run load tests against staging with production-like data.
- Capture slow queries and add indexes before peak.

## Scaling

- Scale M60 -> M80 during peak.
- Validate read/write IOPS and connection limits.
