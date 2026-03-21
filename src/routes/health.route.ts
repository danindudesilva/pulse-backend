import { Router } from 'express';
import { MethodNotAllowedError } from '../lib/errors/app-error.js';

export const healthRouter = Router();

healthRouter
  .route('/')
  .get((_req, res) => {
    res.status(200).json({
      status: 'ok'
    });
  })
  .all((req, _res, next) => {
    next(
      new MethodNotAllowedError(
        `Method ${req.method} not allowed for ${req.baseUrl || '/health'}`
      )
    );
  });
