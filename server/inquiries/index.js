// Wires the inquiry automation into the Express app and starts the in-process worker.

import { loadConfig } from './config.js';
import { createDb } from './db.js';
import { createResendProvider, createUnconfiguredProvider } from './emailProvider.js';
import { createInquiryService } from './service.js';
import { createInquiryRouter, jsonErrorHandler } from './routes.js';

export const setupInquiries = async (app, { env = process.env, logger = console } = {}) => {
  const config = loadConfig(env);

  if (config.production && !/^postgres(ql)?:\/\//.test(config.databaseUrl || '')) {
    // Local SQLite would live on the host's ephemeral disk and lose leads on redeploy.
    logger.error('[inquiries] DATABASE_URL must be a PostgreSQL URL in production. Inquiry endpoints are disabled.');
    app.post(['/api/inquiries', '/api/inquiry'], (req, res) =>
      res.status(503).json({ success: false, message: "We couldn't submit your inquiry. Please try again." })
    );
    return null;
  }

  let db;
  try {
    db = await createDb(config.databaseUrl);
  } catch (err) {
    // Keep the website up; only the inquiry endpoints are unavailable until the database is fixed.
    logger.error(`[inquiries] database connection failed (${err.code || 'error'}): ${err.message}. Inquiry endpoints are disabled.`);
    if (err.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      logger.error('[inquiries] Set DATABASE_CA_CERT to your database provider\'s CA certificate (Supabase → Database → SSL Configuration).');
    }
    app.all(['/api/inquiries', '/api/inquiry', '/api/admin/*', '/api/cron/inquiries', '/api/webhooks/resend'], (req, res) =>
      res.status(503).json({ success: false, message: "We couldn't submit your inquiry. Please try again." })
    );
    return null;
  }
  const provider = config.email.provider === 'resend'
    ? createResendProvider({ apiKey: config.email.resendApiKey, from: config.email.from })
    : createUnconfiguredProvider();
  const service = createInquiryService({ db, config, provider, logger });

  let running = false;
  const runTick = async () => {
    if (running) return;
    running = true;
    try {
      await service.tick();
    } catch (err) {
      logger.error('[inquiries] worker tick failed:', err.message);
    } finally {
      running = false;
    }
  };

  app.use(createInquiryRouter({ service, config, logger, onAccepted: () => setImmediate(runTick) }));
  app.use(jsonErrorHandler);

  const timer = setInterval(runTick, config.queue.pollIntervalMs);
  timer.unref();
  setImmediate(runTick);

  logger.log(
    `[inquiries] ready — db: ${db.engine}, email: ${config.email.provider}${config.email.provider === 'none' ? ' (notifications will wait in the queue until RESEND_API_KEY is set)' : ''}, admin: ${config.adminToken.length >= 24 ? 'enabled' : 'disabled'}`
  );
  return { db, service, config, stop: () => clearInterval(timer) };
};
