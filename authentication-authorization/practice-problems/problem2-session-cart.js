const express = require('express');
const session = require('express-session');
const path = require('path');

const FileStoreFactory = require('session-file-store');

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'cart-secret';

const FileStore = FileStoreFactory(session);

app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, '..', '.data', 'problem2-sessions'),
      retries: 0
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (persists across browser restarts)
    }
  })
);

const initCart = (req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: {} };
  }
  next();
};

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

function calculateCart(cart) {
  const items = Object.values(cart.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, total };
}

app.post('/cart/add', initCart, (req, res) => {
  const { productId, name, price, quantity } = req.body || {};

  const errors = [];
  if (!productId || typeof productId !== 'string') errors.push('productId is required');
  if (!name || typeof name !== 'string') errors.push('name is required');
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
    errors.push('price must be a non-negative number');
  }

  const qty = parsePositiveInt(quantity ?? 1, 1);
  if (qty <= 0) errors.push('quantity must be a positive integer');

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const existing = req.session.cart.items[productId];
  if (existing) {
    existing.quantity += qty;
  } else {
    req.session.cart.items[productId] = {
      productId,
      name,
      price,
      quantity: qty
    };
  }

  const summary = calculateCart(req.session.cart);
  return res.status(200).json({ message: 'Item added', cart: summary });
});

app.put('/cart/update/:productId', initCart, (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body || {};

  const existing = req.session.cart.items[productId];
  if (!existing) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  const qty = parsePositiveInt(quantity, NaN);
  if (!Number.isFinite(qty) || qty < 0) {
    return res.status(400).json({ message: 'Validation failed', errors: ['quantity must be a non-negative integer'] });
  }

  if (qty === 0) {
    delete req.session.cart.items[productId];
  } else {
    existing.quantity = qty;
  }

  const summary = calculateCart(req.session.cart);
  return res.status(200).json({ message: 'Cart updated', cart: summary });
});

app.delete('/cart/remove/:productId', initCart, (req, res) => {
  const { productId } = req.params;

  const existing = req.session.cart.items[productId];
  if (!existing) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  delete req.session.cart.items[productId];
  const summary = calculateCart(req.session.cart);
  return res.status(200).json({ message: 'Item removed', cart: summary });
});

app.post('/cart/clear', initCart, (req, res) => {
  req.session.cart = { items: {} };
  return res.status(200).json({ message: 'Cart cleared', cart: { items: [], total: 0 } });
});

app.get('/cart', initCart, (req, res) => {
  const summary = calculateCart(req.session.cart);
  return res.status(200).json({ cart: summary });
});

app.listen(PORT, () => {
  console.log(`Problem 2 server listening on http://localhost:${PORT}`);
});
