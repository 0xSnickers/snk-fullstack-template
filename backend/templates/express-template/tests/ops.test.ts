import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './support/app.js';

describe('ops endpoints', () => {
  it('GET /api/health echoes X-Request-ID', async () => {
    const res = await request(app).get('/api/health').set('X-Request-ID', 'abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ code: 0, message: 'success', data: { status: 'ok' } });
    expect(res.headers['x-request-id']).toBe('abc');
  });

  it('GET /api/ready', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.body.data).toEqual({ status: 'ready' });
  });

  it('unknown route returns NOT_FOUND with data: null', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'NOT_FOUND', data: null });
  });

  it('localizes error messages by Accept-Language', async () => {
    const zh = await request(app).get('/api/v1/nope').set('Accept-Language', 'zh-CN,zh;q=0.9');
    expect(zh.body.message).toBe('接口不存在');
    const en = await request(app).get('/api/v1/nope').set('Accept-Language', 'en-US');
    expect(en.body.message).toBe('Resource not found');
  });

  it('malformed JSON returns VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('content-type', 'application/json')
      .send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});
