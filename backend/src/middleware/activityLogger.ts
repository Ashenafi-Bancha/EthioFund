import type { NextFunction, Request, Response } from 'express';
import pool from '../config/db';

/**
 * Persists an administrative or user activity entry into the `activity_logs` table.
 * Caught errors are safely swallowed/logged to prevent database issues from breaking user flows.
 */
export const recordActivity = async (userId: string | number | null | undefined, activity: string): Promise<void> => {
  try {
    await pool.query('INSERT INTO activity_logs (user_id, activity) VALUES ($1, $2)', [userId ?? null, activity]);
  } catch (error) {
    const err = error as Error;
    console.error('Activity log failed:', err.message);
  }
};

/**
 * Express middleware helper that logs actions (e.g. "Approved campaign", "Updated Profile")
 * associated with the authenticated user.
 * 
 * Crucial Design Decision: Uses setImmediate() to queue the logging database query to the
 * Node.js event loop's check phase. This ensures that the primary HTTP request/response cycle
 * is completely non-blocking and the client receives a fast response immediately, while the
 * database insertion happens concurrently in the background.
 */
export const logActivity = (activity: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userId = req.user?.userId || null;

    setImmediate(() => {
      void recordActivity(userId, activity);
    });

    next();
  };
};
