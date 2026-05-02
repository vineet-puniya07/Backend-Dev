const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret';

const users = [];
// Store refresh tokens by jti (recommended over storing full tokens)
const refreshTokenAllowlist = new Map(); // jti -> { userId, expiresAt }

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { sub: user.id, jti },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  refreshTokenAllowlist.set(jti, { userId: user.id, expiresAt });

  return token;
}

function authenticateAccessToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing access token' });
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.auth = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  const errors = [];
  if (!email || typeof email !== 'string') errors.push('email is required');
  if (!password || typeof password !== 'string') errors.push('password is required');
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return res.status(200).json({ accessToken, refreshToken });
});

app.post('/token/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(400).json({ message: 'Validation failed', errors: ['refreshToken is required'] });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);

    const entry = refreshTokenAllowlist.get(payload.jti);
    if (!entry) {
      return res.status(401).json({ message: 'Refresh token is invalidated' });
    }

    if (entry.expiresAt < Date.now()) {
      refreshTokenAllowlist.delete(payload.jti);
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    const user = users.find((u) => u.id === entry.userId);
    if (!user) {
      refreshTokenAllowlist.delete(payload.jti);
      return res.status(401).json({ message: 'Refresh token is invalid' });
    }

    const accessToken = generateAccessToken(user);
    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

app.post('/logout', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(400).json({ message: 'Validation failed', errors: ['refreshToken is required'] });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    refreshTokenAllowlist.delete(payload.jti);
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    // Even if token is invalid, we respond OK to avoid leaking token validity.
    return res.status(200).json({ message: 'Logged out' });
  }
});

app.get('/protected', authenticateAccessToken, (req, res) => {
  return res.status(200).json({ message: 'Protected data', auth: req.auth });
});

(async () => {
  // Seed a demo user:
  // email: demo@example.com
  // password: SecurePass123!
  const passwordHash = await bcrypt.hash('SecurePass123!', 10);
  users.push({
    id: 'demo-user',
    email: 'demo@example.com',
    passwordHash
  });

  app.listen(PORT, () => {
    console.log(`Problem 4 server listening on http://localhost:${PORT}`);
    console.log('Demo login: demo@example.com / SecurePass123!');
  });
})();
