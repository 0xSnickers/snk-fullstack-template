import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, DEMO_USER, login, seedDemoUser } from './support/app.js';
import { resetMemory } from './support/memory.js';

describe('users', () => {
  let admin: string;
  let member: string;

  beforeEach(async () => {
    resetMemory();
    await seedDemoUser();
    admin = (await login(DEMO_USER.email, DEMO_USER.password)).token;
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: 'password123' });
    member = (await login('bob@example.com', 'password123')).token;
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });

  it('lists users with default pagination', async () => {
    const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${member}`);
    expect(res.body.data.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
    expect(res.body.data.items[0]).not.toHaveProperty('passwordHash');
  });

  it('validates query and id', async () => {
    const auth = { Authorization: `Bearer ${member}` };
    expect((await request(app).get('/api/v1/users?limit=1000').set(auth)).status).toBe(400);
    expect((await request(app).get('/api/v1/users/not-a-uuid').set(auth)).status).toBe(400);
  });

  it('only admins can write', async () => {
    const body = { name: 'Carol', email: 'carol@example.com', password: 'password123' };
    const forbidden = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${member}`)
      .send(body);
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.code).toBe('FORBIDDEN');

    const auth = { Authorization: `Bearer ${admin}` };
    const created = await request(app).post('/api/v1/users').set(auth).send(body);
    expect(created.status).toBe(201);
    const url = `/api/v1/users/${created.body.data.id}`;

    const updated = await request(app).put(url).set(auth).send({ role: 'admin' });
    expect(updated.body.data.role).toBe('admin');

    const conflict = await request(app).put(url).set(auth).send({ email: 'bob@example.com' });
    expect(conflict.body.code).toBe('EMAIL_EXISTS');

    expect((await request(app).delete(url).set(auth)).body.data).toEqual({
      id: created.body.data.id,
    });
    const gone = await request(app).get(url).set(auth);
    expect(gone.status).toBe(404);
    expect(gone.body.code).toBe('USER_NOT_FOUND');
  });
});
