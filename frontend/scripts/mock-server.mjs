#!/usr/bin/env node
/**
 * 零依赖的本地 Mock 后端，实现模板约定的鉴权和用户接口，方便在没有真实后端时开发和演示。
 *
 *   node scripts/mock-server.mjs            # 默认 http://localhost:9000/api/v1
 *   PORT=9100 ACCESS_TOKEN_TTL=30 node scripts/mock-server.mjs
 *
 * 预置账号：demo@example.com / password123
 *
 * 两种刷新凭证模式：
 *   - Web（默认）：刷新凭证写入 HttpOnly Cookie。
 *   - App（请求体带 clientType: 'native'）：刷新凭证在响应体 refreshToken 中返回，
 *     刷新 / 登出时通过请求体 { refreshToken } 传回。uni-app / React Native / Flutter 模板使用该模式。
 *
 * 接口（统一响应 { code, message, data }，code 为 0 表示成功）：
 *   POST /auth/register   { name, email, password, clientType? } -> { user, accessToken, refreshToken? }
 *   POST /auth/login      { email, password, clientType? }       -> { user, accessToken, refreshToken? }
 *   POST /auth/refresh    Cookie 或 { refreshToken }            -> { user, accessToken, refreshToken? }
 *   POST /auth/session    Cookie                                -> { user, accessToken }（Next.js BFF 使用）
 *   POST /auth/logout     Cookie 或 { refreshToken }            -> { success: true }
 *   GET  /auth/me         Bearer                    -> user
 *   GET  /users?page&limit Bearer                   -> { items, pagination }
 *
 * 已开启 CORS，App 的 H5 版本可以跨域直连。真机调试时把 localhost 换成电脑的局域网 IP，
 * Android 模拟器使用 10.0.2.2。
 */
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 9000);
const BASE_PATH = process.env.BASE_PATH ?? '/api/v1';
const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL ?? 15 * 60) * 1000;
const COOKIE_NAME = 'refresh_token';

const users = new Map();
const accounts = new Map(); // email -> { password, userId }
const refreshTokens = new Map(); // token -> userId
const accessTokens = new Map(); // token -> { userId, expiresAt }

function addUser({ name, email, password, role = 'user' }) {
  const user = { id: randomUUID(), name, email, role };
  users.set(user.id, user);
  accounts.set(email.toLowerCase(), { password, userId: user.id });
  return user;
}

addUser({ name: 'Demo User', email: 'demo@example.com', password: 'password123', role: 'admin' });
for (let i = 1; i <= 23; i++) {
  addUser({
    name: `User ${String(i).padStart(2, '0')}`,
    email: `user${i}@example.com`,
    password: 'password123',
  });
}

const send = (res, status, payload, headers = {}) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(payload));
};
const ok = (res, data, headers) => send(res, 200, { code: 0, message: 'success', data }, headers);
const fail = (res, status, code, message) => send(res, status, { code, message, data: null });

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function getCookie(req, name) {
  const cookie = req.headers.cookie ?? '';
  const match = cookie.split(/;\s*/).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

const isNative = (body) => body?.clientType === 'native';

/** App 模式：签发新的刷新凭证（旋转），随响应体返回。 */
function issueRefreshToken(userId) {
  const token = randomUUID();
  refreshTokens.set(token, userId);
  return token;
}

function issueSession(userId) {
  const accessToken = randomUUID();
  accessTokens.set(accessToken, { userId, expiresAt: Date.now() + ACCESS_TOKEN_TTL });
  return { user: users.get(userId), accessToken };
}

function setRefreshCookie(userId) {
  const token = randomUUID();
  refreshTokens.set(token, userId);
  return {
    'set-cookie': `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`,
  };
}

function authenticate(req) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const record = token ? accessTokens.get(token) : null;
  if (!record || record.expiresAt < Date.now()) return null;
  return users.get(record.userId) ?? null;
}

