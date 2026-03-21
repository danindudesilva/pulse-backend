export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(params: {
    message: string;
    statusCode: number;
    code: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'AppError';
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Request validation failed', details?: unknown) {
    super({
      message,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super({
      message,
      statusCode: 404,
      code: 'NOT_FOUND',
      details
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown) {
    super({
      message,
      statusCode: 409,
      code: 'CONFLICT',
      details
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super({
      message,
      statusCode: 401,
      code: 'UNAUTHORIZED',
      details
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super({
      message,
      statusCode: 403,
      code: 'FORBIDDEN',
      details
    });
  }
}
