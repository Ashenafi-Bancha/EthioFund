import express from 'express';
import { verifyToken } from '../../middleware/auth';
import * as controller from './payments.controller';

const router = express.Router();

router.post('/initialize', verifyToken, controller.initializePayment);
router.get('/verify', controller.verifyPayment);
router.post('/verify', controller.verifyPayment);
router.post('/webhook', controller.chapaWebhook);
router.post('/webhook/chapa', controller.chapaWebhook);
router.post('/webhook/stripe', controller.stripeWebhook);

export default router;
