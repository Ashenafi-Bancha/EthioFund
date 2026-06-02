import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import env from '../../config/env';
import * as chapaService from './chapa.service';
import * as donationsService from '../donations/donations.service';

const paymentSuccessPath = '/payment/success';
const paymentFailedPath = '/payment/failed';

export const initializePayment = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const clientOrigin = String(req.get('origin') || req.body?.client_origin || env.CLIENT_URL || '').trim().replace(/\/$/, '');

    const amount = Number(req.body?.amount || 0);
    const campaignId = String(req.body?.campaign_id || '').trim();

    if (!Number.isFinite(amount) || amount <= 0 || !campaignId) {
      return res.status(400).json({ success: false, message: 'Donation amount must be greater than 0' });
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
      clientOrigin,
    });

    return res.status(200).json({
      success: true,
      data: {
        checkout_url: payment.checkoutUrl,
        tx_ref: payment.txRef,
        donation_id: donation.donation_id,
      },
    });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode === 502 || err.statusCode === 503) {
      return res.status(503).json({ success: false, message: 'Payment service unavailable' });
    }
    return next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const txRef = String(req.params.tx_ref || req.body?.tx_ref || req.query.tx_ref || '').trim();
    if (!txRef) {
      return res.status(400).json({ success: false, message: 'tx_ref is required' });
    }

    let result;
    try {
      result = await chapaService.verifyAndFinalizeTransaction(txRef);
    } catch (error) {
      const err = error as Error & { statusCode?: number };
      if (req.method === 'GET' && err.statusCode === 404) {
        const redirectUrl = `${env.CLIENT_URL.replace(/\/$/, '')}${paymentFailedPath}`;
        return res.redirect(302, redirectUrl);
      }
      throw error;
    }

    if (req.method === 'GET') {
      const base = result.redirectBaseUrl || chapaService.getClientBaseUrl();
      const path = result.status === 'success' ? paymentSuccessPath : paymentFailedPath;
      const redirectUrl = `${base.replace(/\/$/, '')}${path}?tx_ref=${encodeURIComponent(txRef)}`;
      return res.redirect(302, redirectUrl);
    }

    return res.status(200).json({ success: true, data: result });
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
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const stripeWebhook = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(501).json({ success: false, message: 'Stripe is not enabled for EthioFund' });
};
