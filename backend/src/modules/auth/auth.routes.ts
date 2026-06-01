import express from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../../middleware/auth';
import * as controller from './auth.controller';

const router = express.Router();

router.post(
  '/register',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('full_name').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('email').trim().notEmpty().withMessage('Email is required'),
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('phone_number').trim().notEmpty().withMessage('Phone number is required'),
    body('phone_number')
      .trim()
      .isLength({ min: 10, max: 13 })
      .withMessage('Enter a valid Ethiopian phone number'),
    body('password').notEmpty().withMessage('Password is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  controller.register
);

router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email is required'),
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  controller.login
);
router.post('/logout', verifyToken, controller.logout);

export default router;
