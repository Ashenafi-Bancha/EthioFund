import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { recordActivity } from '../../middleware/activityLogger';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg, errors: errors.array() });
    }

    const result = await authService.register(req.body);
    void recordActivity(result.user.id, 'Registered new account');

    return res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg, errors: errors.array() });
    }

    const { token, user } = await authService.login(req.body);
    return res.status(200).json({ success: true, data: { token, user } });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<Response> => {
  // Frontend must delete JWT from localStorage on receiving this response
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};
