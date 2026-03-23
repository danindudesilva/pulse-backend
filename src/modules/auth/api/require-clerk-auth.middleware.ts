import type { NextFunction, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { UnauthorizedError } from '../../../lib/errors/app-error.js';

export function requireClerkAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const auth = getAuth(req);

  if (!auth.userId) {
    return next(new UnauthorizedError('Authentication required'));
  }

  return next();
}
