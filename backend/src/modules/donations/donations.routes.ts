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
    body('campaign_id').notEmpty().withMessage('campaign_id is required'),
    body('amount').isNumeric().withMessage('Enter a valid donation amount'),
    body('amount').isFloat({ gt: 0 }).withMessage('Donation amount must be greater than 0'),
  ],
  controller.createDonation
);
router.get('/my-donations', verifyToken, controller.getMyDonations);
// TC-14: Alias route expected by test spec
router.get('/my', verifyToken, controller.getMyDonations);
router.put('/:id/status', verifyToken, controller.updateDonationStatus);

export default router;
