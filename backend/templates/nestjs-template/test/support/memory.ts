import { randomUUID } from 'node:crypto';
import type { NewUser, PublicUser } from '../../src/modules/users/users.repository';

/** In-memory replacements for the Prisma repositories, so tests need no database. */
type Row = PublicUser & { passwordHash: string };

export function createMemoryRepos() {
  const users = new Map<string, Row>();
  const tokens = new Map<string, { userId: string; expiresAt: Date }>();
  const toPublic = (row: Row): PublicUser => {
    const { passwordHash, ...user } = row;
    void passwordHash;
    return user;
  };
  const byEmail = (email: string) => [...users.values()].find((u) => u.email === email);

  const usersRepo = {
    async findPage(skip: number, take: number): Promise<[PublicUser[], number]> {
      const all = [...users.values()].sort((a, b) => +b.createdAt - +a.createdAt);
      return [all.slice(skip, skip + take).map(toPublic), all.length];
    },
    async findById(id: string) {
      const row = users.get(id);
      return row ? toPublic(row) : null;
    },
    async findByEmail(email: string) {
      const row = byEmail(email);
      return row ? toPublic(row) : null;
    },
    async findCredentials(email: string) {
      const row = byEmail(email);
      return row ? { id: row.id, passwordHash: row.passwordHash } : null;
    },
    async create(data: NewUser) {
      const now = new Date();
      const row: Row = { id: randomUUID(), createdAt: now, updatedAt: now, ...data };
      users.set(row.id, row);
      return toPublic(row);
    },
    async update(id: string, data: Partial<Omit<NewUser, 'passwordHash'>>) {
      const row = { ...users.get(id)!, ...data, updatedAt: new Date() };
      users.set(id, row);
      return toPublic(row);
    },
    async delete(id: string) {
      users.delete(id);
    },
  };

  const refreshRepo = {
    async create(userId: string, tokenHash: string, expiresAt: Date) {
      tokens.set(tokenHash, { userId, expiresAt });
    },
    async findUserId(tokenHash: string) {
      const row = tokens.get(tokenHash);
      return row && row.expiresAt > new Date() ? row.userId : null;
    },
    async delete(tokenHash: string) {
      tokens.delete(tokenHash);
    },
  };

  return { usersRepo, refreshRepo };
}
