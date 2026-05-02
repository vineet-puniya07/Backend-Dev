# Exercise 5: Build a Data Sanitization Middleware

This Express middleware sanitizes incoming data to reduce XSS risk and strip common SQL-injection-style payloads. It is a defense-in-depth layer, not a replacement for parameterized database queries.

```js
function sanitizeString(value) {
  return value
    .replace(/<script.*?>.*?<\/script>/gis, '')
    .replace(/<[^>]*>/g, '')
    .replace(/['"\\;]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*.*?\*\//gs, '')
    .trim();
}

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)])
    );
  }

  return value;
}

function sanitizeRequest(req, res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
}

module.exports = sanitizeRequest;
```

Usage:

```js
const express = require('express');
const sanitizeRequest = require('./sanitizeRequest');

const app = express();

app.use(express.json());
app.use(sanitizeRequest);

app.post('/profile', (req, res) => {
  res.json({ safeInput: req.body });
});
```

## Notes

- The middleware recursively sanitizes nested request data.
- For database access, always use parameterized queries or Mongoose model APIs instead of string concatenation.
