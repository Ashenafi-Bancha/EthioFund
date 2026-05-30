import { Pool, type PoolClient } from 'pg';
import env from './env';

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
});

export const pingDatabase = async (): Promise<void> => {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
};

export default pool;
