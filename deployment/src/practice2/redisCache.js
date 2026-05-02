const Redis = require('ioredis');

function createRedisClient({ url }) {
  if (!url) {
    throw new Error('REDIS_URL is required to enable Redis cache');
  }

  return new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: true
  });
}

async function withCache({ redis, key, ttlSeconds, fetcher }) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const value = await fetcher();
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  return value;
}

module.exports = { createRedisClient, withCache };
