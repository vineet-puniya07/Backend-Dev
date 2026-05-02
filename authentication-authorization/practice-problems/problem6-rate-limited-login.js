const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

const users = [];
const loginAttempts = new Map(); // email -> { count, firstAttemptAt, lockUntil }

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const LOCK_MS = 30 * 60 * 1000; // 30 minutes

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function checkLoginAttempts(email) {
  const key = normalizeEmail(email);
  const entry = loginAttempts.get(key);
  if (!entry) return { allowed: true };

  const now = Date.now();

  if (entry.lockUntil && entry.lockUntil > now) {
    return {
      allowed: false,
      locked: true,
      retryAfterMs: entry.lockUntil - now
    };
  }

  if (entry.firstAttemptAt && now - entry.firstAttemptAt > WINDOW_MS) {
    // Window expired; reset
    loginAttempts.delete(key);
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    // Safety: if count exceeded but lockUntil missing, lock now
    const lockUntil = now + LOCK_MS;
    entry.lockUntil = lockUntil;
    loginAttempts.set(key, entry);
    return {
      allowed: false,
      locked: true,
      retryAfterMs: lockUntil - now
    };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

function recordFailedAttempt(email) {
  const key = normalizeEmail(email);
  const now = Date.now();
  const entry = loginAttempts.get(key) || { count: 0, firstAttemptAt: now, lockUntil: null };

  if (now - entry.firstAttemptAt > WINDOW_MS) {
    entry.count = 0;
    entry.firstAttemptAt = now;
    entry.lockUntil = null;
  }

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockUntil = now + LOCK_MS;
  }

  loginAttempts.set(key, entry);
  return entry;
}

function clearAttempts(email) {
  const key = normalizeEmail(email);
  loginAttempts.delete(key);
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  const errors = [];
  if (!email || typeof email !== 'string') errors.push('email is required');
  if (!password || typeof password !== 'string') errors.push('password is required');
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const gate = checkLoginAttempts(email);
  if (!gate.allowed) {
    return res.status(423).json({
      message: 'Account locked due to too many failed attempts',
      retryAfterSeconds: Math.ceil(gate.retryAfterMs / 1000)
    });
  }

  const user = users.find((u) => u.email === normalizeEmail(email));
  if (!user) {
    recordFailedAttempt(email);
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const entry = recordFailedAttempt(email);

    if (entry.lockUntil && entry.lockUntil > Date.now()) {
      return res.status(423).json({
        message: 'Account locked due to too many failed attempts',
        retryAfterSeconds: Math.ceil((entry.lockUntil - Date.now()) / 1000)
      });
    }

    return res.status(401).json({
      message: 'Invalid credentials',
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - entry.count)
    });
  }

  clearAttempts(email);
  return res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email } });
});

(async () => {
  // Seed a demo user:
  // email: demo@example.com
  // password: SecurePass123!
  users.push({
    id: 'demo',
    email: 'demo@example.com',
    passwordHash: await bcrypt.hash('SecurePass123!', 10)
  });

  app.listen(PORT, () => {
    console.log(`Problem 6 server listening on http://localhost:${PORT}`);
    console.log('Demo login: demo@example.com / SecurePass123!');
  });
})();
