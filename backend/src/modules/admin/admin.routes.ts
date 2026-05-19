import express from 'express';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import * as controller from './admin.controller';

const router = express.Router();

router.use(verifyToken, authorize('admin'));

router.get('/stats', controller.getDashboardStats);
router.get('/users', controller.getAllUsers);
router.patch('/users/:id/role', controller.updateUserRole);
router.patch('/users/:id/status', controller.updateUserStatus);
router.patch('/campaigns/:id/approve', controller.approveCampaign);
router.patch('/campaigns/:id/feature', controller.featureCampaign);
router.get('/withdrawals', controller.getWithdrawalRequests);
router.patch('/withdrawals/:id/status', controller.updateWithdrawalStatus);

export default router;
