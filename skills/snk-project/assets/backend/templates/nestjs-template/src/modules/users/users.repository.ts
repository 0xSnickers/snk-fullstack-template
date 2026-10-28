import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Public fields only — password hashes never leave the repository unless explicitly asked. */
export const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUser }>;
export type NewUser = { name: string; email: string; passwordHash: string; role: string };

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPage(skip: number, take: number): Promise<[PublicUser[], number]> {
    return this.prisma.$transaction([
      this.prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' }, select: publicUser }),
      this.prisma.user.count(),
    ]);
  }

  findById(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({ where: { id }, select: publicUser });
  }

  findByEmail(email: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({ where: { email }, select: publicUser });
  }

  findCredentials(email: string): Promise<{ id: string; passwordHash: string } | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
  }

  create(data: NewUser): Promise<PublicUser> {
    return this.prisma.user.create({ data, select: publicUser });
  }

  update(id: string, data: Partial<Omit<NewUser, 'passwordHash'>>): Promise<PublicUser> {
    return this.prisma.user.update({ where: { id }, data, select: publicUser });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
