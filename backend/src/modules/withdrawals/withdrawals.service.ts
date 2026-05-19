import pool from '../../config/db';

type WithdrawalInput = {
  campaign_id: string;
  amount: number;
  bank_account?: string;
};

export const requestWithdrawal = async (organizerId: string, input: WithdrawalInput) => {
  const campaign = await pool.query<{ campaign_id: number; organizer_id: number }>(
    'SELECT campaign_id, organizer_id FROM campaigns WHERE campaign_id = $1',
    [input.campaign_id]
  );

  if ((campaign.rowCount || 0) === 0) {
    return null;
  }

  if (campaign.rows[0].organizer_id !== Number(organizerId)) {
    const error = new Error('Not authorized to request withdrawal for this campaign');
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO withdrawals (amount, status, bank_account, campaign_id)
     VALUES ($1, 'pending', $2, $3)
     RETURNING withdrawal_id, amount, status, bank_account, request_date, campaign_id`,
    [input.amount, input.bank_account || null, input.campaign_id]
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
    `SELECT w.withdrawal_id, w.amount, w.status, w.bank_account, w.request_date, w.campaign_id, c.title AS campaign_title, u.full_name AS organizer_name
     FROM withdrawals w
     LEFT JOIN campaigns c ON c.campaign_id = w.campaign_id
     LEFT JOIN users u ON u.user_id = c.organizer_id
     ORDER BY w.request_date DESC`
  );
  return result.rows;
};

export const updateWithdrawalStatus = async (withdrawalId: string, status: string) => {
  const result = await pool.query(
    'UPDATE withdrawals SET status = $1 WHERE withdrawal_id = $2 RETURNING withdrawal_id, amount, status, bank_account, request_date, campaign_id',
    [status, withdrawalId]
  );
  return result.rows[0] || null;
};
