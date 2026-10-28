import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

export const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@example.com',
  password: 'password123',
  role: 'admin' as const,
};

/** Creates the demo admin account on startup when SEED_DEMO_USER=true. */
@Injectable()
export class DemoUserSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoUserSeeder.name);

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly repo: UsersRepository,
    private readonly users: UsersService,
  ) {}

  async onApplicationBootstrap() {
    if (!this.config.get('SEED_DEMO_USER', { infer: true })) return;
    if (await this.repo.findByEmail(DEMO_USER.email)) return;
    await this.users.create(DEMO_USER);
    this.logger.log(`demo user created: ${DEMO_USER.email}`);
  }
}
