import pool from '../../config/db';
import { recordActivity } from '../../middleware/activityLogger';

export const getDashboardStats = async () => {
  const [users, campaigns, donations, withdrawals] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM users'),
    pool.query('SELECT COUNT(*)::int AS count FROM campaigns'),
    pool.query('SELECT COUNT(*)::int AS count FROM donations WHERE payment_status = $1', ['successful']),
    pool.query('SELECT COUNT(*)::int AS count FROM withdrawals'),
  ]);

  return {
    users: users.rows[0].count,
    campaigns: campaigns.rows[0].count,
    donations: donations.rows[0].count,
    withdrawals: withdrawals.rows[0].count,
  };
};

export const getAllUsers = async () => {
  const result = await pool.query(
    'SELECT user_id, full_name, email, phone_number, role, status, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

export const updateUserRole = async (userId: string, role: string) => {
  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE user_id = $2 RETURNING user_id, full_name, email, phone_number, role, status, created_at',
    [role, userId]
  );
  if (result.rows[0]) {
    void recordActivity(null, `Admin updated user ${userId} role to ${role}`);
  }
  return result.rows[0] || null;
};

export const updateUserStatus = async (userId: string, status: string) => {
  const result = await pool.query(
    'UPDATE users SET status = $1 WHERE user_id = $2 RETURNING user_id, full_name, email, phone_number, role, status, created_at',
    [status, userId]
  );
  if (result.rows[0]) {
    void recordActivity(null, `Admin updated user ${userId} status to ${status}`);
  }
  return result.rows[0] || null;
};

export const getWithdrawalRequests = async () => {
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
  if (result.rows[0]) {
    void recordActivity(null, `Admin updated withdrawal ${withdrawalId} status to ${status}`);
  }
  return result.rows[0] || null;
};

export const reviewCampaign = async (campaignId: string, status: string) => {
  const result = await pool.query(
    'UPDATE campaigns SET status = $1 WHERE campaign_id = $2 RETURNING campaign_id, title, description, goal_amount, raised_amount, status, category, organizer_id, created_at',
    [status, campaignId]
  );
  if (result.rows[0]) {
    void recordActivity(null, `Admin reviewed campaign ${campaignId} as ${status}`);
  }
  return result.rows[0] || null;
};

export const getActivityLogs = async (limit = 100) => {
  const result = await pool.query(
    `SELECT l.log_id, l.user_id, l.activity, l.timestamp, u.full_name AS user_name, u.role AS user_role
     FROM activity_logs l
     LEFT JOIN users u ON u.user_id = l.user_id
     ORDER BY l.timestamp DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
};
