import type { Request } from 'express';
import type { ZodTypeAny } from 'zod';

export function validateBody<TSchema extends ZodTypeAny>(
  schema: TSchema,
  req: Request
) {
  return schema.parse(req.body);
}

export function validateQuery<TSchema extends ZodTypeAny>(
  schema: TSchema,
  req: Request
) {
  return schema.parse(req.query);
}

export function validateParams<TSchema extends ZodTypeAny>(
  schema: TSchema,
  req: Request
) {
  return schema.parse(req.params);
}
