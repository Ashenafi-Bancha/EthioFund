import { runMigrations, waitForDatabase } from './bootstrap';

// Apply database schema migrations. This script is safe to run repeatedly
// and is suitable for CI/CD migration steps.
const main = async (): Promise<void> => {
  await waitForDatabase();
  await runMigrations();
};

main().catch((error: unknown) => {
  console.error('[migrate] Failed to apply schema:', error);
  process.exitCode = 1;
});