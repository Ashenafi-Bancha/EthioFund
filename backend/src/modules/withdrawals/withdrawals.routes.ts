import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import * as controller from './withdrawals.controller';

const router = express.Router();

router.get('/my', verifyToken, authorize('organizer'), controller.getMyWithdrawals);
router.get('/', verifyToken, authorize('admin'), controller.getAllWithdrawals);
router.post(
  '/',
  verifyToken,
  authorize('organizer'),
  [
    body('campaign_id').notEmpty().withMessage('campaign_id is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Withdrawal amount must be greater than 0'),
    body('bank_account').optional().isString(),
  ],
  controller.requestWithdrawal
);
router.patch('/:id/approve', verifyToken, authorize('admin'), controller.approveWithdrawal);
router.patch('/:id/reject', verifyToken, authorize('admin'), controller.rejectWithdrawal);
router.patch('/:id/status', verifyToken, authorize('admin'), controller.updateWithdrawalStatus);

export default router;
