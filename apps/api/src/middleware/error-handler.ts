import type { ErrorHandler, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const createErrorHandler = (): ErrorHandler => {
  return (error, context) => {
    if (error instanceof HTTPException) {
      return context.json(
        {
          error: {
            code: 'HTTP_ERROR',
            message: error.message,
          },
        },
        error.status as 400 | 401 | 403 | 404 | 500,
      );
    }

    if (error instanceof AppError) {
      return context.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        error.statusCode as 400 | 401 | 403 | 404 | 500,
      );
    }

    // Generic error - never leak details
    console.error('Unhandled error:', error);
    return context.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      500,
    );
  };
};

export const errorHandler = (app: Hono): void => {
  app.onError(createErrorHandler());
};
