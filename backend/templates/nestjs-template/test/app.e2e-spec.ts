import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DEMO_USER } from '../src/modules/users/demo-user.seeder';
import { createTestApp, login } from './support/app';

describe('App (e2e, in-memory persistence)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());
  const alice = { name: 'Alice', email: 'alice@example.com', password: 'password123' };

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(() => app.close());

  describe('ops', () => {
    it('GET /api/health echoes X-Request-ID', async () => {
      const res = await http().get('/api/health').set('X-Request-ID', 'abc').expect(200);
      expect(res.body).toEqual({ code: 0, message: 'success', data: { status: 'ok' } });
      expect(res.headers['x-request-id']).toBe('abc');
    });

    it('unknown route -> NOT_FOUND with data: null', async () => {
      const res = await http().get('/api/v1/nope').expect(404);
      expect(res.body).toMatchObject({ code: 'NOT_FOUND', data: null });
    });

    it('localizes error messages by Accept-Language', async () => {
      const zh = await http().get('/api/v1/nope').set('Accept-Language', 'zh-CN');
      expect(zh.body.message).toBe('接口不存在');
      const en = await http().get('/api/v1/nope').set('Accept-Language', 'en-US');
      expect(en.body.message).toBe('Resource not found');
    });

    it('malformed JSON -> VALIDATION_ERROR', async () => {
      const res = await http()
        .post('/api/v1/auth/login')
        .set('content-type', 'application/json')
        .send('{bad');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('auth', () => {
    it('register normalizes input and sets HttpOnly cookie', async () => {
      const res = await http()
        .post('/api/v1/auth/register')
        .send({ ...alice, name: ' Alice ', email: ' ALICE@example.com ' })
        .expect(201);
      expect(res.body.data.user).toMatchObject({ name: 'Alice', email: alice.email, role: 'user' });
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      expect(String(res.headers['set-cookie'])).toMatch(/refresh_token=.+HttpOnly/);
    });

    it('rejects duplicate email and invalid input', async () => {
      expect((await http().post('/api/v1/auth/register').send(alice).expect(409)).body.code).toBe(
        'EMAIL_EXISTS',
      );
      const bad = await http()
        .post('/api/v1/auth/register')
        .send({ email: 'x', password: '1' })
        .expect(400);
      expect(bad.body.details).toHaveProperty('email');
    });

    it('login / me / refresh / logout flow', async () => {
      expect((await login(app, alice.email, 'wrong-password')).res.body.code).toBe(
        'INVALID_CREDENTIALS',
      );
      const { token, cookie } = await login(app, alice.email, alice.password);

      const me = await http()
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(me.body.data.email).toBe(alice.email);
      await http().post('/api/v1/auth/refresh').set('Cookie', cookie).expect(200);

      const out = await http().post('/api/v1/auth/logout').set('Cookie', cookie).expect(200);
      expect(out.body.data).toEqual({ success: true });
      const again = await http().post('/api/v1/auth/session').set('Cookie', cookie).expect(401);
      expect(again.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('users', () => {
    it('requires authentication and validates query/id', async () => {
      await http().get('/api/v1/users').expect(401);
      const { token } = await login(app, alice.email, alice.password);
      const auth = { Authorization: `Bearer ${token}` };
      const list = await http().get('/api/v1/users').set(auth).expect(200);
      expect(list.body.data.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
      await http().get('/api/v1/users?limit=1000').set(auth).expect(400);
      await http().get('/api/v1/users/not-a-uuid').set(auth).expect(400);
    });

    it('only admins can write', async () => {
      const member = (await login(app, alice.email, alice.password)).token;
      const body = { name: 'Carol', email: 'carol@example.com', password: 'password123' };
      const forbidden = await http()
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${member}`)
        .send(body);
      expect(forbidden.status).toBe(403);
      expect(forbidden.body.code).toBe('FORBIDDEN');

      const admin = {
        Authorization: `Bearer ${(await login(app, DEMO_USER.email, DEMO_USER.password)).token}`,
      };
      const created = await http().post('/api/v1/users').set(admin).send(body).expect(201);
      const url = `/api/v1/users/${created.body.data.id}`;
      expect(
        (await http().put(url).set(admin).send({ role: 'admin' }).expect(200)).body.data.role,
      ).toBe('admin');
      expect(
        (await http().put(url).set(admin).send({ email: alice.email }).expect(409)).body.code,
      ).toBe('EMAIL_EXISTS');
      await http().delete(url).set(admin).expect(200);
      expect((await http().get(url).set(admin).expect(404)).body.code).toBe('USER_NOT_FOUND');
    });
  });
});
