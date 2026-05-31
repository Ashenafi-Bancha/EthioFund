import { bootstrapDatabase } from './bootstrap';
import { startServer } from '../server';

// Entry point used to start the server in production. It boots DB migrations
// and then starts the HTTP listener. Errors are considered fatal here.
const main = async (): Promise<void> => {
  await bootstrapDatabase();
  startServer();
};

main().catch((error: unknown) => {
  console.error('[start] Failed to start EthioFund backend:', error);
  process.exitCode = 1;
});