import type { Request } from 'express';
import type { ZodObject, ZodRawShape } from 'zod';

export function validateBody<TShape extends ZodRawShape>(
  schema: ZodObject<TShape>,
  req: Request
) {
  return schema.parse(req.body);
}

export function validateQuery<TShape extends ZodRawShape>(
  schema: ZodObject<TShape>,
  req: Request
) {
  return schema.parse(req.query);
}

export function validateParams<TShape extends ZodRawShape>(
  schema: ZodObject<TShape>,
  req: Request
) {
  return schema.parse(req.params);
}
