import { Router, type Request, type Response } from 'express';
import { env } from '../../config/env.js';
import { authenticate } from '../../middleware/auth.js';
import { ok } from '../../utils/response.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import { authService } from './auth.service.js';

const COOKIE = 'refresh_token';
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.COOKIE_SECURE,
  path: '/',
});

function sendSession(res: Response, result: { refreshToken: string }, status = 200) {
  const { refreshToken, ...body } = result;
  res.cookie(COOKIE, refreshToken, { ...cookieOptions(), maxAge: env.REFRESH_TOKEN_TTL * 1000 });
  ok(res, body, status);
}

const readCookie = (req: Request): string | undefined => req.cookies?.[COOKIE];

export const authRoutes = Router();

authRoutes.post('/register', async (req, res) => {
  sendSession(res, await authService.register(registerSchema.parse(req.body)), 201);
});

authRoutes.post('/login', async (req, res) => {
  sendSession(res, await authService.login(loginSchema.parse(req.body)));
});

const refresh = async (req: Request, res: Response) => {
  ok(res, await authService.refresh(readCookie(req)));
};
authRoutes.post('/refresh', refresh);
authRoutes.post('/session', refresh);

authRoutes.post('/logout', async (req, res) => {
  const result = await authService.logout(readCookie(req));
  res.clearCookie(COOKIE, cookieOptions());
  ok(res, result);
});

authRoutes.get('/me', authenticate, async (req, res) => {
  ok(res, await authService.me(req.auth!.userId));
});
