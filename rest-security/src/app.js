const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const { config } = require('./config');
const { buildHelmet } = require('./security/helmet');
const { buildSessionMiddleware } = require('./security/session');
const { buildRateLimiters } = require('./security/rateLimit');
const { mongoInjectionProtection } = require('./security/sanitize');
const { notFound, errorHandler } = require('./security/errors');
const auth = require('./modules/auth');
const products = require('./modules/products');
const reviews = require('./modules/reviews');

function buildCors() {
  const allowlist = config.corsOrigins;
  return cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowlist.length === 0) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error('CORS blocked'));
    },
    credentials: true,
  });
}

function createApp({ mongoUri }) {
  const app = express();
  const isProd = config.env === 'production';

  if (config.trustProxy) app.set('trust proxy', 1);

  app.use(morgan('combined'));
  app.use(buildHelmet({ isProd }));
  app.use(buildCors());

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // Prevent $ and . operator injection in any incoming payload.
  app.use(mongoInjectionProtection());

  app.use(buildSessionMiddleware({ mongoUri, sessionSecret: config.sessionSecret, isProd }));

  const { loginLimiter, apiLimiter } = buildRateLimiters({ mongoUri });
  app.use('/api/', apiLimiter);

  // Auth
  app.post('/api/auth/register', auth.register);
  app.post('/api/auth/login', loginLimiter, auth.login);
  app.post('/api/auth/logout', auth.logout);
  app.get('/api/auth/me', auth.me);

  // ShopEasy-ish
  app.get('/api/products/search', products.search);
  app.post('/api/reviews', auth.requireAuth, reviews.createReview);
  app.get('/api/reviews', reviews.listReviews);

  // Admin example (RBAC)
  app.get('/api/admin/health', auth.requireAuth, auth.requireRole('Admin'), (req, res) => res.json({ ok: true }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
