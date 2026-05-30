import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import env from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import campaignsRoutes from './modules/campaigns/campaigns.routes';
import donationsRoutes from './modules/donations/donations.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import commentsRoutes from './modules/comments/comments.routes';
import withdrawalsRoutes from './modules/withdrawals/withdrawals.routes';
import adminRoutes from './modules/admin/admin.routes';
import reportsRoutes from './modules/reports/reports.routes';
import contactRoutes from './modules/contact/contact.routes';
import { pingDatabase } from './config/db';

const app: Application = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

const respondToHealthCheck = async (_req: express.Request, res: express.Response): Promise<void> => {
  try {
    await pingDatabase();
    res.json({ status: 'OK', database: 'Connected' });
  } catch (_error) {
    res.status(503).json({ status: 'OK', database: 'Disconnected' });
  }
};

app.get('/health', respondToHealthCheck);
app.get('/api/health', respondToHealthCheck);
app.get('/api', (_req, res) => {
  res.json({ success: true, message: 'EthioFund API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/payment', paymentsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/withdrawals', withdrawalsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/contact', contactRoutes);

app.use(errorHandler);

export default app;
