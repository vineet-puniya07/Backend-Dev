const http = require('http');

const { buildApp } = require('./app');
const { createLogger } = require('./logging/logger');
const { loadConfig } = require('./config');
const { createMongoManager } = require('./db/mongo');
const { createMetrics } = require('./metrics/metrics');

async function createServer() {
  const config = loadConfig();
  const logger = createLogger(config);
  const metrics = createMetrics();

  const mongo = createMongoManager({ config, logger });
  if (config.mongodb.connectOnStartup) {
    await mongo.connect();
  }

  const app = buildApp({ config, logger, mongo, metrics });
  const server = http.createServer(app);

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.warn({ signal }, 'shutdown requested');
    server.close(async () => {
      try {
        await mongo.close();
      } catch (err) {
        logger.error({ err }, 'mongo close failed');
      }
      logger.info('shutdown complete');
      process.exit(0);
    });

    // Force exit if hung
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return { server, app, logger, config, mongo, metrics };
}

module.exports = { createServer };
