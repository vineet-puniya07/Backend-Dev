function requestLogger({ logger, metrics }) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const durationNs = process.hrtime.bigint() - start;
      const durationMs = Number(durationNs) / 1e6;

      metrics.httpRequestDurationMs
        .labels(req.method, req.route?.path || req.path, String(res.statusCode))
        .observe(durationMs);

      metrics.httpRequestsTotal.labels(req.method, req.route?.path || req.path, String(res.statusCode)).inc(1);

      logger.log({
        level: res.statusCode >= 500 ? 'error' : 'info',
        message: 'request',
        requestId: req.context?.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs
      });
    });

    next();
  };
}

module.exports = { requestLogger };
