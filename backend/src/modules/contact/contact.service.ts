import pool from '../../config/db';

export type ContactMessageStatus = 'new' | 'read' | 'archived';

export type ContactMessageRow = {
  message_id: number;
  name: string;
  email: string;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
};

export const createContactMessage = async (name: string, email: string, message: string): Promise<ContactMessageRow> => {
  const result = await pool.query<ContactMessageRow>(
    `INSERT INTO contact_messages (name, email, message, status)
     VALUES ($1, $2, $3, 'new')
     RETURNING message_id, name, email, message, status, created_at`,
    [name, email, message]
  );

  return result.rows[0];
};

export const listContactMessages = async (status?: ContactMessageStatus): Promise<ContactMessageRow[]> => {
  if (status) {
    const result = await pool.query<ContactMessageRow>(
      `SELECT message_id, name, email, message, status, created_at
       FROM contact_messages
       WHERE status = $1
       ORDER BY created_at DESC`,
      [status]
    );
    return result.rows;
  }

  const result = await pool.query<ContactMessageRow>(
    `SELECT message_id, name, email, message, status, created_at
     FROM contact_messages
     ORDER BY created_at DESC`
  );
  return result.rows;
};

export const updateContactMessageStatus = async (
  messageId: string,
  status: ContactMessageStatus
): Promise<ContactMessageRow | null> => {
  const result = await pool.query<ContactMessageRow>(
    `UPDATE contact_messages
     SET status = $1
     WHERE message_id = $2
     RETURNING message_id, name, email, message, status, created_at`,
    [status, messageId]
  );
  return result.rows[0] || null;
};

export const countNewContactMessages = async (): Promise<number> => {
  const result = await pool.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM contact_messages WHERE status = 'new'`
  );
  return result.rows[0]?.count ?? 0;
};
