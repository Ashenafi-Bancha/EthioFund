import type { NextFunction, Request, Response } from 'express';
import * as reportsService from './reports.service';

export const getReports = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const reports = await reportsService.getReports();
    return res.status(200).json({ success: true, reports });
  } catch (error) {
    return next(error);
  }
};

export const generateReport = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const report = await reportsService.generateReport(req.body.report_type, req.user.userId);
    return res.status(201).json({ success: true, report });
  } catch (error) {
    return next(error);
  }
};
