import app from './app';
import env from './config/env';

// Starts the HTTP server. Exported so tests can import and manage the server
// lifecycle without starting a real listener.
export const startServer = (): ReturnType<typeof app.listen> => {
  const port = env.PORT;

  return app.listen(port, () => {
    console.log(`EthioFund backend running on port ${port}`);
  });
};

// When run directly (node server.js), start the server. This guard prevents
// the server from auto-starting during test imports.
if (require.main === module) {
  startServer();
}
