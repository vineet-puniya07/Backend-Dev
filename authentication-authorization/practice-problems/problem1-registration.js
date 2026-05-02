const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const USERS_DB_PATH = path.join(__dirname, '..', '.data', 'problem1-users.json');

async function loadUsers() {
  try {
    const raw = await fs.readFile(USERS_DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err && err.code === 'ENOENT') return [];
    throw err;
  }
}

async function saveUsers(users) {
  await fs.writeFile(USERS_DB_PATH, JSON.stringify(users, null, 2), 'utf8');
}

function validatePassword(password) {
  const errors = [];

  if (typeof password !== 'string') {
    return { valid: false, errors: ['Password must be a string'] };
  }

  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  return { valid: errors.length === 0, errors };
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  // Simple practical check for training purposes.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    const validationErrors = [];
    if (!username || typeof username !== 'string') validationErrors.push('Username is required');
    if (!email || !isValidEmail(email)) validationErrors.push('Valid email is required');

    const pw = validatePassword(password);
    if (!pw.valid) validationErrors.push(...pw.errors);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const users = await loadUsers();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const duplicate = users.find(
      (u) => u.email === normalizedEmail || u.username === normalizedUsername
    );

    if (duplicate) {
      const reasons = [];
      if (duplicate.email === normalizedEmail) reasons.push('Email already registered');
      if (duplicate.username === normalizedUsername) reasons.push('Username already taken');

      return res.status(409).json({
        message: 'Duplicate registration',
        errors: reasons.length ? reasons : ['User already exists']
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: crypto.randomUUID(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await saveUsers(users);

    return res.status(201).json({
      message: 'User registered',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Problem 1 server listening on http://localhost:${PORT}`);
});
