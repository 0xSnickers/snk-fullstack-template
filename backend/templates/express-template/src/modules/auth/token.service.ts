import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { refreshTokenRepository } from './refreshToken.repository.js';

export type AccessClaims = { userId: string; role: string };

export function signAccessToken(userId: string, role: string) {
  return jwt.sign({ role }, env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: userId,
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
}

/** Returns claims for a valid token, otherwise null. */
export function verifyAccessToken(token: string): AccessClaims | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || !payload.sub) return null;
    return { userId: payload.sub, role: String(payload.role ?? 'user') };
  } catch {
    return null;
  }
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/** Issues an opaque refresh token; only its hash is stored. */
export async function issueRefreshToken(userId: string) {
  const token = randomBytes(32).toString('base64url');
  await refreshTokenRepository.create(
    userId,
    sha256(token),
    new Date(Date.now() + env.REFRESH_TOKEN_TTL * 1000),
  );
  return token;
}

export const resolveRefreshToken = (token: string) =>
  refreshTokenRepository.findUserId(sha256(token));
export const revokeRefreshToken = (token: string) => refreshTokenRepository.delete(sha256(token));
