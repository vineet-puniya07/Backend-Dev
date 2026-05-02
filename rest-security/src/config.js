require('dotenv').config();

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI || null,
  sessionSecret: process.env.SESSION_SECRET || 'dev-insecure-secret',
  trustProxy: process.env.TRUST_PROXY === 'true',
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
};

module.exports = { config, requiredEnv };
