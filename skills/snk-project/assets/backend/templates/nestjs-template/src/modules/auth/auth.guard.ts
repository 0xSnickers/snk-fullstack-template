import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AppException } from '../../common/http/app.exception';
import { AccessClaims, TokenService } from './token.service';

const ROLES_KEY = 'roles';

/** Restricts a route to the given roles; requires AuthGuard. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/** Injects the authenticated user's claims. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<Request & { auth: AccessClaims }>().auth,
);

/** Verifies `Authorization: Bearer <accessToken>`, then checks @Roles metadata if present. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request & { auth?: AccessClaims }>();
    const header = req.headers.authorization ?? '';
    const claims = header.startsWith('Bearer ')
      ? this.tokens.verifyAccessToken(header.slice(7))
      : null;
    if (!claims) throw AppException.unauthorized();
    req.auth = claims;

    const roles = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (roles?.length && !roles.includes(claims.role)) throw AppException.forbidden();
    return true;
  }
}
