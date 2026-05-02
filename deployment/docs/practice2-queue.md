# Practice 2 — Message Queue for Order Processing

Code modules:

- `src/practice2/orderQueue.js`

Pattern:

- API accepts checkout request quickly and enqueues an order job.
- Worker attempts payment; if gateway fails, retries with backoff.
- Dead-letter queue for manual investigation.

This supports: "queue orders when payment gateway is down".
