import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import * as controller from './campaigns.controller';

const router = express.Router();

router.get('/', controller.getAllCampaigns);
router.get('/:id', controller.getCampaignById);
router.get('/:campaign_id/updates', controller.getCampaignUpdates);
router.get('/:campaign_id/milestones', controller.getMilestones);

router.post(
  '/',
  verifyToken,
  authorize('organizer', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('goal_amount').isFloat({ min: 1 }).withMessage('Goal amount is required'),
    body('category').isIn(['medical', 'education', 'funeral', 'emergency', 'community']).withMessage('Invalid category'),
  ],
  controller.createCampaign
);

router.put('/:id', verifyToken, controller.updateCampaign);
router.delete('/:id', verifyToken, controller.deleteCampaign);
router.post('/updates', verifyToken, controller.addCampaignUpdate);
router.post('/milestones', verifyToken, controller.addMilestone);
router.post('/:id/share', controller.recordCampaignShare);

export default router;
