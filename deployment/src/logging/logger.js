const winston = require('winston');

function createLogger(config) {
  const level = config?.logging?.level || 'info';

  const logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [new winston.transports.Console()]
  });

  return logger;
}

module.exports = { createLogger };
