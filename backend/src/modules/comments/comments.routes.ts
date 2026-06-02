import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import * as controller from './comments.controller';

const router = express.Router();

router.get('/campaign/:campaign_id', controller.getCampaignComments);
router.post(
  '/',
  verifyToken,
  [body('campaign_id').isInt({ min: 1 }), body('content').trim().notEmpty().withMessage('Comment content is required')],
  controller.addComment
);
router.delete('/:id', verifyToken, controller.deleteComment);
router.get('/pending/review', verifyToken, authorize('admin'), controller.getPendingComments);
router.patch(
  '/:id/review',
  verifyToken,
  authorize('admin'),
  [
    body('decision').isIn(['approved', 'rejected']),
    body('reason').optional().trim().isLength({ min: 3, max: 500 }),
  ],
  controller.reviewComment
);

export default router;
