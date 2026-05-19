import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import * as controller from './withdrawals.controller';

const router = express.Router();

router.get('/my', verifyToken, authorize('organizer', 'admin'), controller.getMyWithdrawals);
router.get('/', verifyToken, authorize('admin'), controller.getAllWithdrawals);
router.post(
  '/',
  verifyToken,
  authorize('organizer', 'admin'),
  [body('campaign_id').notEmpty(), body('amount').isFloat({ min: 1 })],
  controller.requestWithdrawal
);
router.patch('/:id/status', verifyToken, authorize('admin'), controller.updateWithdrawalStatus);

export default router;
