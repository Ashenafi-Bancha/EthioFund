import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as campaignsService from './campaigns.service';

const readCampaignId = (req: Request) => req.params.id || req.params.campaign_id || req.body.campaign_id;

export const createCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const campaign = await campaignsService.createCampaign(req.user.userId, req.body);
    return res.status(201).json({ success: true, campaign });
  } catch (error) {
    return next(error);
  }
};

export const getAllCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const campaigns = await campaignsService.getCampaigns({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      organizerId: typeof req.query.organizer_id === 'string' ? req.query.organizer_id : undefined,
    });

    return res.status(200).json({ success: true, campaigns });
  } catch (error) {
    return next(error);
  }
};

export const getCampaignById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const campaign = await campaignsService.getCampaignById(String(req.params.id));
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    return next(error);
  }
};

export const updateCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const campaign = await campaignsService.updateCampaign(String(req.params.id), req.user.userId, req.user.role, req.body);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    return next(error);
  }
};

export const deleteCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const deleted = await campaignsService.deleteCampaign(String(req.params.id), req.user.userId, req.user.role);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

export const addCampaignUpdate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const update = await campaignsService.addCampaignUpdate({
      campaign_id: String(readCampaignId(req)),
      content: req.body.content,
    });

    return res.status(201).json({ success: true, update });
  } catch (error) {
    return next(error);
  }
};

export const getCampaignUpdates = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const updates = await campaignsService.getCampaignUpdates(String(req.params.campaign_id));
    return res.status(200).json({ success: true, updates });
  } catch (error) {
    return next(error);
  }
};

export const addMilestone = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const milestone = await campaignsService.addMilestone({
      campaign_id: String(readCampaignId(req)),
      title: req.body.title,
      description: req.body.description,
      target_amount: req.body.target_amount,
    });

    return res.status(201).json({ success: true, milestone });
  } catch (error) {
    return next(error);
  }
};

export const getMilestones = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const milestones = await campaignsService.getMilestones(String(req.params.campaign_id));
    return res.status(200).json({ success: true, milestones });
  } catch (error) {
    return next(error);
  }
};

export const adminReviewCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const campaign = await campaignsService.adminReviewCampaign(String(req.params.id), req.body.status);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    return next(error);
  }
};

export const featureCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const campaign = await campaignsService.featureCampaign(String(req.params.id));
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    return next(error);
  }
};

export const recordCampaignShare = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const shareCount = await campaignsService.incrementShareCount(String(req.params.id));
    if (shareCount === null) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, share_count: shareCount });
  } catch (error) {
    return next(error);
  }
};
