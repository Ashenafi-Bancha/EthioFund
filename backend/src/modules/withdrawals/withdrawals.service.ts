import pool from '../../config/db';
import { recordActivity } from '../../middleware/activityLogger';

type WithdrawalInput = {
  campaign_id: string;
  amount: number;
  bank_account?: string;
};

type ServiceError = Error & { statusCode?: number };

const getCampaignFinancials = async (campaignId: string) => {
  const result = await pool.query<{
    campaign_id: number;
    organizer_id: number;
    raised_amount: string;
    bank_account: string | null;
    payout_phone: string | null;
    pending_reserved: string;
  }>(
    `SELECT c.campaign_id,
            c.organizer_id,
            c.raised_amount,
            c.bank_account,
            c.payout_phone,
            COALESCE((
              SELECT SUM(w.amount)
              FROM withdrawals w
              WHERE w.campaign_id = c.campaign_id AND w.status = 'pending'
            ), 0) AS pending_reserved
     FROM campaigns c
     WHERE c.campaign_id = $1`,
    [campaignId]
  );

  return result.rows[0] || null;
};

export const getAvailableBalance = (raisedAmount: number, pendingReserved: number): number =>
  Math.max(raisedAmount - pendingReserved, 0);

export const requestWithdrawal = async (organizerId: string, input: WithdrawalInput) => {
  const campaign = await getCampaignFinancials(input.campaign_id);

  if (!campaign) {
    return null;
  }

  if (campaign.organizer_id !== Number(organizerId)) {
    const error: ServiceError = new Error('Not authorized to request withdrawal for this campaign');
    error.statusCode = 403;
    throw error;
  }

  const raisedAmount = Number(campaign.raised_amount);
  const pendingReserved = Number(campaign.pending_reserved);
  const available = getAvailableBalance(raisedAmount, pendingReserved);

  if (input.amount > available) {
    const error: ServiceError = new Error('Insufficient funds for this withdrawal');
    error.statusCode = 400;
    throw error;
  }

  const existingPending = await pool.query(
    `SELECT withdrawal_id FROM withdrawals WHERE campaign_id = $1 AND status = 'pending' LIMIT 1`,
    [input.campaign_id]
  );
  if ((existingPending.rowCount || 0) > 0) {
    const error: ServiceError = new Error('A withdrawal request is already pending for this campaign');
    error.statusCode = 400;
    throw error;
  }

  const bankAccount = (input.bank_account || campaign.bank_account || '').trim();
  if (!bankAccount) {
    const error: ServiceError = new Error('Bank account is required for withdrawal');
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO withdrawals (amount, status, bank_account, campaign_id)
     VALUES ($1, 'pending', $2, $3)
     RETURNING withdrawal_id, amount, status, bank_account, request_date, campaign_id`,
    [input.amount, bankAccount, input.campaign_id]
  );

  return result.rows[0] || null;
};

export const getMyWithdrawals = async (organizerId: string) => {
  const result = await pool.query(
    `SELECT w.withdrawal_id, w.amount, w.status, w.bank_account, w.request_date, w.campaign_id, c.title AS campaign_title
     FROM withdrawals w
     LEFT JOIN campaigns c ON c.campaign_id = w.campaign_id
     WHERE c.organizer_id = $1
     ORDER BY w.request_date DESC`,
    [organizerId]
  );
  return result.rows;
};

export const getAllWithdrawals = async () => {
  const result = await pool.query(
    `SELECT w.withdrawal_id, w.amount, w.status, w.bank_account, w.request_date, w.campaign_id,
            c.title AS campaign_title, c.raised_amount, c.bank_account AS campaign_bank_account,
            u.full_name AS organizer_name
     FROM withdrawals w
     LEFT JOIN campaigns c ON c.campaign_id = w.campaign_id
     LEFT JOIN users u ON u.user_id = c.organizer_id
     ORDER BY w.request_date DESC`
  );
  return result.rows;
};

export const updateWithdrawalStatus = async (
  withdrawalId: string,
  status: string,
  adminId?: string | null
) => {
  if (status === 'approved') {
    return approveWithdrawal(withdrawalId, adminId);
  }

  if (status === 'rejected') {
    return rejectWithdrawal(withdrawalId, adminId);
  }

  const result = await pool.query(
    'UPDATE withdrawals SET status = $1 WHERE withdrawal_id = $2 RETURNING withdrawal_id, amount, status, bank_account, request_date, campaign_id',
    [status, withdrawalId]
  );
  return result.rows[0] || null;
};

export const approveWithdrawal = async (withdrawalId: string, adminId?: string | null) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const withdrawalResult = await client.query<{
      withdrawal_id: number;
      amount: string;
      status: string;
      campaign_id: number;
    }>(
      `SELECT withdrawal_id, amount, status, campaign_id
       FROM withdrawals
       WHERE withdrawal_id = $1
       FOR UPDATE`,
      [withdrawalId]
    );

    if ((withdrawalResult.rowCount || 0) === 0) {
      const error: ServiceError = new Error('Withdrawal not found');
      error.statusCode = 404;
      throw error;
    }

    const withdrawal = withdrawalResult.rows[0];

    if (withdrawal.status === 'approved') {
      await client.query('COMMIT');
      return pool.query(
        'SELECT withdrawal_id, amount, status, bank_account, request_date, campaign_id FROM withdrawals WHERE withdrawal_id = $1',
        [withdrawalId]
      ).then((r) => r.rows[0] || null);
    }

    if (withdrawal.status !== 'pending') {
      const error: ServiceError = new Error('Only pending withdrawals can be approved');
      error.statusCode = 400;
      throw error;
    }

    const amount = Number(withdrawal.amount);

    const campaignUpdate = await client.query<{ raised_amount: string }>(
      `UPDATE campaigns
       SET raised_amount = raised_amount - $1
       WHERE campaign_id = $2 AND raised_amount >= $1
       RETURNING raised_amount`,
      [amount, withdrawal.campaign_id]
    );

    if ((campaignUpdate.rowCount || 0) === 0) {
      const error: ServiceError = new Error('Insufficient campaign balance to approve this withdrawal');
      error.statusCode = 400;
      throw error;
    }

    const statusUpdate = await client.query(
      `UPDATE withdrawals
       SET status = 'approved'
       WHERE withdrawal_id = $1
       RETURNING withdrawal_id, amount, status, bank_account, request_date, campaign_id`,
      [withdrawalId]
    );

    await client.query('COMMIT');

    void recordActivity(adminId ?? null, `Approved withdrawal ${withdrawalId} for campaign ${withdrawal.campaign_id}`);

    return statusUpdate.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const rejectWithdrawal = async (withdrawalId: string, adminId?: string | null) => {
  const result = await pool.query(
    `UPDATE withdrawals
     SET status = 'rejected'
     WHERE withdrawal_id = $1 AND status = 'pending'
     RETURNING withdrawal_id, amount, status, bank_account, request_date, campaign_id`,
    [withdrawalId]
  );

  if (!result.rows[0]) {
    const existing = await pool.query('SELECT status FROM withdrawals WHERE withdrawal_id = $1', [withdrawalId]);
    if ((existing.rowCount || 0) === 0) {
      const error: ServiceError = new Error('Withdrawal not found');
      (error as ServiceError & { statusCode?: number }).statusCode = 404;
      throw error;
    }
    if (existing.rows[0].status === 'rejected') {
      return pool.query(
        'SELECT withdrawal_id, amount, status, bank_account, request_date, campaign_id FROM withdrawals WHERE withdrawal_id = $1',
        [withdrawalId]
      ).then((r) => r.rows[0] || null);
    }
    const error: ServiceError = new Error('Only pending withdrawals can be rejected');
    error.statusCode = 400;
    throw error;
  }

  void recordActivity(adminId ?? null, `Rejected withdrawal ${withdrawalId}`);

  return result.rows[0];
};
