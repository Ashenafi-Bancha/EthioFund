import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import * as controller from './donations.controller';

const router = express.Router();

router.get('/campaign/:campaign_id', controller.getDonationsByCampaign);
router.get('/campaign/:campaign_id/donations', controller.getDonationsByCampaign);
router.get('/campaigns/:campaign_id/donations', controller.getDonationsByCampaign);
router.post(
  '/',
  verifyToken,
  [
    body('campaign_id').notEmpty(),
    body('amount').isFloat({ min: 1 }),
  ],
  controller.createDonation
);
router.get('/my-donations', verifyToken, controller.getMyDonations);
router.put('/:id/status', verifyToken, controller.updateDonationStatus);

export default router;
