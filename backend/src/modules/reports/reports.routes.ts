import express from 'express';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import * as controller from './reports.controller';

const router = express.Router();

router.get('/', verifyToken, authorize('admin'), controller.getReports);
router.post('/', verifyToken, authorize('admin'), controller.generateReport);

export default router;
