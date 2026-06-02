import axios from 'axios';
import { randomBytes } from 'crypto';
import env from '../../config/env';
import pool from '../../config/db';
import { recordActivity } from '../../middleware/activityLogger';
import * as donationsService from '../donations/donations.service';

type ChapaInitializeApiResponse = {
  status?: string;
  data?: {
    checkout_url?: string;
  };
};

type ChapaVerifyApiResponse = {
  status?: string;
  data?: {
    status?: string;
    tx_ref?: string;
    payment_method?: string;
  };
};

type DonationContext = {
  donation_id: number;
  amount: string;
  payment_status: string;
  donor_id: number;
  campaign_id: number;
  full_name: string | null;
  email: string | null;
  campaign_title: string | null;
};

type PaymentRow = {
  id: number;
  tx_ref: string;
  donation_id: number | null;
  campaign_id: number;
  client_origin: string | null;
  amount: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
};

type VerifyOutcome = {
  txRef: string;
  status: 'success' | 'failed' | 'cancelled' | 'pending';
  source: 'verify' | 'idempotent';
  redirectBaseUrl: string;
};

const chapaClient = axios.create({
  baseURL: env.CHAPA_BASE_URL,
  headers: {
    Authorization: `Bearer ${env.CHAPA_SECRET_KEY || ''}`,
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

const isMockPaymentMode = () => {
  if (env.PAYMENT_MODE === 'mock') {
    return true;
  }

  if (env.PAYMENT_MODE === 'real') {
    return false;
  }

  return env.CHAPA_SECRET_KEY?.startsWith('CHASECK_TEST-') ?? true;
};

const getRedirectBaseUrl = (payment: { client_origin?: string | null } | null | undefined): string =>
  String(payment?.client_origin || env.CLIENT_URL || '').trim().replace(/\/$/, '');

const getDonationContext = async (donationId: string): Promise<DonationContext | null> => {
  const result = await pool.query<DonationContext>(
    `SELECT d.donation_id, d.amount, d.payment_status, d.donor_id, d.campaign_id,
            u.full_name, u.email, c.title AS campaign_title
     FROM donations d
     LEFT JOIN users u ON u.user_id = d.donor_id
     LEFT JOIN campaigns c ON c.campaign_id = d.campaign_id
     WHERE d.donation_id = $1`,
    [donationId]
  );

  return result.rows[0] || null;
};

const getPaymentByTxRef = async (txRef: string): Promise<PaymentRow | null> => {
  const result = await pool.query<PaymentRow>(
    'SELECT id, tx_ref, donation_id, campaign_id, client_origin, amount, status FROM payments WHERE tx_ref = $1 LIMIT 1',
    [txRef]
  );

  return result.rows[0] || null;
};

const generateTxRef = (): string => `ETHIOFUND-${randomBytes(12).toString('hex').toUpperCase()}`;

const normalizeVerifyStatus = (payload: ChapaVerifyApiResponse): 'success' | 'failed' | 'cancelled' | 'pending' => {
  const raw = String(payload.data?.status || payload.status || '')
    .toLowerCase()
    .trim();

  if (raw === 'success' || raw === 'successful') {
    return 'success';
  }

  if (raw === 'cancelled' || raw === 'canceled') {
    return 'cancelled';
  }

  if (raw === 'pending' || raw === 'processing' || raw === 'initiated' || raw === 'incomplete') {
    return 'pending';
  }

  return 'failed';
};

const verifyWithChapa = async (txRef: string): Promise<{ status: 'success' | 'failed' | 'cancelled' | 'pending'; paymentMethod?: string }> => {
  const response = await chapaClient.get<ChapaVerifyApiResponse>(`/transaction/verify/${encodeURIComponent(txRef)}`);
  return {
    status: normalizeVerifyStatus(response.data || {}),
    paymentMethod: response.data?.data?.payment_method,
  };
};

export const getClientBaseUrl = (): string => env.CLIENT_URL;

export const initializeDonationPayment = async (
  donationId: number,
  donorId: string,
  override?: {
    email?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    clientOrigin?: unknown;
  }
) => {
  const donation = await getDonationContext(String(donationId));
  if (!donation) {
    const error = new Error('Donation not found');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const mockMode = isMockPaymentMode();

  if (donation.payment_status === 'successful') {
    const error = new Error('Donation has already been paid');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const txRef = generateTxRef();
  const firstName = String(override?.firstName || donation.full_name?.split(' ')[0] || 'Donor').trim();
  const lastName = String(override?.lastName || donation.full_name?.split(' ').slice(1).join(' ') || 'User').trim();
  const email = String(override?.email || donation.email || '').trim();
  const clientOrigin = String(override?.clientOrigin || env.CLIENT_URL || '').trim().replace(/\/$/, '');
  const chapaDescription = (() => {
    const source = (donation.campaign_title || 'Campaign donation').trim();
    return source.length > 50 ? `${source.slice(0, 47)}...` : source;
  })();

  if (mockMode) {
    await pool.query(
      `INSERT INTO payments (tx_ref, donation_id, campaign_id, client_origin, donor_name, email, amount, status, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'success', 'mock-chapa')`,
      [txRef, donationId, donation.campaign_id, clientOrigin, `${firstName} ${lastName}`.trim(), email || 'test@ethiofund.local', donation.amount]
    );

    await pool.query(
      `INSERT INTO transactions (transaction_id, donation_id, gateway_name, transaction_status)
       VALUES ($1, $2, 'mock-chapa', 'successful')
       ON CONFLICT (transaction_id) DO NOTHING`,
      [txRef, donationId]
    );

    await donationsService.markDonationSuccessful(String(donationId));

    console.info(`[payments] mock checkout initialized tx_ref=${txRef} donation_id=${donationId}`);

    return {
      txRef,
      checkoutUrl: `${clientOrigin}/payment/success?tx_ref=${encodeURIComponent(txRef)}&mode=mock`,
    };
  }

  if (!email) {
    const error = new Error('Donor email is required for payment initialization');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  await pool.query(
    `INSERT INTO payments (tx_ref, donation_id, campaign_id, client_origin, donor_name, email, amount, status, payment_method)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'chapa')`,
    [txRef, donationId, donation.campaign_id, clientOrigin, `${firstName} ${lastName}`.trim(), email, donation.amount]
  );

  await pool.query(
    `INSERT INTO transactions (transaction_id, donation_id, gateway_name, transaction_status)
     VALUES ($1, $2, 'chapa', 'pending')
     ON CONFLICT (transaction_id) DO NOTHING`,
    [txRef, donationId]
  );

  try {
    const response = await chapaClient.post<ChapaInitializeApiResponse>('/transaction/initialize', {
      amount: donation.amount,
      currency: 'ETB',
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: `${env.SERVER_URL}/api/payments/webhook/chapa`,
      return_url: `${clientOrigin}/payment/success?tx_ref=${encodeURIComponent(txRef)}`,
      customization: {
        title: 'EthioFund Donate',
        description: chapaDescription,
      },
    });

    const checkoutUrl = response.data?.data?.checkout_url;
    if (!checkoutUrl) {
      throw new Error('Chapa did not return a checkout URL');
    }

    console.info(`[payments] initialized tx_ref=${txRef} donation_id=${donationId}`);

    return {
      txRef,
      checkoutUrl,
    };
  } catch (error) {
    await pool.query('UPDATE payments SET status = $1, updated_at = NOW() WHERE tx_ref = $2 AND status = $3', ['failed', txRef, 'pending']);
    await pool.query('UPDATE donations SET payment_status = $1 WHERE donation_id = $2 AND payment_status = $3', ['failed', donationId, 'pending']);
    await pool.query('UPDATE transactions SET transaction_status = $1 WHERE transaction_id = $2', ['failed', txRef]);

    const message = error instanceof Error ? error.message : 'Chapa initialize request failed';
    const details = axios.isAxiosError(error) ? JSON.stringify(error.response?.data ?? {}, null, 2) : '';
    console.error(`[payments] initialize failed tx_ref=${txRef}: ${message}${details ? ` | response=${details}` : ''}`);
    const appError = new Error(`Unable to initialize Chapa payment: ${message}`);
    (appError as Error & { statusCode?: number }).statusCode = 503;
    throw appError;
  }
};

export const verifyAndFinalizeTransaction = async (txRef: string): Promise<VerifyOutcome> => {
  if (!txRef) {
    const error = new Error('tx_ref is required');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  // 1. Initial lookup to see if we already processed this transaction.
  // This avoids reaching out to Chapa's external API if we have local certainty.
  const existing = await getPaymentByTxRef(txRef);
  if (!existing) {
    const error = new Error('Transaction not found');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  // 2. Idempotency Check:
  // If the transaction status is already finalized ('success', 'failed', 'cancelled'),
  // return immediately to prevent redundant database modifications or double-credits.
  if (existing.status !== 'pending') {
    console.info(`[payments] verify idempotent tx_ref=${txRef} status=${existing.status}`);
    return {
      txRef,
      status: existing.status === 'success' ? 'success' : existing.status,
      source: 'idempotent',
      redirectBaseUrl: getRedirectBaseUrl(existing),
    };
  }

  // 3. Verify status with Chapa's external API
  const chapaResult = await verifyWithChapa(txRef);
  const nextStatus = chapaResult.status;

  // 4. Database Transaction with Row Locking (FOR UPDATE):
  // Since both a user redirect and a Chapa webhook may hit the server simultaneously,
  // we acquire an exclusive database-level row lock on the payment record.
  // This guarantees mutual exclusion and serializability.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Acquire the lock. If another thread is writing to this row, this query blocks until the other commits.
    const lockResult = await client.query<PaymentRow>(
      'SELECT id, tx_ref, donation_id, campaign_id, client_origin, amount, status FROM payments WHERE tx_ref = $1 FOR UPDATE',
      [txRef]
    );

    if ((lockResult.rowCount || 0) === 0) {
      const error = new Error('Transaction not found');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    // Re-verify the locked status inside the critical section.
    // If the concurrent thread finished the transaction while we were waiting on the lock,
    // we bypass writing and return the now-finalized status.
    const locked = lockResult.rows[0];
    if (locked.status !== 'pending') {
      await client.query('COMMIT');
      return {
        txRef,
        status: locked.status === 'success' ? 'success' : locked.status,
        source: 'idempotent',
        redirectBaseUrl: getRedirectBaseUrl(locked),
      };
    }

    // 5. Apply the payment status updates locally
    await client.query(
      'UPDATE payments SET status = $1, payment_method = COALESCE($2, payment_method), updated_at = NOW() WHERE tx_ref = $3',
      [nextStatus, chapaResult.paymentMethod || null, txRef]
    );

    await client.query('UPDATE transactions SET transaction_status = $1 WHERE transaction_id = $2', [
      nextStatus === 'success' ? 'successful' : 'failed',
      txRef,
    ]);

    // 6. Complete the business logic (crediting campaign raised_amount)
    if (locked.donation_id) {
      if (nextStatus === 'success') {
        // Mark donation successful, ensuring we don't re-apply if already credited.
        const donationUpdate = await client.query<{ amount: string; campaign_id: number }>(
          `UPDATE donations
           SET payment_status = 'successful'
           WHERE donation_id = $1 AND payment_status <> 'successful'
           RETURNING amount, campaign_id`,
          [locked.donation_id]
        );

        // If the donation row was updated successfully, increment campaign financial records.
        if ((donationUpdate.rowCount || 0) > 0) {
          await client.query(
            `UPDATE campaigns
             SET raised_amount = raised_amount + $1,
                 total_donors = COALESCE(total_donors, 0) + 1
             WHERE campaign_id = $2`,
            [donationUpdate.rows[0].amount, donationUpdate.rows[0].campaign_id]
          );
          void recordActivity(null, 'Donation confirm');
        }
      } else if (nextStatus === 'failed' || nextStatus === 'cancelled') {
        // Handle failed payment states by transitioning the donation to failed
        await client.query(
          `UPDATE donations
           SET payment_status = 'failed'
           WHERE donation_id = $1 AND payment_status = 'pending'`,
          [locked.donation_id]
        );
      }
    }

    await client.query('COMMIT');
    console.info(`[payments] verification applied tx_ref=${txRef} status=${nextStatus}`);
    return {
      txRef,
      status: nextStatus,
      source: 'verify',
      redirectBaseUrl: getRedirectBaseUrl(locked),
    };
  } catch (error) {
    // Rollback ensures all statements fail atomically on database or runtime error.
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Release client back to the pool to prevent resource exhaustion.
    client.release();
  }
};

export const verifyTransaction = verifyAndFinalizeTransaction;

export const handleChapaWebhook = async (payload: { tx_ref?: string; data?: { tx_ref?: string } }) => {
  const txRef = String(payload.tx_ref || payload.data?.tx_ref || '').trim();
  if (!txRef) {
    const error = new Error('tx_ref is required');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  console.info(`[payments] webhook received tx_ref=${txRef}`);
  return verifyAndFinalizeTransaction(txRef);
};
