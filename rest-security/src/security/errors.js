function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Avoid leaking internals in prod; in dev it's useful.
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const status = err.statusCode || 500;
  res.status(status).json({ error: isProd ? 'Internal server error' : (err.message || 'Internal server error') });
}

module.exports = { notFound, errorHandler };
