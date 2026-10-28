import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../modules/auth/token.service.js';
import { AppError } from '../utils/errors.js';

/** Requires `Authorization: Bearer <accessToken>`; sets `req.auth`. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) throw AppError.unauthorized();
  req.auth = claims;
  next();
}

/** Use after `authenticate`. */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) throw AppError.forbidden();
    next();
  };
}
