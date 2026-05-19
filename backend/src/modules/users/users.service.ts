import pool from '../../config/db';

type UserRecord = {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  status: string;
  created_at: string;
};

type UpdateInput = {
  full_name?: string;
  phone_number?: string;
};

export const getById = async (userId: string): Promise<UserRecord | null> => {
  const result = await pool.query<UserRecord>(
    `SELECT user_id, full_name, email, phone_number, role, status, created_at
     FROM users WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

export const update = async (userId: string, { full_name, phone_number }: UpdateInput): Promise<UserRecord | null> => {
  const result = await pool.query<UserRecord>(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         phone_number = COALESCE($2, phone_number)
     WHERE user_id = $3
     RETURNING user_id, full_name, email, phone_number, role, status, created_at`,
    [full_name ?? null, phone_number ?? null, userId]
  );

  return result.rows[0] || null;
};
