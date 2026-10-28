import { hashPassword } from '../../lib/password.js';
import { AppError } from '../../utils/errors.js';
import { pageResult, type PageQuery } from '../../utils/response.js';
import { userRepository } from './user.repository.js';
import type { CreateUserInput, UpdateUserInput } from './user.schema.js';

async function ensureEmailFree(email: string, exceptId?: string) {
  const existing = await userRepository.findByEmail(email);
  if (existing && existing.id !== exceptId) {
    throw AppError.conflict('EMAIL_EXISTS', 'Email already in use');
  }
}

export const userService = {
  async list(query: PageQuery) {
    const [items, total] = await userRepository.findPage(
      (query.page - 1) * query.limit,
      query.limit,
    );
    return pageResult(items, total, query);
  },

  async get(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('USER_NOT_FOUND', 'User not found');
    return user;
  },

  async create({ password, ...input }: CreateUserInput) {
    await ensureEmailFree(input.email);
    return userRepository.create({ ...input, passwordHash: await hashPassword(password) });
  },

  async update(id: string, input: UpdateUserInput) {
    await this.get(id);
    if (input.email) await ensureEmailFree(input.email, id);
    return userRepository.update(id, input);
  },

  async remove(id: string) {
    await this.get(id);
    await userRepository.delete(id);
    return { id };
  },
};
