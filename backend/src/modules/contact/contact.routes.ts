import express from 'express';
import { body } from 'express-validator';
import * as controller from './contact.controller';

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message is required'),
  ],
  controller.submitContactMessage
);

export default router;