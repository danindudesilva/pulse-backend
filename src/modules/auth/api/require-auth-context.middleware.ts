import { getAuth } from '@clerk/express';
import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../../lib/errors/app-error.js';
import type { AuthContext } from '../domain/auth-context.types.js';

type ResolveAuthContextExecutor = {
  execute(input: { clerkUserId: string }): Promise<AuthContext>;
};

export function createRequireAuthContextMiddleware(
  resolver: ResolveAuthContextExecutor
) {
  return async function requireAuthContext(
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    try {
      const auth = getAuth(req);

      if (!auth.userId) {
        return next(new UnauthorizedError('Authentication required'));
      }

      req.authContext = await resolver.execute({
        clerkUserId: auth.userId
      });

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
