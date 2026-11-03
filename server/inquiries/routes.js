// HTTP layer for inquiries: public submit endpoint, provider webhook, cron tick,
// and the token-protected admin API + dashboard.

import crypto from 'crypto';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { validateInquiry, STATUSES, STATUS_LABELS, ROLES, SERVICES, BUDGETS } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Fixed-window in-memory limiter keyed by client IP. */
export const createRateLimiter = ({ windowMs, max, now = () => Date.now() }) => {
  const hits = new Map();
  return (key) => {
    const t = now();
    if (hits.size > 10_000) for (const [k, v] of hits) if (v.reset <= t) hits.delete(k);
    const entry = hits.get(key);
    if (!entry || entry.reset <= t) {
      hits.set(key, { count: 1, reset: t + windowMs });
      return { allowed: true };
    }
    entry.count += 1;
    return entry.count > max ? { allowed: false, retryAfterSec: Math.ceil((entry.reset - t) / 1000) } : { allowed: true };
  };
};

const sha = (v) => crypto.createHash('sha256').update(String(v)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

const bearer = (req) => {
  const h = req.get('authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
};

/** Verifies a Svix-signed webhook (the scheme Resend uses). */
export const verifySvixSignature = ({ secret, headers, rawBody, nowSec = Math.floor(Date.now() / 1000), toleranceSec = 300 }) => {
  const id = headers['svix-id'];
  const timestamp = headers['svix-timestamp'];
  const signatures = headers['svix-signature'];
  if (!secret || !id || !timestamp || !signatures || !rawBody) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowSec - ts) > toleranceSec) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody.toString('utf8')}`).digest('base64');
  return String(signatures)
    .split(' ')
    .map((part) => part.split(',')[1])
    .filter(Boolean)
    .some((sig) => sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)));
};

/** Turns body-parser failures into clean JSON errors (no stack traces, no HTML). */
export const jsonErrorHandler = (err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Malformed request.' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ success: false, message: 'Request too large.' });
  return next(err);
};

export const createInquiryRouter = ({ service, config, logger = console, onAccepted = () => {} }) => {
  const router = express.Router();
  const submitLimiter = createRateLimiter(config.rateLimit);
  const authFailures = new Map(); // ip -> { count, reset }: locks out token guessing
  const adminEnabled = config.adminToken.length >= 24;

  // ---------- Public: submit an inquiry ----------
  const submit = async (req, res) => {
    const limit = submitLimiter(req.ip);
    if (!limit.allowed) {
      res.set('Retry-After', String(limit.retryAfterSec));
      return res.status(429).json({ success: false, message: 'Too many submissions. Please try again shortly.' });
    }
    if (!req.is('application/json') || !req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Malformed request.' });
    }

    // Honeypot: bots fill hidden fields. Respond like success, store nothing.
    if (typeof req.body.honeypot === 'string' && req.body.honeypot.trim() !== '') {
      logger.warn?.('[inquiries] honeypot triggered; submission discarded');
      return res.status(201).json({ success: true });
    }

    const result = validateInquiry(req.body);
    if (!result.ok) {
      return res.status(422).json({ success: false, message: 'Please complete the required fields.', errors: result.errors });
    }

    try {
      const { inquiry, duplicate } = await service.createInquiry(result.value);
      if (!duplicate) onAccepted(inquiry.id);
      return res.status(duplicate ? 200 : 201).json({
        success: true,
        inquiryId: inquiry.id,
        // "recorded" is guaranteed here; email delivery is tracked separately.
        recorded: true,
        notification: inquiry.notification_status,
      });
    } catch (err) {
      logger.error?.('[inquiries] failed to save inquiry:', err.message);
      return res.status(503).json({ success: false, message: "We couldn't submit your inquiry. Please try again." });
    }
  };
  router.post('/api/inquiries', submit);
  router.post('/api/inquiry', submit); // legacy path used by older builds

  // ---------- Provider delivery webhook ----------
  router.post('/api/webhooks/resend', async (req, res) => {
    if (!config.email.webhookSecret) return res.status(503).json({ ok: false });
    const valid = verifySvixSignature({ secret: config.email.webhookSecret, headers: req.headers, rawBody: req.rawBody });
    if (!valid) return res.status(401).json({ ok: false });
    const { type, data } = req.body || {};
    if (!data?.email_id || typeof type !== 'string') return res.status(200).json({ ok: true, result: 'ignored' });
    try {
      const result = await service.applyDeliveryEvent({
        eventId: req.get('svix-id'),
        type,
        providerMessageId: data.email_id,
        reason: data.bounce?.message || data.failed?.reason || '',
      });
      return res.json({ ok: true, result });
    } catch (err) {
      logger.error?.('[inquiries] webhook processing failed:', err.message);
      return res.status(500).json({ ok: false });
    }
  });

  // ---------- Scheduled processing (external cron hits this) ----------
  router.post('/api/cron/inquiries', async (req, res) => {
    if (!config.cronSecret || !safeEqual(bearer(req), config.cronSecret)) return res.status(401).json({ ok: false });
    try {
      return res.json({ ok: true, ...(await service.tick()) });
    } catch (err) {
      logger.error?.('[inquiries] cron tick failed:', err.message);
      return res.status(500).json({ ok: false });
    }
  });

  // ---------- Admin API ----------
  const requireAdmin = (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!adminEnabled) return res.status(503).json({ error: 'Admin access is not configured.' });
    const failure = authFailures.get(req.ip);
    if (failure && failure.reset > Date.now() && failure.count >= 20) return res.status(429).json({ error: 'Too many attempts.' });
    if (safeEqual(bearer(req), config.adminToken)) return next();
    const entry = failure && failure.reset > Date.now() ? failure : { count: 0, reset: Date.now() + 15 * 60_000 };
    entry.count += 1;
    authFailures.set(req.ip, entry);
    return res.status(401).json({ error: 'Unauthorized.' });
  };
  // Free-text label for the audit log; access itself is controlled by the token.
  const actorOf = (req) => `admin:${String(req.get('x-staff-name') || 'staff').replace(/[^\p{L}\p{N} ._-]/gu, '').slice(0, 40) || 'staff'}`;

  router.use('/api/admin', requireAdmin);

  router.get('/api/admin/meta', (req, res) =>
    res.json({
      statuses: STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
      roles: ROLES,
      team: Object.fromEntries(Object.entries(config.team).map(([role, m]) => [role, m.name])),
      services: SERVICES,
      budgets: BUDGETS,
      emailProvider: config.email.provider,
      clientConfirmation: config.email.sendClientConfirmation,
      webhookConfigured: Boolean(config.email.webhookSecret),
      cronConfigured: Boolean(config.cronSecret),
    })
  );
  router.get('/api/admin/stats', async (req, res) => res.json(await service.stats()));
  router.get('/api/admin/inquiries', async (req, res) => {
    const status = typeof req.query.status === 'string' && STATUSES.includes(req.query.status) ? req.query.status : undefined;
    res.json({ inquiries: await service.listInquiries({ status }) });
  });
  router.get('/api/admin/inquiries/:id', async (req, res) => {
    const detail = await service.getInquiryDetail(req.params.id);
    return detail ? res.json(detail) : res.status(404).json({ error: 'Inquiry not found.' });
  });
  router.patch('/api/admin/inquiries/:id', async (req, res) => {
    const result = await service.updateInquiry(req.params.id, req.body, actorOf(req));
    return result.ok ? res.json(result.detail) : res.status(result.code).json({ error: result.error });
  });
  router.post('/api/admin/inquiries/:id/retry-notification', async (req, res) => {
    const result = await service.retryNotification(req.params.id, actorOf(req));
    if (!result.ok) return res.status(result.code).json({ error: result.error });
    onAccepted(req.params.id);
    return res.json({ ok: true });
  });

  // ---------- Admin dashboard (static, no customer data until authenticated) ----------
  const adminDir = path.join(__dirname, '../admin');
  router.use(
    '/admin',
    (req, res, next) => {
      res.set({
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store',
      });
      next();
    },
    express.static(adminDir, { index: 'index.html' })
  );

  return router;
};
