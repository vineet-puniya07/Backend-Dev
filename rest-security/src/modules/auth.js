const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');

const registerSchema = z.object({
  email: z.string().email().max(254),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(12).max(128),
});

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
  totp: z.string().optional(),
});

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

function requireRole(role) {
  return (req, res, next) => {
    const roles = (req.session && req.session.user && req.session.user.roles) || [];
    if (!roles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}

async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: body.email }).lean();
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({
      email: body.email,
      username: body.username,
      passwordHash,
      roles: ['User'],
    });

    req.session.user = { id: String(user._id), roles: user.roles };
    res.status(201).json({ id: String(user._id), email: user.email, username: user.username });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ email: body.email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.mfa && user.mfa.enabled) {
      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.mfa.totpSecret,
        encoding: 'base32',
        token: body.totp || '',
        window: 1,
      });
      if (!verified) return res.status(401).json({ error: 'MFA required' });
    }

    req.session.regenerate((regenErr) => {
      if (regenErr) return next(regenErr);
      req.session.user = { id: String(user._id), roles: user.roles };
      return res.json({ ok: true });
    });
  } catch (err) {
    return next(err);
  }
}

function logout(req, res) {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy(() => res.json({ ok: true }));
}

function me(req, res) {
  res.json({ user: (req.session && req.session.user) || null });
}

module.exports = { register, login, logout, me, requireAuth, requireRole };
