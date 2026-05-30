import { bootstrapDatabase } from './bootstrap';
import { startServer } from '../server';

const main = async (): Promise<void> => {
  await bootstrapDatabase();
  startServer();
};

main().catch((error: unknown) => {
  console.error('[start] Failed to start EthioFund backend:', error);
  process.exitCode = 1;
});