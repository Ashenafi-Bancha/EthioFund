import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import * as controller from './comments.controller';

const router = express.Router();

router.get('/campaign/:campaign_id', controller.getCampaignComments);
router.post(
  '/',
  verifyToken,
  [body('campaign_id').isInt({ min: 1 }), body('content').trim().isLength({ min: 1, max: 2000 })],
  controller.addComment
);
router.delete('/:id', verifyToken, controller.deleteComment);

export default router;
