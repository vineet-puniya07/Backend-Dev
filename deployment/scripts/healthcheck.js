// Simple health check runner intended for schedulers (every 5 minutes).
// Exits non-zero on failure; optionally posts to a webhook.

const http = require('http');
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const lib = isHttps ? https : http;
    const req = lib.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, json });
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

async function postWebhook(webhookUrl, payload) {
  if (!webhookUrl) return;

  const isHttps = webhookUrl.startsWith('https://');
  const lib = isHttps ? https : http;
  const data = Buffer.from(JSON.stringify(payload));

  await new Promise((resolve, reject) => {
    const req = lib.request(
      webhookUrl,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': data.length
        }
      },
      (res) => {
        res.resume();
        res.on('end', resolve);
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const baseUrl = process.env.HEALTHCHECK_BASE_URL || 'http://localhost:3000';
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;

  const endpoints = [`${baseUrl}/healthz`, `${baseUrl}/readyz`];

  try {
    for (const url of endpoints) {
      const { statusCode } = await fetchJson(url);
      if (statusCode < 200 || statusCode >= 300) {
        throw new Error(`Healthcheck failed: ${url} status=${statusCode}`);
      }
    }

    process.stdout.write(`OK ${new Date().toISOString()} ${baseUrl}\n`);
    process.exit(0);
  } catch (err) {
    const msg = `FAIL ${new Date().toISOString()} ${baseUrl} ${err.message}`;
    process.stderr.write(`${msg}\n`);

    await postWebhook(webhookUrl, {
      severity: 'critical',
      message: msg,
      baseUrl,
      ts: new Date().toISOString()
    }).catch(() => undefined);

    process.exit(2);
  }
}

main();
