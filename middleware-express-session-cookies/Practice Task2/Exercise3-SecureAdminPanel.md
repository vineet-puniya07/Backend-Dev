# Exercise 3: Secure Admin Panel

This example uses session-based authentication and role checks to protect admin routes.

```js
const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).send('Please log in');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.session.user.role !== 'admin') {
    return res.status(403).send('Admin access required');
  }
  next();
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    req.session.user = { username, role: 'admin' };
    return res.redirect('/admin');
  }

  if (username === 'user' && password === 'user123') {
    req.session.user = { username, role: 'user' };
    return res.send('Logged in as regular user');
  }

  res.status(401).send('Invalid credentials');
});

app.get('/admin', requireAuth, requireAdmin, (req, res) => {
  res.send(`Admin panel for ${req.session.user.username}`);
});

app.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.send('Logged out');
  });
});

app.listen(3000);
```

## Notes

- Authentication lives in the session, so the user stays logged in until the session expires or is destroyed.
- Role-based access control keeps admin-only actions separated from normal user routes.
