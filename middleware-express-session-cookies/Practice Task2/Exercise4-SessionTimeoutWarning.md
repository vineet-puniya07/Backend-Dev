# Exercise 4: Session Timeout Warning

This pattern stores the last activity timestamp in the session and warns the user before expiry.

```js
const express = require('express');
const session = require('express-session');

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 10 },
  })
);

const WARNING_WINDOW_MS = 1000 * 60 * 2;

app.use((req, res, next) => {
  if (req.session) {
    req.session.lastSeenAt = Date.now();
  }
  next();
});

app.get('/session-status', (req, res) => {
  if (!req.session.lastSeenAt) {
    return res.json({ active: false });
  }

  const expiresAt = req.session.lastSeenAt + 1000 * 60 * 10;
  const remainingMs = expiresAt - Date.now();

  res.json({
    active: remainingMs > 0,
    warning: remainingMs > 0 && remainingMs <= WARNING_WINDOW_MS,
    remainingSeconds: Math.max(0, Math.floor(remainingMs / 1000)),
  });
});

app.get('/dashboard', (req, res) => {
  res.send('Dashboard content');
});

app.listen(3000);
```

## Notes

- The frontend can poll `/session-status` and show a countdown or warning banner.
- Session expiry is still enforced by the server cookie configuration.
