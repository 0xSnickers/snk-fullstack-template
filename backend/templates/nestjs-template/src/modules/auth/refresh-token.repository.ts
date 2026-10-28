import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  /** Returns the owner of a non-expired token, or null. */
  async findUserId(tokenHash: string): Promise<string | null> {
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    return row && row.expiresAt > new Date() ? row.userId : null;
  }

  async delete(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }
}
