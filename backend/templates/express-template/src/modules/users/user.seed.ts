import { logger } from '../../lib/logger.js';
import { userRepository } from './user.repository.js';
import { userService } from './user.service.js';

export const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@example.com',
  password: 'password123',
  role: 'admin' as const,
};

/** Creates the demo admin account when it does not exist (SEED_DEMO_USER=true). */
export async function seedDemoUser() {
  if (await userRepository.findByEmail(DEMO_USER.email)) return;
  await userService.create(DEMO_USER);
  logger.info({ email: DEMO_USER.email }, 'demo user created');
}
