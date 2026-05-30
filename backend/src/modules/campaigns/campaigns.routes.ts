import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { uploadCampaignAssets } from './campaignUploads';
import * as controller from './campaigns.controller';

const router = express.Router();

router.get('/', controller.getAllCampaigns);
router.get('/my', verifyToken, authorize('organizer', 'admin'), controller.getMyCampaigns);
router.get('/:id', controller.getCampaignById);
router.get('/:campaign_id/updates', controller.getCampaignUpdates);
router.get('/:campaign_id/milestones', controller.getMilestones);

router.post(
  '/',
  verifyToken,
  authorize('organizer', 'admin'),
  uploadCampaignAssets.fields([
    { name: 'campaign_image', maxCount: 1 },
    { name: 'supporting_documents', maxCount: 8 },
  ]),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('title').isLength({ max: 150 }).withMessage('Title must be 150 characters or fewer'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('description').isLength({ max: 10000 }).withMessage('Description is too long'),
    body('goal_amount').isFloat({ min: 1 }).withMessage('Goal amount is required'),
    body('category').isIn(['medical', 'education', 'funeral', 'emergency', 'community']).withMessage('Invalid category'),
    body('location').optional().isString().isLength({ max: 120 }).withMessage('Location must be 120 characters or fewer'),
    body('story').optional().isString(),
    body('image_url').optional().isString(),
    body('duration_days').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  ],
  controller.createCampaign
);

router.put('/:id', verifyToken, controller.updateCampaign);
router.delete('/:id', verifyToken, controller.deleteCampaign);
router.post('/updates', verifyToken, controller.addCampaignUpdate);
router.post('/milestones', verifyToken, controller.addMilestone);
router.post('/:id/share', controller.recordCampaignShare);

export default router;
