import { readFile } from 'fs/promises';
import path from 'path';
import type { PoolClient } from 'pg';
import pool from '../config/db';

const bootstrapStateTable = 'app_bootstrap_state';
const schemaFilePath = path.resolve(process.cwd(), 'database', 'schema.sql');
const seedFilePath = path.resolve(process.cwd(), 'database', 'seed.sql');

const delay = async (milliseconds: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

export const waitForDatabase = async (maxAttempts = 30, retryDelayMs = 2000): Promise<void> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      if (attempt > 1) {
        console.log(`[bootstrap] PostgreSQL is ready after ${attempt} attempt(s)`);
      }
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        console.log(`[bootstrap] Waiting for PostgreSQL (${attempt}/${maxAttempts})...`);
        await delay(retryDelayMs);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to reach PostgreSQL');
};

const ensureBootstrapStateTable = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${bootstrapStateTable} (
      step TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const hasBootstrapStep = async (step: string): Promise<boolean> => {
  const result = await pool.query<{ step: string }>(`SELECT step FROM ${bootstrapStateTable} WHERE step = $1 LIMIT 1`, [step]);
  return result.rowCount !== 0;
};

const markBootstrapStep = async (client: PoolClient, step: string): Promise<void> => {
  await client.query(`INSERT INTO ${bootstrapStateTable} (step) VALUES ($1) ON CONFLICT (step) DO NOTHING`, [step]);
};

export const runMigrations = async (): Promise<void> => {
  const schemaSql = await readFile(schemaFilePath, 'utf8');
  console.log('[bootstrap] Applying database schema');
  await pool.query(schemaSql);
};

export const seedDemoData = async (): Promise<void> => {
  await ensureBootstrapStateTable();

  if (await hasBootstrapStep('seed:v1')) {
    console.log('[bootstrap] Demo data already present');
    return;
  }

  const seedSql = await readFile(seedFilePath, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(seedSql.replace(/^CREATE EXTENSION IF NOT EXISTS pgcrypto;\s*/i, ''));
    await markBootstrapStep(client, 'seed:v1');
    await client.query('COMMIT');
    console.log('[bootstrap] Demo data seeded');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const bootstrapDatabase = async (): Promise<void> => {
  await waitForDatabase();
  await runMigrations();
  await seedDemoData();
};