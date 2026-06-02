import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import * as controller from './payments.controller';

const router = express.Router();

router.post(
  '/initialize',
  verifyToken,
  authorize('donor', 'organizer'),
  [
    body('campaign_id').notEmpty().withMessage('campaign_id is required'),
    body('amount').isNumeric().withMessage('Enter a valid donation amount'),
    body('amount').isFloat({ gt: 0 }).withMessage('Donation amount must be greater than 0'),
  ],
  controller.initializePayment
);
router.get('/verify/:tx_ref', controller.verifyPayment);
router.get('/verify', controller.verifyPayment);
router.post('/verify', controller.verifyPayment);
router.post('/webhook', controller.chapaWebhook);
router.post('/webhook/chapa', controller.chapaWebhook);
router.post('/webhook/stripe', controller.stripeWebhook);

export default router;
