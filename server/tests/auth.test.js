/**
 * Authentication API Tests
 */

const request = require('supertest');
const { app, createUser } = require('./helpers');

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Kasun', email: 'Kasun@Test.com', password: 'secret123', role: 'owner' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('kasun@test.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('refuses the admin role at signup', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Eve', email: 'eve@test.com', password: 'secret123', role: 'admin' });

    expect(res.status).toBe(400);
  });

  it('rejects an invalid email and short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bad', email: 'nope', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.errors.map((error) => error.field)).toEqual(expect.arrayContaining(['email', 'password']));
  });

  it('rejects a duplicate email', async () => {
    const body = { name: 'Kasun', email: 'dup@test.com', password: 'secret123' };
    await request(app).post('/api/auth/register').send(body);

    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Kasun', email: 'login@test.com', password: 'secret123' });
  });

  it('logs in with the right password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects the wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'wrong123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('needs a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the logged-in user', async () => {
    const { token, user } = await createUser();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user._id).toBe(user._id);
  });
});

describe('error handling', () => {
  it('answers malformed JSON with a 400, not a 500', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{not json');
    expect(res.status).toBe(400);
  });
});
