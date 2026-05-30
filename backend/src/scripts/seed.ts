import { runMigrations, seedDemoData, waitForDatabase } from './bootstrap';

const main = async (): Promise<void> => {
  await waitForDatabase();
  await runMigrations();
  await seedDemoData();
};

main().catch((error: unknown) => {
  console.error('[seed] Failed to seed demo data:', error);
  process.exitCode = 1;
});