import request from 'supertest';
import { vi } from 'vitest';

vi.mock('../../src/lib/prisma.js', async () => ({ prisma: (await import('./memory.js')).prisma }));
vi.mock('../../src/modules/users/user.repository.js', async () => ({
  userRepository: (await import('./memory.js')).userRepository,
}));
vi.mock('../../src/modules/auth/refreshToken.repository.js', async () => ({
  refreshTokenRepository: (await import('./memory.js')).refreshTokenRepository,
}));

const { createApp } = await import('../../src/app.js');
const { seedDemoUser, DEMO_USER } = await import('../../src/modules/users/user.seed.js');

export const app = createApp();
export { DEMO_USER, seedDemoUser };

/** Logs in and returns the bearer token and refresh cookie. */
export async function login(email: string, password: string) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  const cookie = (res.headers['set-cookie'] as unknown as string[] | undefined)?.[0]?.split(';')[0];
  return { token: res.body.data?.accessToken as string, cookie: cookie ?? '', res };
}
