import type { NextFunction, Request, Response } from 'express';

type AppError = Error & {
  statusCode?: number;
  code?: string;
};
// Centralized error handler for the API.
// Ensures consistent JSON error responses across the system
// and maps authentication/database errors to user-friendly messages.

export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): Response => {
  void _next;
  console.error('Error:', err);

  // Handle unique constraint violations (Postgres error code 23505)
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Duplicate value violates unique constraint' });
  }

  // JWT-specific errors forwarded as 401 to prompt re-authentication.
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid authentication token' });
  }

  const status = err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
