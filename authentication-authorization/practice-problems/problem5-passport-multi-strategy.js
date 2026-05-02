const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'passport-secret';
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';

const users = [];

function findUserByUsername(username) {
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

function generateJwt(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user || false);
});

passport.use(
  'local',
  new LocalStrategy(
    { usernameField: 'username', passwordField: 'password', session: true },
    async (username, password, done) => {
      try {
        const user = findUserByUsername(username);
        if (!user) return done(null, false, { message: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return done(null, false, { message: 'Invalid credentials' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET
    },
    (payload, done) => {
      const user = users.find((u) => u.id === payload.sub);
      if (!user) return done(null, false);
      return done(null, user);
    }
  )
);

function ensureSessionAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Session authentication required' });
}

app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.status(200).json({
        message: 'Logged in with session',
        user: { id: user.id, username: user.username }
      });
    });
  })(req, res, next);
});

app.post('/auth/api-login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    }

    const token = generateJwt(user);
    return res.status(200).json({ token });
  })(req, res, next);
});

app.post('/auth/switch/:method', (req, res) => {
  const method = req.params.method;
  if (method !== 'session' && method !== 'jwt') {
    return res.status(400).json({ message: 'method must be session or jwt' });
  }

  req.session.preferredAuth = method;
  return res.status(200).json({ message: 'Auth method preference set', preferredAuth: method });
});

app.get('/dashboard', ensureSessionAuth, (req, res) => {
  return res.status(200).json({
    message: 'Dashboard (session protected)',
    user: { id: req.user.id, username: req.user.username }
  });
});

app.get('/api/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.status(200).json({
    message: 'Profile (JWT protected)',
    user: { id: req.user.id, username: req.user.username }
  });
});

app.use((err, req, res, next) => {
  // Minimal error handler
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

(async () => {
  // Seed a demo user:
  // username: john_doe
  // password: SecurePass123!
  users.push({
    id: 'u1',
    username: 'john_doe',
    passwordHash: await bcrypt.hash('SecurePass123!', 10)
  });

  app.listen(PORT, () => {
    console.log(`Problem 5 server listening on http://localhost:${PORT}`);
    console.log('Demo login: john_doe / SecurePass123!');
  });
})();
