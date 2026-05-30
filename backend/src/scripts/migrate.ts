import { runMigrations, waitForDatabase } from './bootstrap';

const main = async (): Promise<void> => {
  await waitForDatabase();
  await runMigrations();
};

main().catch((error: unknown) => {
  console.error('[migrate] Failed to apply schema:', error);
  process.exitCode = 1;
});