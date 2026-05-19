import express from 'express';
import { verifyToken } from '../../middleware/auth';
import * as controller from './users.controller';

const router = express.Router();

router.get('/me', verifyToken, controller.getMe);
router.put('/me', verifyToken, controller.updateMe);

export default router;
