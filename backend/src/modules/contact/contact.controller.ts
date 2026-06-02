import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as contactService from './contact.service';

export const submitContactMessage = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg, errors: errors.array() });
    }

    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const message = String(req.body.message || '').trim();

    const saved = await contactService.createContactMessage(name, email, message);

    return res.status(201).json({
      success: true,
      message: 'Your message has been received. We will contact you soon.',
      data: saved,
    });
  } catch (error) {
    return next(error);
  }
};

export const getContactMessages = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const messages = await contactService.listContactMessages(
      status === 'new' || status === 'read' || status === 'archived' ? status : undefined
    );
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return next(error);
  }
};

export const updateContactMessageStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const status = String(req.body.status || '').trim() as contactService.ContactMessageStatus;
    if (!['new', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be new, read, or archived' });
    }

    const updated = await contactService.updateContactMessageStatus(String(req.params.id), status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};
