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

  const db = await createDb(config.databaseUrl);
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
