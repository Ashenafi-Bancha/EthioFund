import type { NextFunction, Request, Response } from 'express';
import * as chapaService from './chapa.service';
import * as donationsService from '../donations/donations.service';

export const initializePayment = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const donationId = Number(req.body?.donation_id || 0);

    if (donationId > 0) {
      const payment = await chapaService.initializeDonationPayment(donationId, req.user.userId, {
        email: req.body?.email,
        firstName: req.body?.first_name,
        lastName: req.body?.last_name,
      });

      return res.status(200).json({ success: true, payment });
    }

    const amount = Number(req.body?.amount || 0);
    const campaignId = String(req.body?.campaign_id || '').trim();

    if (!Number.isFinite(amount) || amount <= 0 || !campaignId) {
      return res.status(400).json({ success: false, message: 'amount and campaign_id are required' });
    }

    const donation = await donationsService.createDonation(req.user.userId, {
      campaign_id: campaignId,
      amount,
      is_anonymous: Boolean(req.body?.is_anonymous),
      message: typeof req.body?.message === 'string' ? req.body.message : undefined,
    });

    const payment = await chapaService.initializeDonationPayment(donation.donation_id, req.user.userId, {
      email: req.body?.email,
      firstName: req.body?.first_name,
      lastName: req.body?.last_name,
    });

    return res.status(201).json({ success: true, donation, payment });
  } catch (error) {
    return next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const txRef = String(req.body?.tx_ref || req.query.tx_ref || '').trim();
    if (!txRef) {
      return res.status(400).json({ success: false, message: 'tx_ref is required' });
    }

    const result = await chapaService.verifyAndFinalizeTransaction(txRef);

    if (req.method === 'GET') {
      const path = result.status === 'success' ? '/payment-success' : '/payment-failed';
      const redirectUrl = `${chapaService.getClientBaseUrl()}${path}?tx_ref=${encodeURIComponent(txRef)}`;
      return res.redirect(302, redirectUrl);
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    return next(error);
  }
};

export const chapaWebhook = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const payload = req.body as { tx_ref?: string; data?: { tx_ref?: string } };
    const txRef = String(payload.tx_ref || payload.data?.tx_ref || '').trim();

    if (!txRef) {
      return res.status(400).json({ success: false, message: 'tx_ref is required' });
    }

    const result = await chapaService.verifyAndFinalizeTransaction(txRef);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return next(error);
  }
};

export const stripeWebhook = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(501).json({ success: false, message: 'Stripe is not enabled for EthioFund' });
};
