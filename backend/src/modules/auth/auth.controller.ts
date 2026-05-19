import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await authService.register(req.body);
    return res.status(201).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { token, user } = await authService.login(req.body);
    return res.status(200).json({ success: true, token, user });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};
