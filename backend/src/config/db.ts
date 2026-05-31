import { Pool, type PoolClient } from 'pg';
import env from './env';

// PostgreSQL connection pool used across services. Keep configuration
// centralized here so other modules can import a single `pool` instance.
const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
});

// Lightweight connectivity check for health probes. Does not keep a client
// open — always releases it back to the pool.
export const pingDatabase = async (): Promise<void> => {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
};

export default pool;
