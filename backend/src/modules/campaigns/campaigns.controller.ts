import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import env from '../../config/env';
import * as campaignsService from './campaigns.service';

const readCampaignId = (req: Request) => req.params.id || req.params.campaign_id || req.body.campaign_id;

const mapCampaign = (campaign: Record<string, unknown>) => {
  const campaignId = Number(campaign.campaign_id);
  return {
    ...campaign,
    campaignId,
    organizerId: campaign.organizer_id,
    organizerName: campaign.organizer_name,
    goalAmount: Number(campaign.goal_amount),
    raisedAmount: Number(campaign.raised_amount),
    availableAmount: Number(campaign.available_amount ?? campaign.raised_amount),
    bankAccount: campaign.bank_account,
    payoutPhone: campaign.payout_phone,
    createdAt: campaign.created_at,
    shareUrl: `${env.CLIENT_URL}/campaigns/${campaignId}`,
  };
};

export const createCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const uploadedFiles = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[]
      | undefined;

    const campaignImageFile = !Array.isArray(uploadedFiles) ? uploadedFiles?.campaign_image?.[0] : undefined;
    const documentFiles = !Array.isArray(uploadedFiles) ? uploadedFiles?.supporting_documents ?? [] : [];

    const uploadedImageUrl = campaignImageFile ? `/uploads/campaigns/${campaignImageFile.filename}` : undefined;
    const uploadedDocuments = documentFiles.map((file) => `/uploads/documents/${file.filename}`);

    const campaign = await campaignsService.createCampaign(req.user.userId, req.body, uploadedImageUrl, uploadedDocuments);
    return res.status(201).json({ success: true, data: mapCampaign(campaign as Record<string, unknown>) });
  } catch (error) {
    console.error('Failed to create campaign:', error);
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

    return res.status(200).json({ success: true, data: campaigns.map((campaign) => mapCampaign(campaign as Record<string, unknown>)) });
  } catch (error) {
    return next(error);
  }
};

export const getMyCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const campaigns = await campaignsService.getMyCampaigns(req.user.userId);
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

    return res.status(200).json({ success: true, data: mapCampaign(campaign as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
};

export const updateCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const campaign = await campaignsService.updateCampaign(String(req.params.id), req.user.userId, req.user.role, req.body);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, data: mapCampaign(campaign as Record<string, unknown>) });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const update = await campaignsService.addCampaignUpdate({
      campaign_id: String(readCampaignId(req)),
      organizer_id: req.user.userId,
      content: req.body.content,
    });

    if (!update) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(201).json({ success: true, data: update });
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

    return res.status(200).json({ success: true, data: mapCampaign(campaign as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
};

export const approveCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const campaign = await campaignsService.adminReviewCampaign(String(req.params.id), 'approved');
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, data: mapCampaign(campaign as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
};

export const rejectCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const campaign = await campaignsService.adminReviewCampaign(String(req.params.id), 'rejected');
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, data: mapCampaign(campaign as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
};

export const suspendCampaign = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const campaign = await campaignsService.adminReviewCampaign(String(req.params.id), 'suspended');
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, data: mapCampaign(campaign as Record<string, unknown>) });
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
