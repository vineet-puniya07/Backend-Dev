const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

function buildMongoRateLimiter({ mongoUri, windowMs, max, keyGenerator, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: message || { error: 'Too many requests' },
    store: new MongoStore({
      uri: mongoUri,
      expireTimeMs: windowMs,
      errorHandler: () => {},
    }),
  });
}

function buildRateLimiters({ mongoUri }) {
  const loginLimiter = buildMongoRateLimiter({
    mongoUri,
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many login attempts, try later' },
    keyGenerator: (req) => `${req.ip}:${(req.body && req.body.email) || ''}`,
  });

  const apiLimiter = buildMongoRateLimiter({
    mongoUri,
    windowMs: 60 * 1000,
    max: 120,
  });

  return { loginLimiter, apiLimiter };
}

module.exports = { buildRateLimiters };
