import type { NextFunction, Request, Response } from 'express';
import * as reportsService from './reports.service';

export const getReports = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const type = String(req.query.type || '').trim();

    if (type) {
      const data = await reportsService.getReportData(type);
      if (req.user?.userId) {
        try {
          await reportsService.saveReportRecord(type, req.user.userId);
        } catch (saveError) {
          console.error('Report audit insert failed:', saveError);
        }
      }
      return res.status(200).json({ success: true, data });
    }

    const reports = await reportsService.getReports();
    return res.status(200).json({ success: true, data: reports });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    return next(error);
  }
};

export const generateReport = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { report_type } = req.body;
    if (!report_type) {
      return res.status(400).json({ success: false, message: 'report_type is required' });
    }

    const report = await reportsService.generateReport(report_type, req.user.userId);
    return res.status(201).json({ success: true, data: report });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    return next(error);
  }
};
