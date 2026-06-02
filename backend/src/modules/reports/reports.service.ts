import pool from '../../config/db';

type StatusCounts = Record<string, number>;
type CategoryCounts = Record<string, number>;

const emptyStatusCounts = (): StatusCounts => ({
  pending: 0,
  approved: 0,
  active: 0,
  closed: 0,
  rejected: 0,
  suspended: 0,
});

const emptyCategoryCounts = (): CategoryCounts => ({
  medical: 0,
  education: 0,
  funeral: 0,
  emergency: 0,
  community: 0,
});

const getCampaignReport = async () => {
  const [totalRes, byStatusRes, byCategoryRes, top5Res] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM campaigns'),
    pool.query('SELECT status, COUNT(*)::int AS count FROM campaigns GROUP BY status'),
    pool.query('SELECT category, COUNT(*)::int AS count FROM campaigns GROUP BY category'),
    pool.query(
      `SELECT campaign_id, title, raised_amount, goal_amount, status, category
       FROM campaigns
       ORDER BY raised_amount DESC
       LIMIT 5`
    ),
  ]);

  const by_status = emptyStatusCounts();
  for (const row of byStatusRes.rows) {
    by_status[row.status] = row.count;
  }

  const by_category = emptyCategoryCounts();
  for (const row of byCategoryRes.rows) {
    by_category[row.category] = row.count;
  }

  return {
    total_campaigns: totalRes.rows[0].count,
    by_status,
    by_category,
    top_5_by_raised: top5Res.rows,
  };
};

const getDonationReport = async () => {
  const [totalsRes, byStatusRes, monthlyRes] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total_count,
              COALESCE(SUM(amount) FILTER (WHERE payment_status = 'successful'), 0)::float AS total_amount
       FROM donations`
    ),
    pool.query('SELECT payment_status, COUNT(*)::int AS count FROM donations GROUP BY payment_status'),
    pool.query(
      `SELECT DATE_TRUNC('month', donation_date) AS month,
              COUNT(*)::int AS count,
              COALESCE(SUM(amount), 0)::float AS total
       FROM donations
       WHERE donation_date >= NOW() - INTERVAL '6 months'
       GROUP BY month
       ORDER BY month`
    ),
  ]);

  const by_status = { pending: 0, successful: 0, failed: 0 };
  for (const row of byStatusRes.rows) {
    if (row.payment_status in by_status) {
      by_status[row.payment_status as keyof typeof by_status] = row.count;
    }
  }

  return {
    total_count: totalsRes.rows[0].total_count,
    total_amount: totalsRes.rows[0].total_amount,
    by_status,
    monthly_totals: monthlyRes.rows,
  };
};

const getUserReport = async () => {
  const [totalRes, byRoleRes, byStatusRes, monthlyRes] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM users'),
    pool.query('SELECT role, COUNT(*)::int AS count FROM users GROUP BY role'),
    pool.query('SELECT status, COUNT(*)::int AS count FROM users GROUP BY status'),
    pool.query(
      `SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*)::int AS count
       FROM users
       WHERE created_at >= NOW() - INTERVAL '6 months'
       GROUP BY month
       ORDER BY month`
    ),
  ]);

  const by_role = { donor: 0, organizer: 0, admin: 0 };
  for (const row of byRoleRes.rows) {
    if (row.role in by_role) {
      by_role[row.role as keyof typeof by_role] = row.count;
    }
  }

  const by_status = { active: 0, suspended: 0 };
  for (const row of byStatusRes.rows) {
    if (row.status in by_status) {
      by_status[row.status as keyof typeof by_status] = row.count;
    }
  }

  return {
    total_users: totalRes.rows[0].count,
    by_role,
    by_status,
    monthly_registrations: monthlyRes.rows,
  };
};

const getFinancialReport = async () => {
  const [raisedRes, withdrawnRes, pendingRes, transactionsRes] = await Promise.all([
    pool.query('SELECT COALESCE(SUM(raised_amount), 0)::float AS total FROM campaigns'),
    pool.query(`SELECT COALESCE(SUM(amount), 0)::float AS total FROM withdrawals WHERE status = 'approved'`),
    pool.query(`SELECT COALESCE(SUM(amount), 0)::float AS total FROM withdrawals WHERE status = 'pending'`),
    pool.query(`SELECT COALESCE(SUM(amount), 0)::float AS total FROM donations WHERE payment_status = 'successful'`),
  ]);

  return {
    total_raised: raisedRes.rows[0].total,
    total_withdrawn_approved: withdrawnRes.rows[0].total,
    pending_withdrawal_total: pendingRes.rows[0].total,
    successful_transaction_total: transactionsRes.rows[0].total,
  };
};

export const getReportData = async (reportType: string) => {
  switch (reportType) {
    case 'campaign':
      return getCampaignReport();
    case 'donation':
      return getDonationReport();
    case 'user':
      return getUserReport();
    case 'financial':
      return getFinancialReport();
    default: {
      const error = new Error('Invalid report type. Must be: campaign, donation, user, or financial');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }
  }
};

export const saveReportRecord = async (reportType: string, generatedBy: string) => {
  await pool.query('INSERT INTO reports (report_type, generated_by) VALUES ($1, $2)', [reportType, generatedBy]);
};

export const getReports = async () => {
  const result = await pool.query(
    `SELECT r.report_id, r.report_type, r.generated_date, r.generated_by, u.full_name AS generated_by_name
     FROM reports r
     LEFT JOIN users u ON u.user_id = r.generated_by
     ORDER BY r.generated_date DESC`
  );
  return result.rows;
};

export const generateReport = async (reportType: string, generatedBy: string) => {
  const data = await getReportData(reportType);

  const result = await pool.query(
    `INSERT INTO reports (report_type, generated_by)
     VALUES ($1, $2)
     RETURNING report_id, report_type, generated_date, generated_by`,
    [reportType, generatedBy]
  );

  return {
    ...(result.rows[0] || {}),
    data,
  };
};
