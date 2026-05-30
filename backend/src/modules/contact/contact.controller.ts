import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const submitContactMessage = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const message = String(req.body.message || '').trim();

    console.log('Contact form submission received:', { name, email, message });

    return res.status(200).json({
      success: true,
      message: 'Your message has been received. We will contact you soon.',
    });
  } catch (error) {
    return next(error);
  }
};