const express = require('express');

function buildDashboardRouter({ config, metrics }) {
  const router = express.Router();

  router.get('/status', async (req, res) => {
    const mem = process.memoryUsage();
    const uptimeSec = process.uptime();

    res.status(200).json({
      env: config.environment,
      version: config.appVersion,
      uptimeSec,
      memory: {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal
      }
    });
  });

  router.get('/dashboard', (req, res) => {
    // Minimal dashboard for the deliverable (key metrics + status).
    res.status(200).type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Monitoring Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
    .k { color: #666; font-size: 12px; }
    .v { font-size: 18px; font-weight: 600; }
    code { background: #f6f6f6; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Monitoring Dashboard</h1>
  <p>Environment: <code>${config.environment}</code></p>

  <div class="grid">
    <div class="card"><div class="k">Version</div><div class="v" id="version">-</div></div>
    <div class="card"><div class="k">Uptime (sec)</div><div class="v" id="uptime">-</div></div>
    <div class="card"><div class="k">RSS (MB)</div><div class="v" id="rss">-</div></div>
    <div class="card"><div class="k">Heap Used (MB)</div><div class="v" id="heap">-</div></div>
  </div>

  <h2>Endpoints</h2>
  <ul>
    <li><code>GET /healthz</code> liveness</li>
    <li><code>GET /readyz</code> readiness (Mongo ping)</li>
    <li><code>GET /metrics</code> Prometheus format</li>
    <li><code>GET /status</code> JSON summary</li>
  </ul>

  <script>
    async function refresh() {
      const r = await fetch('/status');
      const s = await r.json();
      document.getElementById('version').textContent = s.version;
      document.getElementById('uptime').textContent = String(Math.round(s.uptimeSec));
      document.getElementById('rss').textContent = (s.memory.rss/1024/1024).toFixed(1);
      document.getElementById('heap').textContent = (s.memory.heapUsed/1024/1024).toFixed(1);
    }
    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>`);
  });

  return router;
}

module.exports = { buildDashboardRouter };
