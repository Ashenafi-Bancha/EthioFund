import { Pool, type PoolClient } from 'pg';
import env from './env';

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
});

pool
  .connect()
  .then((client: PoolClient) => {
    console.log('PostgreSQL connected successfully');
    client.release();
  })
  .catch((error: Error) => {
    console.error('PostgreSQL connection failed:', error.message);
  });

export default pool;
