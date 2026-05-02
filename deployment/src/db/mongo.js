const { MongoClient } = require('mongodb');

function createMongoManager({ config, logger }) {
  let client;

  async function connect() {
    if (client) return client;

    client = new MongoClient(config.mongodb.uri, {
      // Reasonable defaults; can be tuned per env.
      maxPoolSize: config.environment === 'production' ? 100 : 20,
      minPoolSize: config.environment === 'production' ? 10 : 0,
      serverSelectionTimeoutMS: 5_000,
      retryReads: true,
      retryWrites: true
    });

    await client.connect();
    logger.info({ db: config.mongodb.database }, 'mongo connected');
    return client;
  }

  function db() {
    if (!client) {
      throw new Error('Mongo client not connected. Call connect() first.');
    }
    return client.db(config.mongodb.database);
  }

  async function ping() {
    const c = client || (await connect());
    await c.db(config.mongodb.database).command({ ping: 1 });
  }

  async function close() {
    if (!client) return;
    await client.close();
    client = undefined;
  }

  return {
    connect,
    db,
    ping,
    close
  };
}

module.exports = { createMongoManager };
