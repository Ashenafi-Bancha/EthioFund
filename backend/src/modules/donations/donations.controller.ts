import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as donationsService from './donations.service';

export const createDonation = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const donation = await donationsService.createDonation(req.user.userId, req.body);
    return res.status(201).json({ success: true, data: donation });
  } catch (error) {
    return next(error);
  }
};

export const getDonationsByCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const donations = await donationsService.getDonationsByCampaign(String(req.params.campaign_id));
    return res.status(200).json({ success: true, data: donations });
  } catch (error) {
    return next(error);
  }
};

export const getMyDonations = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const donations = await donationsService.getDonationsByDonor(req.user.userId);
    return res.status(200).json({ success: true, data: donations });
  } catch (error) {
    return next(error);
  }
};

export const updateDonationStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const donation = await donationsService.updateDonationStatus(String(req.params.id), req.body.status);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    return res.status(200).json({ success: true, data: donation });
  } catch (error) {
    return next(error);
  }
};
