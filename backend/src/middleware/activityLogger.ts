import type { NextFunction, Request, Response } from 'express';
import pool from '../config/db';

export const logActivity = (activity: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userId = req.user?.userId || null;

    setImmediate(async () => {
      try {
        await pool.query('INSERT INTO activity_logs (user_id, activity) VALUES ($1, $2)', [userId, activity]);
      } catch (error) {
        const err = error as Error;
        console.error('Activity log failed:', err.message);
      }
    });

    next();
  };
};
