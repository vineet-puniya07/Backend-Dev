const CircuitBreaker = require('opossum');

function createCircuitBreaker(action, { timeoutMs = 2000, errorThresholdPercentage = 50, resetTimeoutMs = 10000 } = {}) {
  return new CircuitBreaker(action, {
    timeout: timeoutMs,
    errorThresholdPercentage,
    resetTimeout: resetTimeoutMs
  });
}

module.exports = { createCircuitBreaker };
