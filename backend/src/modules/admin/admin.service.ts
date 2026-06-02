import pool from '../../config/db';
import { recordActivity } from '../../middleware/activityLogger';
import * as withdrawalsService from '../withdrawals/withdrawals.service';
import * as contactService from '../contact/contact.service';

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

export const getFullDashboard = async () => {
  const [
    totalUsersRes,
    totalCampaignsRes,
    totalDonationsRes,
    totalRaisedRes,
    pendingCampaignsRes,
    pendingWithdrawalsRes,
    recentActivityRes,
  ] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM users'),
    pool.query('SELECT COUNT(*)::int AS count FROM campaigns'),
    pool.query(`SELECT COUNT(*)::int AS count FROM donations WHERE payment_status = 'successful'`),
    pool.query(`SELECT COALESCE(SUM(raised_amount), 0)::float AS total FROM campaigns`),
    pool.query(`SELECT COUNT(*)::int AS count FROM campaigns WHERE status = 'pending'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM withdrawals WHERE status = 'pending'`),
    pool.query(
      `SELECT al.log_id, al.user_id, al.activity, al.timestamp, u.full_name
       FROM activity_logs al
       LEFT JOIN users u ON u.user_id = al.user_id
       ORDER BY al.timestamp DESC
       LIMIT 10`
    ),
  ]);

  return {
    total_users: totalUsersRes.rows[0].count,
    total_campaigns: totalCampaignsRes.rows[0].count,
    total_donations: totalDonationsRes.rows[0].count,
    total_raised: totalRaisedRes.rows[0].total,
    pending_campaigns: pendingCampaignsRes.rows[0].count,
    pending_withdrawals: pendingWithdrawalsRes.rows[0].count,
    recent_activity: recentActivityRes.rows.map((row) => ({
      log_id: row.log_id,
      user_id: row.user_id,
      activity: row.activity,
      timestamp: row.timestamp,
      full_name: row.full_name,
    })),
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

export const updateUserStatus = async (userId: string, status: string, requestingAdminId?: string) => {
  const targetUser = await pool.query<{ role: string }>('SELECT role FROM users WHERE user_id = $1', [userId]);
  if ((targetUser.rowCount || 0) > 0 && targetUser.rows[0].role === 'admin' && status === 'suspended') {
    const error = new Error('Cannot suspend an admin account');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    'UPDATE users SET status = $1 WHERE user_id = $2 RETURNING user_id, full_name, email, phone_number, role, status, created_at',
    [status, userId]
  );
  if (result.rows[0]) {
    void recordActivity(requestingAdminId ?? null, `Admin updated user ${userId} status to ${status}`);
  }
  return result.rows[0] || null;
};

export const getWithdrawalRequests = async () => withdrawalsService.getAllWithdrawals();

export const updateWithdrawalStatus = async (withdrawalId: string, status: string, adminId?: string | null) =>
  withdrawalsService.updateWithdrawalStatus(withdrawalId, status, adminId);

export const getContactMessages = async (status?: contactService.ContactMessageStatus) =>
  contactService.listContactMessages(status);

export const updateContactMessageStatus = async (messageId: string, status: contactService.ContactMessageStatus) =>
  contactService.updateContactMessageStatus(messageId, status);

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

export const getAnalyticsOverview = async () => {
  const [users, campaigns, donations, comments, activeCampaigns, pendingComments] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM users'),
    pool.query('SELECT COUNT(*)::int AS count FROM campaigns'),
    pool.query(`SELECT COUNT(*)::int AS count FROM donations WHERE payment_status = 'successful'`),
    pool.query('SELECT COUNT(*)::int AS count FROM comments'),
    pool.query(`SELECT COUNT(*)::int AS count FROM campaigns WHERE status = 'active'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM comments WHERE moderation_status = 'pending_review'`),
  ]);

  return {
    totalUsers: users.rows[0].count,
    totalCampaigns: campaigns.rows[0].count,
    totalDonations: donations.rows[0].count,
    totalComments: comments.rows[0].count,
    activeCampaigns: activeCampaigns.rows[0].count,
    pendingComments: pendingComments.rows[0].count,
  };
};

export const getDonationsByMonth = async (months = 6) => {
  const limitMonths = Number.isFinite(Number(months)) ? Math.max(1, Math.min(24, Number(months))) : 6;

  const result = await pool.query<{
    month: string;
    total_amount: string | number;
  }>(
    `
    SELECT to_char(date_trunc('month', d.donation_date), 'YYYY-MM') AS month,
           COALESCE(SUM(d.amount), 0)::float AS total_amount
    FROM donations d
    WHERE d.payment_status = 'successful'
      AND d.donation_date >= (date_trunc('month', NOW()) - ($1::int - 1) * INTERVAL '1 month')
    GROUP BY 1
    ORDER BY 1
    `,
    [limitMonths]
  );

  return result.rows.map((row) => ({
    month: row.month,
    totalAmount: Number(row.total_amount) || 0,
  }));
};

export const getCampaignStatusBreakdown = async () => {
  const result = await pool.query<{ status: string; count: number }>(
    `SELECT status, COUNT(*)::int AS count
     FROM campaigns
     GROUP BY status
     ORDER BY status`
  );

  return result.rows.map((row) => ({
    status: row.status,
    count: row.count,
  }));
};

export const getCommentModerationBreakdown = async () => {
  const result = await pool.query<{ moderation_status: string; count: number }>(
    `SELECT moderation_status, COUNT(*)::int AS count
     FROM comments
     GROUP BY moderation_status
     ORDER BY moderation_status`
  );

  return result.rows.map((row) => ({
    status: row.moderation_status,
    count: row.count,
  }));
};
