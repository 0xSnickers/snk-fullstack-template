import { Router } from 'express';
import { prisma } from './lib/prisma.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { AppError } from './utils/errors.js';
import { ok } from './utils/response.js';

export const routes = Router();

routes.get('/api/health', (_req, res) => {
  ok(res, { status: 'ok' });
});

routes.get('/api/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    ok(res, { status: 'ready' });
  } catch {
    throw new AppError('NOT_READY', 'Database is not reachable', 503);
  }
});

routes.use('/api/v1/auth', authRoutes);
routes.use('/api/v1/users', userRoutes);
