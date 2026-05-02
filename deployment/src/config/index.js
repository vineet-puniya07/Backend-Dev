const path = require('path');

const dotenv = require('dotenv');
const Joi = require('joi');

function loadDotenv(environment) {
  // Load in this order: base + environment-specific override.
  const basePath = path.resolve(process.cwd(), '.env');
  const envPath = path.resolve(process.cwd(), `.env.${environment}`);

  dotenv.config({ path: basePath });
  dotenv.config({ path: envPath, override: true });
}

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  APP_VERSION: Joi.string().default('0.0.0'),

  MONGODB_URI: Joi.string().uri().required(),
  MONGODB_DB: Joi.string().min(1).required(),
  MONGODB_CONNECT_ON_STARTUP: Joi.boolean().truthy('true').falsy('false').default(true),

  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').optional(),

  FEATURE_FLAGS: Joi.string().default('{}')
}).unknown(true);

function loadConfig() {
  const environment = process.env.NODE_ENV || 'development';
  loadDotenv(environment);

  const { value, error } = schema.validate(process.env, { abortEarly: false });
  if (error) {
    throw new Error(`Invalid environment configuration: ${error.message}`);
  }

  const defaultLogLevel =
    value.NODE_ENV === 'development' ? 'debug' : value.NODE_ENV === 'staging' ? 'info' : 'error';

  let featureFlags = {};
  try {
    featureFlags = JSON.parse(value.FEATURE_FLAGS);
  } catch {
    throw new Error('FEATURE_FLAGS must be valid JSON');
  }

  return {
    environment: value.NODE_ENV,
    port: value.PORT,
    appVersion: value.APP_VERSION,
    logging: {
      level: value.LOG_LEVEL || defaultLogLevel
    },
    mongodb: {
      uri: value.MONGODB_URI,
      database: value.MONGODB_DB,
      connectOnStartup: Boolean(value.MONGODB_CONNECT_ON_STARTUP)
    },
    featureFlags
  };
}

module.exports = { loadConfig };
