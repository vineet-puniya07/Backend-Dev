# Exercise 2: Implement Multi-Factor Authentication

This middleware checks both a verified JWT and a one-time OTP code for sensitive routes.

```js
const jwt = require('jsonwebtoken');

function authenticateJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'JWT token is required' });
  }

  try {
    const token = authHeader.slice(7);
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired JWT token' });
  }
}

function verifyOtp(req, res, next) {
  const otp = req.headers['x-otp-code'] || req.body.otp;

  if (!otp) {
    return res.status(401).json({ message: 'OTP code is required' });
  }

  const isValidOtp = otp === req.user.expectedOtp;

  if (!isValidOtp) {
    return res.status(401).json({ message: 'Invalid OTP code' });
  }

  next();
}

function requireMfa(req, res, next) {
  authenticateJwt(req, res, (jwtError) => {
    if (jwtError) {
      return next(jwtError);
    }

    verifyOtp(req, res, next);
  });
}

module.exports = {
  authenticateJwt,
  verifyOtp,
  requireMfa,
};
```

Usage:

```js
const express = require('express');
const { requireMfa } = require('./mfa');

const app = express();
app.use(express.json());

app.post('/transfer-funds', requireMfa, (req, res) => {
  res.json({ message: 'Sensitive operation allowed' });
});
```

## Notes

- JWT verifies identity, and OTP verifies possession of the temporary code.
- In a real application, store OTPs server-side with an expiry instead of reading them from the JWT payload.
