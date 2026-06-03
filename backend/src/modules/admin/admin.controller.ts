import type { NextFunction, Request, Response } from 'express';
import * as adminService from './admin.service';
import * as campaignsService from '../campaigns/campaigns.service';
import * as commentsService from '../comments/comments.service';

// Get dashboard statistics
export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const stats = await adminService.getDashboardStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return next(error);
  }
};

// Get complete dashboard data
export const getDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const dashboard = await adminService.getFullDashboard();
    return res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    return next(error);
  }
};

// Get all users
export const getAllUsers = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const users = await adminService.getAllUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return next(error);
  }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const user = await adminService.updateUserRole(String(req.params.id), req.body.role);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

// Update user account status
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const requestingAdminId = req.user?.userId;
    const user = await adminService.updateUserStatus(
      String(req.params.id),
      req.body.status,
      requestingAdminId
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    const err = error as Error & { statusCode?: number };

    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }

    return next(error);
  }
};

// Suspend user account
export const suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  req.body = { ...req.body, status: 'suspended' };
  return updateUserStatus(req, res, next);
};

// Activate user account
export const activateUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  req.body = { ...req.body, status: 'active' };
  return updateUserStatus(req, res, next);
};

// Approve or review campaign
export const approveCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const status = req.body.status || 'approved';
    const campaign = await campaignsService.adminReviewCampaign(
      String(req.params.id),
      status
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    return next(error);
  }
};

// Get all comments for moderation
export const getAllComments = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const comments = await commentsService.getAllCommentsForAdmin();
    return res.status(200).json({ success: true, data: comments });
  } catch (error) {
    return next(error);
  }
};

// Get system activity logs
export const getActivityLogs = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const logs = await adminService.getActivityLogs();
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return next(error);
  }
};

// Mark campaign as featured
export const featureCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const campaign = await campaignsService.featureCampaign(String(req.params.id));

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    return next(error);
  }
};

// Get all withdrawal requests
export const getWithdrawalRequests = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const withdrawals = await adminService.getWithdrawalRequests();
    return res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    return next(error);
  }
};

// Update withdrawal status
export const updateWithdrawalStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const withdrawal = await adminService.updateWithdrawalStatus(
      String(req.params.id),
      req.body.status,
      req.user?.userId
    );

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    return res.status(200).json({ success: true, data: withdrawal });
  } catch (error) {
    const err = error as Error & { statusCode?: number };

    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }

    return next(error);
  }
};

// Approve withdrawal request
export const approveWithdrawal = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const withdrawal = await adminService.updateWithdrawalStatus(
      String(req.params.id),
      'approved',
      req.user?.userId
    );

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    return res.status(200).json({ success: true, data: withdrawal });
  } catch (error) {
    const err = error as Error & { statusCode?: number };

    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }

    return next(error);
  }
};

// Reject withdrawal request
export const rejectWithdrawal = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const withdrawal = await adminService.updateWithdrawalStatus(
      String(req.params.id),
      'rejected',
      req.user?.userId
    );

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    return res.status(200).json({ success: true, data: withdrawal });
  } catch (error) {
    const err = error as Error & { statusCode?: number };

    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }

    return next(error);
  }
};

// Get contact messages
export const getContactMessages = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const status = typeof req.query.status === 'string'
      ? req.query.status
      : undefined;

    const messages = await adminService.getContactMessages(
      status === 'new' || status === 'read' || status === 'archived'
        ? status
        : undefined
    );

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return next(error);
  }
};

// Update contact message status
export const updateContactMessageStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const status = String(req.body.status || '').trim();

    if (!['new', 'read', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be new, read, or archived'
      });
    }

    const message = await adminService.updateContactMessageStatus(
      String(req.params.id),
      status as 'new' | 'read' | 'archived'
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    return next(error);
  }
};

export const getAnalyticsOverview = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const data = await adminService.getAnalyticsOverview();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getDonationsByMonth = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const data = await adminService.getDonationsByMonth();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getCampaignStatusBreakdown = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const data = await adminService.getCampaignStatusBreakdown();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getCommentModerationBreakdown = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const data = await adminService.getCommentModerationBreakdown();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
