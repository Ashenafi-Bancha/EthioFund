import type { NextFunction, Request, Response } from 'express';
import * as adminService from './admin.service';
import * as campaignsService from '../campaigns/campaigns.service';
import * as commentsService from '../comments/comments.service';

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const stats = await adminService.getDashboardStats();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    return next(error);
  }
};

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const users = await adminService.getAllUsers();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const user = await adminService.updateUserRole(String(req.params.id), req.body.role);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const user = await adminService.updateUserStatus(String(req.params.id), req.body.status);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

export const approveCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const campaign = await campaignsService.adminReviewCampaign(String(req.params.id), req.body.status);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    return next(error);
  }
};

export const getAllComments = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const comments = await commentsService.getAllCommentsForAdmin();
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    return next(error);
  }
};

export const getActivityLogs = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const logs = await adminService.getActivityLogs();
    return res.status(200).json({ success: true, logs });
  } catch (error) {
    return next(error);
  }
};

export const featureCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const campaign = await campaignsService.featureCampaign(String(req.params.id));
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    return next(error);
  }
};

export const getWithdrawalRequests = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const withdrawals = await adminService.getWithdrawalRequests();
    return res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    return next(error);
  }
};

export const updateWithdrawalStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const withdrawal = await adminService.updateWithdrawalStatus(String(req.params.id), req.body.status);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    return res.status(200).json({ success: true, withdrawal });
  } catch (error) {
    return next(error);
  }
};
