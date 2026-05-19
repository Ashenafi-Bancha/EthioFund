import app from './app';
import env from './config/env';

const port = env.PORT;

app.listen(port, () => {
  console.log(`EthioFund backend running on port ${port}`);
});
