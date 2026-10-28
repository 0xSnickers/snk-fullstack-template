import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import type { Env } from '../../config/env';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthGuard, CurrentUser } from './auth.guard';
import { AuthService } from './auth.service';
import type { AccessClaims } from './token.service';

const COOKIE = 'refresh_token';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return this.withCookie(res, await this.auth.register(dto));
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.withCookie(res, await this.auth.login(dto));
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Req() req: Request) {
    return this.auth.refresh(req.cookies?.[COOKIE]);
  }

  @Post('session')
  @HttpCode(200)
  session(@Req() req: Request) {
    return this.auth.refresh(req.cookies?.[COOKIE]);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.logout(req.cookies?.[COOKIE]);
    res.clearCookie(COOKIE, this.cookieOptions());
    return result;
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() auth: AccessClaims) {
    return this.users.get(auth.userId);
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('COOKIE_SECURE', { infer: true }),
      path: '/',
    };
  }

  private withCookie<T>(res: Response, { refreshToken, ...session }: T & { refreshToken: string }) {
    const maxAge = this.config.get('REFRESH_TOKEN_TTL', { infer: true }) * 1000;
    res.cookie(COOKIE, refreshToken, { ...this.cookieOptions(), maxAge });
    return session;
  }
}
