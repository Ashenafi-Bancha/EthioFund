import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as usersService from './users.service';

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await usersService.getById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await usersService.update(req.user.userId, {
      full_name: req.body.full_name,
      phone_number: req.body.phone_number,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};
