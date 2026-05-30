import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as commentsService from './comments.service';

export const addComment = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await commentsService.addComment(req.user.userId, req.body.campaign_id, req.body.content);

    if (!result.comment) {
      return res.status(500).json({ success: false, message: 'Failed to save comment' });
    }

    if (result.moderation.decision === 'approved') {
      return res.status(201).json({
        success: true,
        message: 'Comment published successfully',
        comment: result.comment,
        moderation: result.moderation,
      });
    }

    return res.status(202).json({
      success: true,
      message: 'Comment submitted for review',
      comment: result.comment,
      moderation: result.moderation,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCampaignComments = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const comments = await commentsService.getCommentsByCampaign(String(req.params.campaign_id));
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    return next(error);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const deleted = await commentsService.deleteComment(String(req.params.id), req.user.userId, req.user.role);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    return res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

export const getPendingComments = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const comments = await commentsService.getPendingComments();
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    return next(error);
  }
};

export const reviewComment = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const decision = String(req.body.decision || '').toLowerCase();
    const reason = req.body.reason ? String(req.body.reason) : undefined;
    const comment = await commentsService.reviewComment(String(req.params.id), decision as 'approved' | 'rejected', reason);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    return res.status(200).json({
      success: true,
      message: decision === 'approved' ? 'Comment approved' : 'Comment rejected',
      comment,
    });
  } catch (error) {
    return next(error);
  }
};
