const express = require('express');

function buildHealthRouter({ config, mongo }) {
  const router = express.Router();

  router.get('/healthz', (req, res) => {
    // Liveness: process is up.
    res.status(200).json({ status: 'ok', env: config.environment });
  });

  router.get('/readyz', async (req, res) => {
    // Readiness: dependencies reachable.
    try {
      await mongo.ping();
      res.status(200).json({ status: 'ready', env: config.environment });
    } catch (err) {
      res.status(503).json({ status: 'not_ready', env: config.environment });
    }
  });

  return router;
}

module.exports = { buildHealthRouter };
