import { prisma } from '../../lib/prisma.js';

export const refreshTokenRepository = {
  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  },
  /** Returns the owner of a non-expired token, or null. */
  async findUserId(tokenHash: string): Promise<string | null> {
    const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    return row && row.expiresAt > new Date() ? row.userId : null;
  },
  async delete(tokenHash: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  },
};
