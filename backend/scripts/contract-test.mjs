#!/usr/bin/env node
/**
 * 零依赖的接口契约测试：对一个正在运行的后端（任意模板）逐条验证 docs/API_CONTRACT.md。
 *
 *   node scripts/contract-test.mjs                       # 默认 http://localhost:9000
 *   BASE_URL=http://localhost:9100 node scripts/contract-test.mjs
 *
 * 会创建一个随机邮箱的测试用户；需要后端开启 SEED_DEMO_USER（admin 用例使用演示账号）。
 */
const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:9000').replace(/\/$/, '');
const API = `${BASE_URL}/api/v1`;
const DEMO = { email: 'demo@example.com', password: 'password123' };

let passed = 0;
const failures = [];

async function call(method, url, { body, token, cookie, headers = {} } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // keep null, assertions below will report it
  }
  return { status: res.status, headers: res.headers, json, text };
}

function refreshCookie(res) {
  const raw = res.headers.getSetCookie?.() ?? [res.headers.get('set-cookie') ?? ''];
  const line = raw.find((c) => c.startsWith('refresh_token='));
  return line ? { line, pair: line.split(';')[0] } : null;
}

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  ✗ ${name}\n      ${error.message}`);
  }
}

function expect(cond, message) {
  if (!cond) throw new Error(message);
}

function expectError(res, status, code) {
  expect(res.status === status, `expected HTTP ${status}, got ${res.status}: ${res.text}`);
  expect(res.json?.code === code, `expected code ${code}, got ${JSON.stringify(res.json)}`);
  expect(res.json && 'data' in res.json && res.json.data === null, 'error body must contain data: null');
  expect(typeof res.json.message === 'string', 'error body must contain message');
}

function expectOk(res, status = 200) {
  expect(res.status === status, `expected HTTP ${status}, got ${res.status}: ${res.text}`);
  expect(res.json?.code === 0, `expected code 0, got ${JSON.stringify(res.json)}`);
  expect(res.json.message === 'success', 'success message must be "success"');
  return res.json.data;
}

function expectUser(user) {
  for (const key of ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']) {
    expect(key in user, `user missing field ${key}: ${JSON.stringify(user)}`);
  }
  const leaked = Object.keys(user).filter((k) => /password/i.test(k));
  expect(leaked.length === 0, `user must not expose ${leaked.join(', ')}`);
}

const email = `contract-${Date.now()}@example.com`;
const ctx = {};

console.log(`Contract test against ${BASE_URL}\n`);

console.log('ops');
await check('GET /api/health', async () => {
  const res = await call('GET', `${BASE_URL}/api/health`, { headers: { 'x-request-id': 'contract-1' } });
  expect(expectOk(res).status === 'ok', 'data.status must be ok');
  expect(res.headers.get('x-request-id') === 'contract-1', 'X-Request-ID must be echoed');
});
await check('GET /api/ready', async () => {
  expect(expectOk(await call('GET', `${BASE_URL}/api/ready`)).status === 'ready', 'not ready');
});
await check('unknown route -> 404 NOT_FOUND', async () => {
  expectError(await call('GET', `${API}/definitely-not-here`), 404, 'NOT_FOUND');
});

console.log('auth');
await check('register validation -> 400 VALIDATION_ERROR', async () => {
  expectError(await call('POST', `${API}/auth/register`, { body: { email: 'bad', password: '1' } }), 400, 'VALIDATION_ERROR');
});
await check('malformed JSON -> 400 VALIDATION_ERROR', async () => {
  expectError(await call('POST', `${API}/auth/login`, { body: '{not json' }), 400, 'VALIDATION_ERROR');
});
await check('register -> 201 { user, accessToken } + HttpOnly cookie', async () => {
  const res = await call('POST', `${API}/auth/register`, {
    body: { name: ' Contract Tester ', email: ` ${email.toUpperCase()} `, password: 'password123' },
  });
  const data = expectOk(res, 201);
  expectUser(data.user);
  expect(data.user.email === email, `email must be normalized, got ${data.user.email}`);
  expect(data.user.name === 'Contract Tester', 'name must be trimmed');
  expect(data.user.role === 'user', 'new user role must be user');
  expect(typeof data.accessToken === 'string' && data.accessToken.length > 20, 'missing accessToken');
  const cookie = refreshCookie(res);
  expect(cookie, 'missing refresh_token cookie');
  expect(/httponly/i.test(cookie.line), 'refresh_token must be HttpOnly');
  expect(/path=\//i.test(cookie.line), 'refresh_token must have Path=/');
});
await check('register duplicate -> 409 EMAIL_EXISTS', async () => {
  expectError(await call('POST', `${API}/auth/register`, { body: { name: 'Dup', email, password: 'password123' } }), 409, 'EMAIL_EXISTS');
});
await check('login wrong password -> 401 INVALID_CREDENTIALS', async () => {
  expectError(await call('POST', `${API}/auth/login`, { body: { email, password: 'wrong-password' } }), 401, 'INVALID_CREDENTIALS');
});
await check('error message follows Accept-Language', async () => {
  const body = { email, password: 'wrong-password' };
  const zh = await call('POST', `${API}/auth/login`, { body, headers: { 'accept-language': 'zh-CN,zh;q=0.9' } });
  expect(zh.json?.message === '邮箱或密码错误', `zh message: ${zh.json?.message}`);
  const en = await call('POST', `${API}/auth/login`, { body, headers: { 'accept-language': 'en-US' } });
  expect(en.json?.message === 'Invalid email or password', `en message: ${en.json?.message}`);
});
await check('login -> 200 { user, accessToken } + cookie', async () => {
  const res = await call('POST', `${API}/auth/login`, { body: { email, password: 'password123' } });
  const data = expectOk(res);
  ctx.token = data.accessToken;
  ctx.cookie = refreshCookie(res)?.pair;
  expect(ctx.cookie, 'missing refresh_token cookie');
});
await check('me without token -> 401 UNAUTHORIZED', async () => {
  expectError(await call('GET', `${API}/auth/me`), 401, 'UNAUTHORIZED');
});
await check('me with garbage token -> 401 UNAUTHORIZED', async () => {
  expectError(await call('GET', `${API}/auth/me`, { token: 'not.a.jwt' }), 401, 'UNAUTHORIZED');
});
await check('me -> current user', async () => {
  const user = expectOk(await call('GET', `${API}/auth/me`, { token: ctx.token }));
  expectUser(user);
  expect(user.email === email, 'me returned another user');
});
await check('refresh with cookie -> new accessToken', async () => {
  const data = expectOk(await call('POST', `${API}/auth/refresh`, { cookie: ctx.cookie }));
  expect(data.user.email === email && typeof data.accessToken === 'string', 'bad refresh payload');
});
await check('session with cookie -> same as refresh', async () => {
  expectOk(await call('POST', `${API}/auth/session`, { cookie: ctx.cookie }));
});
await check('refresh without cookie -> 401 UNAUTHORIZED', async () => {
  expectError(await call('POST', `${API}/auth/refresh`), 401, 'UNAUTHORIZED');
});

console.log('users');
await check('list without token -> 401 UNAUTHORIZED', async () => {
  expectError(await call('GET', `${API}/users`), 401, 'UNAUTHORIZED');
});
await check('list -> pagination (default limit 10)', async () => {
  const data = expectOk(await call('GET', `${API}/users`, { token: ctx.token }));
  expect(Array.isArray(data.items), 'items must be an array');
  const p = data.pagination;
  expect(p.page === 1 && p.limit === 10, `bad pagination ${JSON.stringify(p)}`);
  expect(p.totalPages === Math.ceil(p.total / p.limit), 'totalPages mismatch');
  data.items.forEach(expectUser);
});
await check('list limit > 100 -> 400 VALIDATION_ERROR', async () => {
  expectError(await call('GET', `${API}/users?limit=1000`, { token: ctx.token }), 400, 'VALIDATION_ERROR');
});
await check('create as normal user -> 403 FORBIDDEN', async () => {
  const body = { name: 'Nope', email: `nope-${Date.now()}@example.com`, password: 'password123' };
  expectError(await call('POST', `${API}/users`, { token: ctx.token, body }), 403, 'FORBIDDEN');
});
await check('invalid id -> 400 VALIDATION_ERROR', async () => {
  expectError(await call('GET', `${API}/users/not-a-uuid`, { token: ctx.token }), 400, 'VALIDATION_ERROR');
});

console.log('admin (demo account)');
await check('login demo admin', async () => {
  const data = expectOk(await call('POST', `${API}/auth/login`, { body: DEMO }));
  expect(data.user.role === 'admin', 'demo user must be admin');
  ctx.admin = data.accessToken;
});
await check('admin CRUD', async () => {
  expect(ctx.admin, 'admin login failed (is SEED_DEMO_USER enabled?)');
  const token = ctx.admin;
  const created = expectOk(await call('POST', `${API}/users`, {
    token,
    body: { name: 'Crud User', email: `crud-${Date.now()}@example.com`, password: 'password123' },
  }), 201);
  expectUser(created);
  expect(created.role === 'user', 'default role must be user');
  const url = `${API}/users/${created.id}`;
  expect(expectOk(await call('GET', url, { token })).id === created.id, 'get returned wrong user');
  const updated = expectOk(await call('PUT', url, { token, body: { name: 'Crud Renamed', role: 'admin' } }));
  expect(updated.name === 'Crud Renamed' && updated.role === 'admin', 'update not applied');
  expectError(await call('PUT', url, { token, body: { email } }), 409, 'EMAIL_EXISTS');
  expectError(await call('PUT', url, { token, body: { role: 'root' } }), 400, 'VALIDATION_ERROR');
  expect(expectOk(await call('DELETE', url, { token })).id === created.id, 'delete must return { id }');
  expectError(await call('GET', url, { token }), 404, 'USER_NOT_FOUND');
});

console.log('logout');
await check('logout -> success + cookie cleared, old refresh token revoked', async () => {
  const res = await call('POST', `${API}/auth/logout`, { cookie: ctx.cookie });
  expect(expectOk(res).success === true, 'data.success must be true');
  const cookie = refreshCookie(res);
  expect(cookie && /max-age=0|expires=thu, 01 jan 1970/i.test(cookie.line), 'cookie must be cleared');
  expectError(await call('POST', `${API}/auth/refresh`, { cookie: ctx.cookie }), 401, 'UNAUTHORIZED');
});

console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
