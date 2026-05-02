const express = require('express');
const compression = require('compression');
const helmet = require('helmet');

const { requestContext } = require('./middleware/requestContext');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');
const { buildHealthRouter } = require('./routes/health');
const { buildMetricsRouter } = require('./routes/metrics');
const { buildDashboardRouter } = require('./routes/dashboard');

function buildApp({ config, logger, mongo, metrics }) {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: false
    })
  );
  app.use(compression());

  app.use(express.json({ limit: '1mb' }));

  app.use(requestContext());
  app.use(requestLogger({ logger, metrics }));

  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'transaction-processing-system',
      environment: config.environment,
      version: config.appVersion
    });
  });

  app.use(buildHealthRouter({ config, mongo }));
  app.use(buildMetricsRouter({ metrics }));
  app.use(buildDashboardRouter({ config, metrics }));

  // Example placeholder for the transaction endpoint.
  app.post('/transactions', async (req, res) => {
    // In a real system, validate input, persist, and publish events.
    metrics.transactionsAcceptedTotal.inc(1);
    res.status(202).json({ accepted: true, requestId: req.context.requestId });
  });

  app.use(errorHandler({ logger }));
  return app;
}

module.exports = { buildApp };
