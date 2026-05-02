const express = require('express');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'auth-secret';

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

const users = [
  { id: 'u1', email: 'user@example.com', role: 'user' },
  { id: 'm1', email: 'moderator@example.com', role: 'moderator' },
  { id: 'a1', email: 'admin@example.com', role: 'admin' }
];

const posts = [];

const ROLE_RANK = {
  user: 1,
  moderator: 2,
  admin: 3
};

const isAuthenticated = (req, res, next) => {
  const { userId } = req.session || {};
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    req.session.userId = undefined;
    return res.status(401).json({ message: 'Authentication required' });
  }

  req.user = user;
  next();
};

const requireRole = (role) => {
  return (req, res, next) => {
    const needed = ROLE_RANK[role];
    const actual = ROLE_RANK[req.user?.role];

    if (!needed || !actual) {
      return res.status(500).json({ message: 'Role configuration error' });
    }

    if (actual < needed) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    next();
  };
};

const isOwnerOrModerator = (req, res, next) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const rank = ROLE_RANK[req.user.role] || 0;
  const isModeratorOrAdmin = rank >= ROLE_RANK.moderator;

  if (post.authorId !== req.user.id && !isModeratorOrAdmin) {
    return res.status(403).json({ message: 'Forbidden: not owner' });
  }

  req.post = post;
  next();
};

app.post('/login', (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Validation failed', errors: ['email is required'] });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  return res.status(200).json({ message: 'Logged in', user: { id: user.id, email: user.email, role: user.role } });
});

app.post('/logout', isAuthenticated, (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: 'Logged out' });
  });
});

app.post('/posts', isAuthenticated, (req, res) => {
  const { title, content } = req.body || {};
  const errors = [];
  if (!title || typeof title !== 'string') errors.push('title is required');
  if (!content || typeof content !== 'string') errors.push('content is required');

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const post = {
    id: crypto.randomUUID(),
    authorId: req.user.id,
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  posts.push(post);
  return res.status(201).json({ message: 'Post created', post });
});

app.put('/posts/:id', isAuthenticated, isOwnerOrModerator, (req, res) => {
  const { title, content } = req.body || {};

  if (title !== undefined && typeof title !== 'string') {
    return res.status(400).json({ message: 'Validation failed', errors: ['title must be a string'] });
  }

  if (content !== undefined && typeof content !== 'string') {
    return res.status(400).json({ message: 'Validation failed', errors: ['content must be a string'] });
  }

  if (title !== undefined) req.post.title = title;
  if (content !== undefined) req.post.content = content;
  req.post.updatedAt = new Date().toISOString();

  return res.status(200).json({ message: 'Post updated', post: req.post });
});

app.delete('/posts/:id', isAuthenticated, requireRole('moderator'), (req, res) => {
  const idx = posts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const [deleted] = posts.splice(idx, 1);
  return res.status(200).json({ message: 'Post deleted', post: deleted });
});

app.get('/admin/users', isAuthenticated, requireRole('admin'), (req, res) => {
  return res.status(200).json({
    users: users.map((u) => ({ id: u.id, email: u.email, role: u.role }))
  });
});

app.put('/admin/users/:id/role', isAuthenticated, requireRole('admin'), (req, res) => {
  const { role } = req.body || {};
  if (!role || typeof role !== 'string' || !ROLE_RANK[role]) {
    return res.status(400).json({ message: 'Validation failed', errors: ['role must be one of: user, moderator, admin'] });
  }

  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.role = role;
  return res.status(200).json({ message: 'Role updated', user: { id: user.id, email: user.email, role: user.role } });
});

app.listen(PORT, () => {
  console.log(`Problem 3 server listening on http://localhost:${PORT}`);
  console.log('Login with one of: user@example.com, moderator@example.com, admin@example.com');
});
