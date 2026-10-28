import { Injectable } from '@nestjs/common';
import { AppException } from '../../common/http/app.exception';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { TokenService } from './token.service';

type SessionUser = { id: string; role: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
  ) {}

  /** Returns the session plus a refresh token for the cookie. */
  async register(dto: RegisterDto) {
    const user = await this.users.create({ ...dto, role: 'user' });
    return { ...this.session(user), refreshToken: await this.tokens.issueRefreshToken(user.id) };
  }

  async login({ email, password }: LoginDto) {
    const userId = await this.users.verifyCredentials(email, password);
    if (!userId) throw new AppException('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    const user = await this.users.get(userId);
    return { ...this.session(user), refreshToken: await this.tokens.issueRefreshToken(user.id) };
  }

  /** Refresh tokens are not rotated so that the Next.js BFF /auth/session flow keeps working. */
  async refresh(refreshToken: string | undefined) {
    const userId = refreshToken ? await this.tokens.resolveRefreshToken(refreshToken) : null;
    if (!userId) throw AppException.unauthorized('Session expired');
    const user = await this.users.get(userId).catch(() => null);
    if (!user) throw AppException.unauthorized('Session expired');
    return this.session(user);
  }

  async logout(refreshToken: string | undefined) {
    if (refreshToken) await this.tokens.revokeRefreshToken(refreshToken);
    return { success: true };
  }

  private session<T extends SessionUser>(user: T) {
    return { user, accessToken: this.tokens.signAccessToken(user.id, user.role) };
  }
}
