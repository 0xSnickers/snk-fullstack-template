import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupApp } from '../../src/common/setup-app';
import { RefreshTokenRepository } from '../../src/modules/auth/refresh-token.repository';
import { UsersRepository } from '../../src/modules/users/users.repository';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createMemoryRepos } from './memory';

/** Boots the real AppModule with in-memory persistence (demo admin is seeded). */
export async function createTestApp(): Promise<INestApplication> {
  const { usersRepo, refreshRepo } = createMemoryRepos();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({ $queryRaw: async () => [{ ok: 1 }], $disconnect: async () => {} })
    .overrideProvider(UsersRepository)
    .useValue(usersRepo)
    .overrideProvider(RefreshTokenRepository)
    .useValue(refreshRepo)
    .compile();
  const app = setupApp(moduleRef.createNestApplication({ logger: false }));
  await app.init();
  return app;
}

export async function login(app: INestApplication, email: string, password: string) {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password });
  const cookie =
    (res.headers['set-cookie'] as unknown as string[] | undefined)?.[0]?.split(';')[0] ?? '';
  return { token: res.body.data?.accessToken as string, cookie, res };
}
