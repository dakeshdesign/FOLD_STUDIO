import express from 'express';
import { loadConfig } from '../server/inquiries/config.js';
import { createDb } from '../server/inquiries/db.js';
import { createInquiryService } from '../server/inquiries/service.js';
import { createInquiryRouter, jsonErrorHandler } from '../server/inquiries/routes.js';
import { EmailError } from '../server/inquiries/emailProvider.js';

export const ADMIN_TOKEN = 'test-admin-token-0123456789abcdef';
export const CRON_SECRET = 'test-cron-secret';
export const WEBHOOK_SECRET = `whsec_${Buffer.from('test-webhook-secret-bytes').toString('base64')}`;

export const validBody = (overrides = {}) => ({
  name: 'Alex Morgan',
  email: 'alex@brand.com',
  services: ['Brand Identity', 'Website Design', 'Content Creation'],
  budget: '₹25,000–₹50,000',
  projectBrief: 'We need complete branding, a website and promotional creative materials for our new company.',
  idempotencyKey: `key-${Math.random().toString(36).slice(2)}${Date.now()}`,
  ...overrides,
});

/** Records sends; `plan` is a list of outcomes consumed in order ('ok' | 'retryable' | 'fatal'). */
export const fakeProvider = (plan = []) => {
  const sent = [];
  let n = 0;
  return {
    name: 'fake',
    sent,
    async send(msg) {
      const outcome = plan[n++] || 'ok';
      if (outcome === 'retryable') throw new EmailError('Resend 503: unavailable', { retryable: true });
      if (outcome === 'fatal') throw new EmailError('Resend 403: domain not verified', { retryable: false });
      sent.push(msg);
      return { providerMessageId: `msg_${sent.length}` };
    },
  };
};

export const silentLogger = { log() {}, info() {}, warn() {}, error() {} };

export const createHarness = async ({ env = {}, provider = fakeProvider(), clock } = {}) => {
  const config = loadConfig({
    // Set TEST_DATABASE_URL=postgres://... to run the same suite against PostgreSQL.
    DATABASE_URL_INQUIRIES: process.env.TEST_DATABASE_URL || 'sqlite::memory:',
    RESEND_API_KEY: 're_test',
    EMAIL_FROM: 'FOLD Studio <inquiries@foldstudio.example>',
    EMAIL_TO: 'enquiryfoldstudio@gmail.com',
    ADMIN_TOKEN,
    CRON_SECRET,
    RESEND_WEBHOOK_SECRET: WEBHOOK_SECRET,
    APP_BASE_URL: 'https://fold.example',
    EMAIL_RETRY_BASE_MS: '0',
    ...env,
  });
  const db = await createDb(config.databaseUrl);
  if (db.engine === 'postgres') await db.run('TRUNCATE webhook_events, inquiry_events, email_jobs, inquiries');
  const time = { now: clock || new Date('2026-11-03T06:30:00.000Z') };
  const service = createInquiryService({ db, config, provider, logger: silentLogger, now: () => new Date(time.now) });

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '50kb', verify: (req, res, buf) => { req.rawBody = buf; } }));
  app.use(createInquiryRouter({ service, config, logger: silentLogger }));
  app.use(jsonErrorHandler);
  const server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;

  const request = (path, { method = 'GET', body, headers = {}, raw } = {}) =>
    fetch(base + path, {
      method,
      headers: { ...(body !== undefined || raw !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined,
    }).then(async (res) => ({ status: res.status, headers: res.headers, body: await res.json().catch(() => null) }));

  const admin = (path, opts = {}) => request(path, { ...opts, headers: { Authorization: `Bearer ${ADMIN_TOKEN}`, ...(opts.headers || {}) } });

  return {
    db, service, config, provider, time, request, admin, base,
    advance(ms) { time.now = new Date(new Date(time.now).getTime() + ms); },
    async close() { await new Promise((r) => server.close(r)); await db.close(); },
  };
};
