import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import type { Env } from '../../config/env';
import { RefreshTokenRepository } from './refresh-token.repository';

export type AccessClaims = { userId: string; role: string };

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  signAccessToken(userId: string, role: string) {
    return this.jwt.sign({ role }, { subject: userId });
  }

  /** Returns claims for a valid token, otherwise null. */
  verifyAccessToken(token: string): AccessClaims | null {
    try {
      const payload = this.jwt.verify<{ sub?: string; role?: string }>(token);
      return payload.sub ? { userId: payload.sub, role: payload.role ?? 'user' } : null;
    } catch {
      return null;
    }
  }

  /** Issues an opaque refresh token; only its hash is stored. */
  async issueRefreshToken(userId: string) {
    const token = randomBytes(32).toString('base64url');
    const ttl = this.config.get('REFRESH_TOKEN_TTL', { infer: true });
    await this.refreshTokens.create(userId, sha256(token), new Date(Date.now() + ttl * 1000));
    return token;
  }

  resolveRefreshToken(token: string) {
    return this.refreshTokens.findUserId(sha256(token));
  }

  revokeRefreshToken(token: string) {
    return this.refreshTokens.delete(sha256(token));
  }
}
