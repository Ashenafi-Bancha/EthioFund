import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import * as controller from './users.controller';

const router = express.Router();

router.get('/me', verifyToken, controller.getMe);
router.put(
  '/me',
  verifyToken,
  [
    body('full_name').optional().notEmpty().withMessage('Full name is required'),
    body('full_name').optional().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('phone_number')
      .optional()
      .isLength({ min: 10, max: 13 })
      .withMessage('Enter a valid phone number'),
  ],
  controller.updateMe
);

export default router;
