# Exercise 5: Anonymous vs Authenticated Cart

This example keeps anonymous carts in a cookie and authenticated carts in the session, then migrates the cart on login.

```js
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

function getAnonymousCart(req) {
  return req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
}

function saveAnonymousCart(req, res, cart) {
  res.cookie('cart', JSON.stringify(cart), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

function getAuthenticatedCart(req) {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  return req.session.cart;
}

app.post('/cart/add', (req, res) => {
  const item = req.body.item;

  if (req.session.user) {
    const cart = getAuthenticatedCart(req);
    cart.push(item);
    req.session.cart = cart;
    return res.json({ source: 'session', cart });
  }

  const cart = getAnonymousCart(req);
  cart.push(item);
  saveAnonymousCart(req, res, cart);
  res.json({ source: 'cookie', cart });
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  const anonymousCart = getAnonymousCart(req);

  req.session.user = { username };
  req.session.cart = [...anonymousCart, ...(req.session.cart || [])];
  res.clearCookie('cart');

  res.json({ message: 'Logged in', cart: req.session.cart });
});

app.get('/cart', (req, res) => {
  if (req.session.user) {
    return res.json({ source: 'session', cart: req.session.cart || [] });
  }

  res.json({ source: 'cookie', cart: getAnonymousCart(req) });
});

app.listen(3000);
```

## Notes

- Anonymous users get persistence through cookies.
- Logged-in users keep their cart in the session.
- On login, the cookie cart is merged into the session cart and the cookie is cleared.
