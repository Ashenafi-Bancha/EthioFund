import type { NextFunction, Request, Response } from 'express';

type AppError = Error & {
  statusCode?: number;
  code?: string;
};

export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): Response => {
  void _next;
  console.error('Error:', err);

  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Duplicate value violates unique constraint' });
  }

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
