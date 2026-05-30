import app from './app';
import env from './config/env';

export const startServer = (): ReturnType<typeof app.listen> => {
  const port = env.PORT;

  return app.listen(port, () => {
    console.log(`EthioFund backend running on port ${port}`);
  });
};

if (require.main === module) {
  startServer();
}
