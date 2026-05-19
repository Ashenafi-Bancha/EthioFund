import pool from '../../config/db';

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
  const result = await pool.query(
    `INSERT INTO reports (report_type, generated_by)
     VALUES ($1, $2)
     RETURNING report_id, report_type, generated_date, generated_by`,
    [reportType, generatedBy]
  );
  return result.rows[0] || null;
};
