import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/app-error.js';

export function notFoundMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  next(new NotFoundError('Route not found', null));
}
