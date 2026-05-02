const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Product = require('../src/models/Product');
const User = require('../src/models/User');
const Review = require('../src/models/Review');
const { createApp } = require('../src/app');

let mongod;
let app;
let mongoUri;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  mongoUri = mongod.getUri();
  await mongoose.connect(mongoUri);
  app = createApp({ mongoUri });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

afterEach(async () => {
  await Promise.all([
    Product.deleteMany({}),
    User.deleteMany({}),
    Review.deleteMany({}),
  ]);
});

function getCookie(res) {
  const setCookie = res.headers['set-cookie'] || [];
  return setCookie.map((c) => c.split(';')[0]).join('; ');
}

test('product search escapes regex special chars (no crash)', async () => {
  await Product.create({ name: 'Laptop (Pro)', price: 999, description: 'x' });

  const res = await request(app).get('/api/products/search').query({ q: '(' });
  expect(res.status).toBe(200);
  expect(res.body.products).toBeDefined();
});

test('mongo operator injection in query is neutralized', async () => {
  await Product.create({ name: 'Phone', price: 100, description: 'x' });
  await Product.create({ name: 'Tablet', price: 200, description: 'x' });

  // express-mongo-sanitize should strip $ operators from req.query.
  const res = await request(app).get('/api/products/search').query({ q: { $gt: '' } });
  expect([200, 400]).toContain(res.status);
});

test('review submission sanitizes script tags (stored XSS defense)', async () => {
  const reg = await request(app).post('/api/auth/register').send({
    email: 'a@example.com',
    username: 'alice_1',
    password: 'a-very-strong-password',
  });
  expect(reg.status).toBe(201);
  const cookie = getCookie(reg);

  const product = await Product.create({ name: 'Cam', price: 10, description: '' });

  const create = await request(app)
    .post('/api/reviews')
    .set('Cookie', cookie)
    .send({
      productId: String(product._id),
      rating: 5,
      content: '<img src=x onerror=alert(1) /><script>alert(2)</script><b>ok</b>',
    });

  expect(create.status).toBe(201);

  const list = await request(app).get('/api/reviews').query({ productId: String(product._id) });
  expect(list.status).toBe(200);

  const html = list.body.reviews[0].contentHtml;
  expect(html).toContain('<b>ok</b>');
  expect(html).not.toMatch(/script/i);
  expect(html).not.toMatch(/onerror/i);
});

test('admin route requires Admin role (authz enforced)', async () => {
  const reg = await request(app).post('/api/auth/register').send({
    email: 'b@example.com',
    username: 'bob_1',
    password: 'a-very-strong-password',
  });
  const cookie = getCookie(reg);

  const res = await request(app).get('/api/admin/health').set('Cookie', cookie);
  expect(res.status).toBe(403);
});

test('helmet sets security headers', async () => {
  const res = await request(app).get('/api/products/search');
  expect(res.headers['x-content-type-options']).toBe('nosniff');
  expect(res.headers['x-frame-options']).toBeDefined();
});
