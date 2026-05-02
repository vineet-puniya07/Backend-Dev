function errorHandler({ logger }) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, next) => {
    logger.error({
      err,
      requestId: req.context?.requestId,
      path: req.originalUrl,
      method: req.method
    }, 'unhandled error');

    res.status(500).json({
      error: 'internal_error',
      requestId: req.context?.requestId
    });
  };
}

module.exports = { errorHandler };