const routes = {
  'POST /auth/register': async (req, res) => {
    const body = await readBody(req);
    const { name, email, password } = body;
    if (!name || !email || !password || String(password).length < 8) {
      return fail(res, 400, 'VALIDATION_ERROR', '请填写姓名、邮箱，密码至少 8 位');
    }
    if (accounts.has(String(email).toLowerCase())) {
      return fail(res, 409, 'EMAIL_EXISTS', '该邮箱已注册');
    }
    const user = addUser({ name, email, password });
    return isNative(body)
      ? ok(res, { ...issueSession(user.id), refreshToken: issueRefreshToken(user.id) })
      : ok(res, issueSession(user.id), setRefreshCookie(user.id));
  },
  'POST /auth/login': async (req, res) => {
    const body = await readBody(req);
    const { email, password } = body;
    const account = accounts.get(String(email ?? '').toLowerCase());
    if (!account || account.password !== password) {
      return fail(res, 401, 'INVALID_CREDENTIALS', '邮箱或密码错误');
    }
    return isNative(body)
      ? ok(res, {
          ...issueSession(account.userId),
          refreshToken: issueRefreshToken(account.userId),
        })
      : ok(res, issueSession(account.userId), setRefreshCookie(account.userId));
  },
  'POST /auth/refresh': async (req, res) => {
    const body = await readBody(req);
    if (body.refreshToken) {
      const userId = refreshTokens.get(body.refreshToken);
      if (!userId) return fail(res, 401, 'UNAUTHORIZED', '登录已失效');
      refreshTokens.delete(body.refreshToken);
      return ok(res, { ...issueSession(userId), refreshToken: issueRefreshToken(userId) });
    }
    const userId = refreshTokens.get(getCookie(req, COOKIE_NAME));
    if (!userId) return fail(res, 401, 'UNAUTHORIZED', '登录已失效');
    return ok(res, issueSession(userId));
  },
  'POST /auth/session': (req, res) => {
    const userId = refreshTokens.get(getCookie(req, COOKIE_NAME));
    if (!userId) return fail(res, 401, 'UNAUTHORIZED', '登录已失效');
    return ok(res, issueSession(userId));
  },
  'POST /auth/logout': async (req, res) => {
    const body = await readBody(req);
    refreshTokens.delete(body.refreshToken);
    refreshTokens.delete(getCookie(req, COOKIE_NAME));
    return ok(
      res,
      { success: true },
      { 'set-cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0` },
    );
  },
  'GET /auth/me': (req, res) => {
    const user = authenticate(req);
    return user ? ok(res, user) : fail(res, 401, 'UNAUTHORIZED', '未登录或登录已过期');
  },
  'GET /users': (req, res, url) => {
    if (!authenticate(req)) return fail(res, 401, 'UNAUTHORIZED', '未登录或登录已过期');
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? 10)));
    const all = [...users.values()];
    return ok(res, {
      items: all.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) },
    });
  },
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const path = url.pathname.startsWith(BASE_PATH)
    ? url.pathname.slice(BASE_PATH.length) || '/'
    : null;
  const handler = path ? routes[`${req.method} ${path}`] : null;

  // CORS：允许 App 的 H5 版本、Expo Web、Flutter Web 等跨域直连
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('access-control-allow-origin', origin);
    res.setHeader('access-control-allow-credentials', 'true');
    res.setHeader('vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'access-control-allow-headers':
        req.headers['access-control-request-headers'] ?? 'content-type,authorization',
      'access-control-max-age': '600',
    });
    return res.end();
  }

  const started = Date.now();
  res.on('finish', () =>
    console.log(
      `${req.method} ${url.pathname}${url.search} -> ${res.statusCode} (${Date.now() - started}ms)`,
    ),
  );

  if (!handler) return fail(res, 404, 'NOT_FOUND', `${req.method} ${url.pathname} not found`);

  try {
    await handler(req, res, url);
  } catch (error) {
    console.error(error);
    fail(res, 500, 'INTERNAL_ERROR', 'Mock server error');
  }
});

server.listen(PORT, () => {
  console.log(`Mock API ready: http://localhost:${PORT}${BASE_PATH}`);
  console.log('Demo account: demo@example.com / password123');
});
