import { runMigrations, seedDemoData, waitForDatabase } from './bootstrap';

// Seed demo data into the database. Intended for development and CI where
// test data is helpful; avoid running on production unless intentional.
const main = async (): Promise<void> => {
  await waitForDatabase();
  await runMigrations();
  await seedDemoData();
};

main().catch((error: unknown) => {
  console.error('[seed] Failed to seed demo data:', error);
  process.exitCode = 1;
});