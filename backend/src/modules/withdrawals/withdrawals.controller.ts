import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as withdrawalsService from './withdrawals.service';

export const requestWithdrawal = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const withdrawal = await withdrawalsService.requestWithdrawal(req.user.userId, req.body);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    return next(error);
  }
};

export const getMyWithdrawals = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const withdrawals = await withdrawalsService.getMyWithdrawals(req.user.userId);
    return res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    return next(error);
  }
};

export const getAllWithdrawals = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const withdrawals = await withdrawalsService.getAllWithdrawals();
    return res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    return next(error);
  }
};

export const updateWithdrawalStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const withdrawal = await withdrawalsService.updateWithdrawalStatus(String(req.params.id), req.body.status);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    return res.status(200).json({ success: true, withdrawal });
  } catch (error) {
    return next(error);
  }
};
