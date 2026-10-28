import { verifyPassword } from '../../lib/password.js';
import { AppError } from '../../utils/errors.js';
import { userRepository, type PublicUser } from '../users/user.repository.js';
import { userService } from '../users/user.service.js';
import {
  issueRefreshToken,
  resolveRefreshToken,
  revokeRefreshToken,
  signAccessToken,
} from './token.service.js';

type Credentials = { email: string; password: string };

const session = (user: PublicUser) => ({ user, accessToken: signAccessToken(user.id, user.role) });

export const authService = {
  /** Returns the session plus a refresh token for the cookie. */
  async register(input: { name: string } & Credentials) {
    const user = await userService.create({ ...input, role: 'user' });
    return { ...session(user), refreshToken: await issueRefreshToken(user.id) };
  },

  async login({ email, password }: Credentials) {
    const cred = await userRepository.findCredentials(email);
    if (!cred || !(await verifyPassword(password, cred.passwordHash))) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }
    const user = await userService.get(cred.id);
    return { ...session(user), refreshToken: await issueRefreshToken(user.id) };
  },

  /** Refresh tokens are not rotated so that the Next.js BFF /auth/session flow keeps working. */
  async refresh(refreshToken: string | undefined) {
    const userId = refreshToken ? await resolveRefreshToken(refreshToken) : null;
    const user = userId ? await userRepository.findById(userId) : null;
    if (!user) throw AppError.unauthorized('Session expired');
    return session(user);
  },

  async logout(refreshToken: string | undefined) {
    if (refreshToken) await revokeRefreshToken(refreshToken);
    return { success: true };
  },

  me: (userId: string) => userService.get(userId),
};
