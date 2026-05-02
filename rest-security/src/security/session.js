const session = require('express-session');
const MongoStore = require('connect-mongo');

function buildSessionMiddleware({ mongoUri, sessionSecret, isProd }) {
  const cookie = {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 30, // 30 min
  };

  return session({
    name: 'sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      touchAfter: 60, // seconds
      stringify: false,
      crypto: isProd ? { secret: sessionSecret } : undefined,
    }),
  });
}

module.exports = { buildSessionMiddleware };
