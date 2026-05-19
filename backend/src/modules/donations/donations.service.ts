import pool from '../../config/db';

type DonationInput = {
  campaign_id: string;
  amount: number;
  is_anonymous?: boolean;
  message?: string;
};

type DonationRow = {
  donation_id: number;
  amount: string;
  donation_date: string;
  payment_status: 'pending' | 'successful' | 'failed';
  is_anonymous: boolean;
  donor_id: number;
  campaign_id: number;
};

export const createDonation = async (donorId: string, input: DonationInput): Promise<DonationRow> => {
  const campaign = await pool.query<{ status: string }>(
    'SELECT status FROM campaigns WHERE campaign_id = $1',
    [input.campaign_id]
  );

  if ((campaign.rowCount || 0) === 0) {
    const error = new Error('Campaign not found');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  if (!['approved', 'active'].includes(campaign.rows[0].status)) {
    const error = new Error('Campaign is not open for donations');
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  const result = await pool.query<DonationRow>(
    `INSERT INTO donations (amount, payment_status, is_anonymous, message, donor_id, campaign_id)
     VALUES ($1, 'pending', $2, $3, $4, $5)
     RETURNING donation_id, amount, donation_date, payment_status, is_anonymous, donor_id, campaign_id`,
    [input.amount, input.is_anonymous ?? false, input.message ?? null, donorId, input.campaign_id]
  );

  return result.rows[0];
};

export const getDonationById = async (donationId: string) => {
  const result = await pool.query<DonationRow>('SELECT * FROM donations WHERE donation_id = $1', [donationId]);
  return result.rows[0] || null;
};

export const getDonationsByCampaign = async (campaignId: string) => {
  const result = await pool.query(
    `SELECT d.donation_id, d.amount, d.donation_date, d.payment_status, d.is_anonymous,
            CASE WHEN d.is_anonymous THEN NULL ELSE u.full_name END AS donor_name,
            COALESCE(t.gateway_name, 'chapa') AS payment_method
     FROM donations d
     LEFT JOIN users u ON u.user_id = d.donor_id
     LEFT JOIN transactions t ON t.donation_id = d.donation_id
     WHERE d.campaign_id = $1
     ORDER BY d.donation_date DESC`,
    [campaignId]
  );
  return result.rows;
};

export const getDonationsByDonor = async (donorId: string) => {
  const result = await pool.query(
    `SELECT d.donation_id, d.amount, d.donation_date, d.payment_status, d.is_anonymous,
            c.campaign_id, c.title AS campaign_title,
            COALESCE(t.gateway_name, 'chapa') AS payment_method,
            u.full_name AS donor_name
     FROM donations d
     LEFT JOIN campaigns c ON c.campaign_id = d.campaign_id
     LEFT JOIN users u ON u.user_id = d.donor_id
     LEFT JOIN transactions t ON t.donation_id = d.donation_id
     WHERE d.donor_id = $1
     ORDER BY d.donation_date DESC`,
    [donorId]
  );
  return result.rows;
};

export const updateDonationStatus = async (donationId: string, status: DonationRow['payment_status']) => {
  const result = await pool.query<DonationRow>(
    'UPDATE donations SET payment_status = $1 WHERE donation_id = $2 RETURNING donation_id, amount, donation_date, payment_status, is_anonymous, donor_id, campaign_id',
    [status, donationId]
  );
  return result.rows[0] || null;
};

export const markDonationSuccessful = async (donationId: string) => {
  const donation = await getDonationById(donationId);
  if (!donation) {
    return null;
  }

  if (donation.payment_status === 'successful') {
    return donation;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE donations SET payment_status = $1 WHERE donation_id = $2', ['successful', donationId]);
    await client.query(
      'UPDATE campaigns SET raised_amount = raised_amount + $1, total_donors = COALESCE(total_donors, 0) + 1 WHERE campaign_id = $2',
      [donation.amount, donation.campaign_id]
    );
    await client.query('COMMIT');
    return { ...donation, payment_status: 'successful' as const };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const markDonationFailed = async (donationId: string) => {
  return updateDonationStatus(donationId, 'failed');
};
