import express from 'express';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import * as controller from './admin.controller';

const router = express.Router();

router.use(verifyToken, authorize('admin'));

router.get('/stats', controller.getDashboardStats);
router.get('/dashboard', controller.getDashboard);
router.get('/users', controller.getAllUsers);
router.patch('/users/:id/role', controller.updateUserRole);
router.patch('/users/:id/status', controller.updateUserStatus);
router.patch('/users/:id/suspend', controller.suspendUser);
router.patch('/users/:id/activate', controller.activateUser);
router.patch('/campaigns/:id/approve', controller.approveCampaign);
router.patch('/campaigns/:id/feature', controller.featureCampaign);
router.get('/withdrawals', controller.getWithdrawalRequests);
router.patch('/withdrawals/:id/status', controller.updateWithdrawalStatus);
router.patch('/withdrawals/:id/approve', controller.approveWithdrawal);
router.patch('/withdrawals/:id/reject', controller.rejectWithdrawal);
router.get('/comments', controller.getAllComments);
router.get('/activity-logs', controller.getActivityLogs);
router.get('/contact-messages', controller.getContactMessages);
router.patch('/contact-messages/:id/status', controller.updateContactMessageStatus);

// Analytics (lightweight, read-only)
router.get('/analytics/overview', controller.getAnalyticsOverview);
router.get('/analytics/donations-by-month', controller.getDonationsByMonth);
router.get('/analytics/campaign-status', controller.getCampaignStatusBreakdown);
router.get('/analytics/comment-moderation', controller.getCommentModerationBreakdown);

export default router;
