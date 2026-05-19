import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import * as controller from './auth.controller';

const router = express.Router();

router.post(
  '/register',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone_number').trim().isLength({ min: 9 }).withMessage('Phone number is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  controller.register
);

router.post('/login', controller.login);
router.post('/logout', verifyToken, controller.logout);

export default router;
