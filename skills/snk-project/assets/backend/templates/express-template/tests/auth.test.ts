import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, login } from './support/app.js';
import { resetMemory } from './support/memory.js';

const account = { name: 'Alice', email: 'alice@example.com', password: 'password123' };

describe('auth', () => {
  beforeEach(() => resetMemory());

  it('register returns session, normalizes input and sets HttpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...account, name: ' Alice ', email: ' ALICE@example.com ' });
    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({ name: 'Alice', email: account.email, role: 'user' });
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(String(res.headers['set-cookie'])).toMatch(/refresh_token=.+HttpOnly/);
  });

  it('rejects duplicate email and invalid input', async () => {
    await request(app).post('/api/v1/auth/register').send(account);
    const dup = await request(app).post('/api/v1/auth/register').send(account);
    expect(dup.status).toBe(409);
    expect(dup.body.code).toBe('EMAIL_EXISTS');

    const bad = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'x', password: '1' });
    expect(bad.status).toBe(400);
    expect(bad.body.details).toHaveProperty('email');
  });

  it('login / me / refresh / logout flow', async () => {
    await request(app).post('/api/v1/auth/register').send(account);

    const wrong = await login(account.email, 'wrong-password');
    expect(wrong.res.status).toBe(401);
    expect(wrong.res.body.code).toBe('INVALID_CREDENTIALS');

    const { token, cookie } = await login(account.email, account.password);
    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.body.data.email).toBe(account.email);

    const refreshed = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.accessToken).toEqual(expect.any(String));

    const out = await request(app).post('/api/v1/auth/logout').set('Cookie', cookie);
    expect(out.body.data).toEqual({ success: true });
    const again = await request(app).post('/api/v1/auth/session').set('Cookie', cookie);
    expect(again.status).toBe(401);
    expect(again.body.code).toBe('UNAUTHORIZED');
  });

  it('rejects missing or invalid access token', async () => {
    expect((await request(app).get('/api/v1/auth/me')).status).toBe(401);
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', 'Bearer nope');
    expect(res.body.code).toBe('UNAUTHORIZED');
  });
});
