const helmet = require('helmet');

function buildHelmet({ isProd }) {
  // CSP is strict by default; adjust allowed domains per deployment.
  const contentSecurityPolicy = {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "frame-ancestors": ["'none'"],
      "object-src": ["'none'"],
      "img-src": ["'self'", 'data:', 'https:'],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "connect-src": ["'self'", 'https:'],
      "frame-src": ["'self'", 'https://www.youtube-nocookie.com', 'https://www.youtube.com'],
      // payment gateways and analytics often require additional entries.
    },
    reportOnly: false,
  };

  return helmet({
    contentSecurityPolicy,
    crossOriginEmbedderPolicy: false, // often breaks third-party embeds
    referrerPolicy: { policy: 'no-referrer' },
    hsts: isProd,
  });
}

module.exports = { buildHelmet };
