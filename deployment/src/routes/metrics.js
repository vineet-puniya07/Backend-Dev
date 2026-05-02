const express = require('express');

function buildMetricsRouter({ metrics }) {
  const router = express.Router();

  router.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', metrics.registry.contentType);
    res.status(200).send(await metrics.registry.metrics());
  });

  return router;
}

module.exports = { buildMetricsRouter };
