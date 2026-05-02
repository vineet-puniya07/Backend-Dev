# Exercise 1: Multi-Step Form with Sessions

This example stores registration data in the session across multiple pages until the final submit.

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

app.get('/register/step-1', (req, res) => {
  res.send(`
    <form method="POST" action="/register/step-1">
      <input name="firstName" placeholder="First name" />
      <input name="lastName" placeholder="Last name" />
      <button type="submit">Next</button>
    </form>
  `);
});

app.post('/register/step-1', (req, res) => {
  req.session.registration = {
    ...(req.session.registration || {}),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };
  res.redirect('/register/step-2');
});

app.get('/register/step-2', (req, res) => {
  res.send(`
    <form method="POST" action="/register/step-2">
      <input name="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Next</button>
    </form>
  `);
});

app.post('/register/step-2', (req, res) => {
  req.session.registration = {
    ...(req.session.registration || {}),
    email: req.body.email,
    password: req.body.password,
  };
  res.redirect('/register/review');
});

app.get('/register/review', (req, res) => {
  res.json(req.session.registration || {});
});

app.post('/register/complete', (req, res) => {
  const data = req.session.registration;

  if (!data) {
    return res.status(400).json({ message: 'No registration data found in session' });
  }

  req.session.registration = null;
  res.json({ message: 'Registration complete', data });
});

app.listen(3000);
```

## Notes

- Session storage keeps the form state available across multiple requests.
- The final submit can persist the data to a database and then clear the session state.
