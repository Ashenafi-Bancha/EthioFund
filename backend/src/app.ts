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
const allowedOrigins = new Set([
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

const isAllowedOrigin = (origin: string): boolean => {
  if (allowedOrigins.has(origin)) {
    return true;
  }

  return origin.endsWith('.trycloudflare.com');
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
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
  } catch {
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

const renderPaymentStatusPage = (title: string, message: string, accent: string) => (_req: express.Request, res: express.Response): void => {
  res
    .status(200)
    .type('html')
    .send(`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>EthioFund - ${title}</title>
          <style>
            :root { color-scheme: light; }
            body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: linear-gradient(135deg, #f8fafc, #eefbf2); color: #111827; }
            .wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
            .card { width: 100%; max-width: 720px; background: #fff; border-radius: 24px; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08); overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.25); }
            .hero { padding: 40px 32px; background: linear-gradient(135deg, ${accent}, #ffffff 65%); }
            .badge { display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.8); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
            h1 { margin: 18px 0 10px; font-size: 34px; line-height: 1.1; }
            p { margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6; }
            .body { padding: 24px 32px 32px; }
            .actions { margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap; }
            a { display: inline-flex; align-items: center; justify-content: center; padding: 12px 18px; border-radius: 14px; text-decoration: none; font-weight: 700; }
            .primary { background: #16a34a; color: white; }
            .secondary { background: #f3f4f6; color: #111827; }
            .ref { margin-top: 18px; padding: 14px 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 14px; font-size: 14px; color: #374151; word-break: break-all; }
            @media (max-width: 640px) { .hero, .body { padding-left: 20px; padding-right: 20px; } h1 { font-size: 28px; } }
          </style>
        </head>
        <body>
          <main class="wrap">
            <section class="card">
              <div class="hero">
                <div class="badge">EthioFund Payment</div>
                <h1>${title}</h1>
                <p>${message}</p>
              </div>
              <div class="body">
                <div class="actions">
                  <a class="primary" href="${env.CLIENT_URL}">Open EthioFund</a>
                  <a class="secondary" href="${env.CLIENT_URL}/campaigns">Browse campaigns</a>
                </div>
              </div>
            </section>
          </main>
        </body>
      </html>`);
};

app.get('/payment-success', renderPaymentStatusPage('Payment successful', 'Your donation was confirmed successfully. If you were redirected here from Chapa, your payment has been recorded.', '#dcfce7'));
app.get('/payment-failed', renderPaymentStatusPage('Payment not completed', 'The payment was not confirmed as successful. You can return to EthioFund and try again.', '#fee2e2'));
app.get('/payment-pending', renderPaymentStatusPage('Payment pending', 'Your payment is still being confirmed. Please wait a moment and check again if needed.', '#dbeafe'));

app.use(errorHandler);

export default app;
