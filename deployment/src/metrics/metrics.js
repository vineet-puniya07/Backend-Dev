const client = require('prom-client');

function createMetrics() {
  const registry = new client.Registry();
  client.collectDefaultMetrics({ register: registry });

  const httpRequestDurationMs = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'HTTP request duration in ms',
    labelNames: ['method', 'route', 'status'],
    buckets: [5, 10, 25, 50, 100, 200, 400, 1000, 2000]
  });

  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status']
  });

  const transactionsAcceptedTotal = new client.Counter({
    name: 'transactions_accepted_total',
    help: 'Total accepted transactions'
  });

  registry.registerMetric(httpRequestDurationMs);
  registry.registerMetric(httpRequestsTotal);
  registry.registerMetric(transactionsAcceptedTotal);

  return {
    registry,
    httpRequestDurationMs,
    httpRequestsTotal,
    transactionsAcceptedTotal
  };
}

module.exports = { createMetrics };
