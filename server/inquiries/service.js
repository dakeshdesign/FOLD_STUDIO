// Inquiry lifecycle: durable save -> email job queue -> delivery tracking -> team follow-up.

import crypto from 'crypto';
import { ROLES, STATUSES, LIMITS, suggestAssignment } from './schema.js';
import { renderInternalNotification, renderClientConfirmation, renderInternalReminder } from './emailTemplates.js';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const randomCode = (bytes = 5) => {
  let bits = 0;
  let acc = 0;
  let out = '';
  for (const b of crypto.randomBytes(bytes)) {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += CROCKFORD[(acc >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  return out;
};

export const newInquiryId = (now = new Date()) =>
  `FOLD-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${randomCode(5)}`;

const uid = (prefix) => `${prefix}_${crypto.randomUUID()}`;

/** Adds business days (Mon–Fri, judged in Asia/Kolkata) to a date. */
export const addBusinessDays = (from, days) => {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const istDay = new Date(d.getTime() + 5.5 * 3600_000).getUTCDay();
    if (istDay !== 0 && istDay !== 6) added += 1;
  }
  return d;
};

// Delivery-state precedence so a late "sent" webhook never downgrades "delivered".
const JOB_STATE_RANK = { PENDING: 0, RETRYING: 0, SENT: 1, DELIVERED: 2, FAILED: 3, BOUNCED: 3, CANCELLED: 3 };

export const createInquiryService = ({ db, config, provider, logger = console, now = () => new Date() }) => {
  const iso = () => now().toISOString();
  const adminUrl = (id) => (config.appBaseUrl ? `${config.appBaseUrl}/admin#${encodeURIComponent(id)}` : '');

  const getInquiry = (id) => db.get('SELECT * FROM inquiries WHERE id = $1', [id]);

  const addEvent = (inquiryId, type, detail, actor) =>
    db.run('INSERT INTO inquiry_events (id, inquiry_id, type, detail, actor, created_at) VALUES ($1, $2, $3, $4, $5, $6)', [
      uid('evt'),
      inquiryId,
      type,
      detail || '',
      actor,
      iso(),
    ]);

  const enqueue = async ({ inquiryId, kind, dedupeKey, recipient, delayMs = 0 }) => {
    const ts = iso();
    const due = new Date(now().getTime() + delayMs).toISOString();
    const { changes } = await db.run(
      `INSERT INTO email_jobs (id, inquiry_id, kind, dedupe_key, recipient, status, attempts, max_attempts, next_attempt_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'PENDING', 0, $6, $7, $8, $8)
       ON CONFLICT (dedupe_key) DO NOTHING`,
      [uid('job'), inquiryId, kind, dedupeKey, recipient, config.queue.maxAttempts, due, ts]
    );
    return changes === 1;
  };

  const enqueueInitialEmails = async (inq) => {
    await enqueue({ inquiryId: inq.id, kind: 'internal_notification', dedupeKey: `notify:${inq.id}`, recipient: config.email.to });
    if (config.email.sendClientConfirmation) {
      await enqueue({ inquiryId: inq.id, kind: 'client_confirmation', dedupeKey: `confirm:${inq.id}`, recipient: inq.customer_email });
    }
  };

  /**
   * Saves a validated inquiry. Returns { inquiry, duplicate }.
   * The same idempotency key always maps to the same inquiry, so retries and double
   * clicks can never create a second record or a second notification.
   */
  const createInquiry = async (input) => {
    const existing = await db.get('SELECT * FROM inquiries WHERE idempotency_key = $1', [input.idempotencyKey]);
    if (existing) return { inquiry: existing, duplicate: true };

    const created = now();
    const ts = created.toISOString();
    const { primary, supporting } = suggestAssignment(input.services);
    const id = newInquiryId(created);
    try {
      await db.run(
        `INSERT INTO inquiries (id, idempotency_key, customer_name, customer_email, selected_services, estimated_budget, project_brief,
           status, assigned_to, supporting_roles, notification_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'NEW', $8, $9, 'PENDING', $10, $10)`,
        [id, input.idempotencyKey, input.name, input.email, JSON.stringify(input.services), input.budget, input.projectBrief, primary, JSON.stringify(supporting), ts]
      );
    } catch (err) {
      // Concurrent duplicate submission lost the race on the unique key.
      const raced = await db.get('SELECT * FROM inquiries WHERE idempotency_key = $1', [input.idempotencyKey]);
      if (raced) return { inquiry: raced, duplicate: true };
      throw err;
    }

    const inquiry = await getInquiry(id);
    await addEvent(id, 'CREATED', `Submitted via website. Suggested owner: ${primary}${supporting.length ? `; supporting: ${supporting.join(', ')}` : ''}.`, 'website');
    await enqueueInitialEmails(inquiry);
    return { inquiry, duplicate: false };
  };

  const ownerFor = (inq) => {
    const member = inq.assigned_to ? config.team[inq.assigned_to] : null;
    return { name: member?.name || 'team', email: member?.email || config.email.to };
  };

  /** Builds the message for a job, or returns null if it is no longer relevant. */
  const buildMessage = (job, inq) => {
    switch (job.kind) {
      case 'internal_notification':
        return { replyTo: inq.customer_email, ...renderInternalNotification(inq, { adminUrl: adminUrl(inq.id) }) };
      case 'client_confirmation':
        return { replyTo: config.email.to, ...renderClientConfirmation(inq) };
      case 'reminder_unreviewed':
        if (inq.status !== 'NEW' || inq.reminders_paused) return null;
        return renderInternalReminder(inq, { kind: 'unreviewed', ownerName: ownerFor(inq).name, adminUrl: adminUrl(inq.id) });
      case 'quotation_followup':
        if (inq.status !== 'QUOTATION_SENT' || inq.reminders_paused || inq.customer_responded_at) return null;
        return renderInternalReminder(inq, { kind: 'quotation_followup', ownerName: ownerFor(inq).name, adminUrl: adminUrl(inq.id) });
      default:
        return null;
    }
  };

  const syncInquiryNotification = async (job) => {
    if (job.kind !== 'internal_notification') return;
    await db.run(
      'UPDATE inquiries SET notification_status = $1, notification_sent_at = $2, provider_message_id = $3, updated_at = $4 WHERE id = $5',
      [job.status, job.sent_at, job.provider_message_id, iso(), job.inquiry_id]
    );
  };

  const processJob = async (job) => {
    const ts = iso();
    const lockedUntil = new Date(now().getTime() + config.queue.lockMs).toISOString();
    // Atomic claim: only one worker (or process) can take a due job.
    const claim = await db.run(
      `UPDATE email_jobs SET locked_until = $1, attempts = attempts + 1, updated_at = $2
       WHERE id = $3 AND status IN ('PENDING', 'RETRYING') AND next_attempt_at <= $2 AND (locked_until IS NULL OR locked_until < $2)`,
      [lockedUntil, ts, job.id]
    );
    if (claim.changes !== 1) return 'skipped';
    const claimed = await db.get('SELECT * FROM email_jobs WHERE id = $1', [job.id]);
    const inq = await getInquiry(claimed.inquiry_id);
    const message = inq && buildMessage(claimed, inq);
    if (!message) {
      await db.run("UPDATE email_jobs SET status = 'CANCELLED', locked_until = NULL, updated_at = $1 WHERE id = $2", [iso(), claimed.id]);
      return 'cancelled';
    }

    try {
      const { providerMessageId } = await provider.send({
        to: claimed.recipient,
        ...message,
        idempotencyKey: `${claimed.id}-${claimed.manual_retries}`,
      });
      const sentAt = iso();
      await db.run(
        "UPDATE email_jobs SET status = 'SENT', provider_message_id = $1, sent_at = $2, last_error = NULL, locked_until = NULL, updated_at = $2 WHERE id = $3",
        [providerMessageId, sentAt, claimed.id]
      );
      await syncInquiryNotification({ ...claimed, status: 'SENT', sent_at: sentAt, provider_message_id: providerMessageId });
      await addEvent(inq.id, 'EMAIL_SENT', `${claimed.kind} accepted by provider (${providerMessageId}).`, 'system');
      logger.info?.(`[inquiries] ${claimed.kind} for ${inq.id} accepted by provider`);
      return 'sent';
    } catch (err) {
      const retryable = err.retryable !== false && claimed.attempts < claimed.max_attempts;
      const error = String(err.message || err).slice(0, 500);
      if (retryable) {
        // Exponential backoff with jitter: base, 2x, 4x ... capped at 6h.
        const delay = Math.min(config.queue.baseDelayMs * 2 ** (claimed.attempts - 1), 6 * 3600_000) * (0.8 + Math.random() * 0.4);
        await db.run(
          "UPDATE email_jobs SET status = 'RETRYING', last_error = $1, next_attempt_at = $2, locked_until = NULL, updated_at = $3 WHERE id = $4",
          [error, new Date(now().getTime() + delay).toISOString(), iso(), claimed.id]
        );
        logger.warn?.(`[inquiries] ${claimed.kind} for ${inq.id} failed (attempt ${claimed.attempts}), will retry: ${error}`);
        return 'retrying';
      }
      await db.run("UPDATE email_jobs SET status = 'FAILED', last_error = $1, locked_until = NULL, updated_at = $2 WHERE id = $3", [error, iso(), claimed.id]);
      await syncInquiryNotification({ ...claimed, status: 'FAILED', sent_at: null, provider_message_id: null });
      await addEvent(inq.id, 'EMAIL_FAILED', `${claimed.kind}: ${error}`, 'system');
      logger.error?.(`[inquiries] ${claimed.kind} for ${inq.id} FAILED permanently: ${error}`);
      return 'failed';
    }
  };

  /** Sends every due job. Safe to call concurrently and from multiple processes. */
  const processDueJobs = async ({ limit = 25 } = {}) => {
    if (provider.name === 'none') return { skipped: 'no email provider configured' };
    const due = await db.all(
      `SELECT * FROM email_jobs WHERE status IN ('PENDING', 'RETRYING') AND next_attempt_at <= $1 AND (locked_until IS NULL OR locked_until < $1)
       ORDER BY next_attempt_at LIMIT ${Number(limit)}`,
      [iso()]
    );
    const results = {};
    for (const job of due) {
      const r = await processJob(job);
      results[r] = (results[r] || 0) + 1;
    }
    return results;
  };

  /** Re-creates notification jobs for inquiries saved without one (e.g. crash mid-request). */
  const repairMissingJobs = async () => {
    const orphans = await db.all(
      `SELECT i.* FROM inquiries i WHERE i.notification_status = 'PENDING'
       AND NOT EXISTS (SELECT 1 FROM email_jobs j WHERE j.inquiry_id = i.id AND j.kind = 'internal_notification')`
    );
    for (const inq of orphans) await enqueueInitialEmails(inq);
    return orphans.length;
  };

  /** Queues internal reminders for unreviewed inquiries and due quotation follow-ups (once each). */
  const scheduleFollowUps = async () => {
    const ts = iso();
    const cutoff = new Date(now().getTime() - config.followUp.unreviewedReminderHours * 3600_000).toISOString();
    let queued = 0;

    const stale = await db.all(
      "SELECT * FROM inquiries WHERE status = 'NEW' AND unreviewed_reminder_sent_at IS NULL AND reminders_paused = $1 AND created_at <= $2",
      [false, cutoff]
    );
    for (const inq of stale) {
      const mark = await db.run('UPDATE inquiries SET unreviewed_reminder_sent_at = $1 WHERE id = $2 AND unreviewed_reminder_sent_at IS NULL', [ts, inq.id]);
      if (mark.changes !== 1) continue;
      if (await enqueue({ inquiryId: inq.id, kind: 'reminder_unreviewed', dedupeKey: `reminder:unreviewed:${inq.id}`, recipient: ownerFor(inq).email })) {
        await addEvent(inq.id, 'REMINDER_QUEUED', `Unreviewed for ${config.followUp.unreviewedReminderHours}h — reminder to ${inq.assigned_to || 'inbox'}.`, 'system');
        queued += 1;
      }
    }

    const quotes = await db.all(
      `SELECT * FROM inquiries WHERE status = 'QUOTATION_SENT' AND quotation_followup_due_at IS NOT NULL AND quotation_followup_due_at <= $1
       AND quotation_followup_sent_at IS NULL AND customer_responded_at IS NULL AND reminders_paused = $2`,
      [ts, false]
    );
    for (const inq of quotes) {
      const mark = await db.run('UPDATE inquiries SET quotation_followup_sent_at = $1 WHERE id = $2 AND quotation_followup_sent_at IS NULL', [ts, inq.id]);
      if (mark.changes !== 1) continue;
      if (
        await enqueue({
          inquiryId: inq.id,
          kind: 'quotation_followup',
          dedupeKey: `reminder:quotation:${inq.id}:${inq.quotation_followup_due_at}`,
          recipient: ownerFor(inq).email,
        })
      ) {
        await addEvent(inq.id, 'REMINDER_QUEUED', 'No client response recorded since quotation — follow-up reminder to team.', 'system');
        queued += 1;
      }
    }
    return queued;
  };

  const tick = async () => {
    const repaired = await repairMissingJobs();
    const reminders = await scheduleFollowUps();
    const jobs = await processDueJobs();
    return { repaired, reminders, jobs };
  };

  // ---------- Admin ----------

  const cancelOpenReminders = (inquiryId) =>
    db.run(
      `UPDATE email_jobs SET status = 'CANCELLED', updated_at = $1
       WHERE inquiry_id = $2 AND kind IN ('reminder_unreviewed', 'quotation_followup') AND status IN ('PENDING', 'RETRYING')`,
      [iso(), inquiryId]
    );

  const listInquiries = async ({ status } = {}) => {
    const rows = status
      ? await db.all('SELECT * FROM inquiries WHERE status = $1 ORDER BY created_at DESC LIMIT 500', [status])
      : await db.all('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 500');
    return rows.map(({ idempotency_key: _k, ...r }) => r);
  };

  const stats = async () => {
    const rows = await db.all('SELECT status, COUNT(*) AS n FROM inquiries GROUP BY status');
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    let total = 0;
    for (const r of rows) {
      byStatus[r.status] = Number(r.n);
      total += Number(r.n);
    }
    const failed = await db.get("SELECT COUNT(*) AS n FROM inquiries WHERE notification_status IN ('FAILED', 'BOUNCED')");
    const stuck = await db.get(
      "SELECT COUNT(*) AS n FROM email_jobs WHERE status IN ('PENDING', 'RETRYING') AND next_attempt_at <= $1",
      [new Date(now().getTime() - 15 * 60_000).toISOString()]
    );
    return { total, byStatus, failedNotifications: Number(failed.n), stuckJobs: Number(stuck.n) };
  };

  const getInquiryDetail = async (id) => {
    const inq = await getInquiry(id);
    if (!inq) return null;
    const { idempotency_key: _k, ...inquiry } = inq;
    const events = await db.all('SELECT * FROM inquiry_events WHERE inquiry_id = $1 ORDER BY created_at DESC', [id]);
    const jobs = await db.all(
      'SELECT id, kind, recipient, status, attempts, max_attempts, last_error, provider_message_id, sent_at, delivered_at, next_attempt_at, created_at FROM email_jobs WHERE inquiry_id = $1 ORDER BY created_at',
      [id]
    );
    return { inquiry, events, jobs };
  };

  /**
   * Applies validated admin changes. Returns { ok, error?, detail? }.
   * patch: { status?, assignedTo?, supportingRoles?, remindersPaused?, note?, customerResponded? }
   */
  const updateInquiry = async (id, patch, actor) => {
    const inq = await getInquiry(id);
    if (!inq) return { ok: false, code: 404, error: 'Inquiry not found.' };
    if (!patch || typeof patch !== 'object') return { ok: false, code: 400, error: 'Malformed request.' };

    const { status, assignedTo, supportingRoles, remindersPaused, note, customerResponded } = patch;
    if (status !== undefined && !STATUSES.includes(status)) return { ok: false, code: 422, error: 'Unknown status.' };
    if (assignedTo !== undefined && assignedTo !== null && !ROLES.includes(assignedTo)) return { ok: false, code: 422, error: 'Unknown team role.' };
    if (supportingRoles !== undefined && (!Array.isArray(supportingRoles) || supportingRoles.some((r) => !ROLES.includes(r))))
      return { ok: false, code: 422, error: 'Unknown supporting role.' };
    if (remindersPaused !== undefined && typeof remindersPaused !== 'boolean') return { ok: false, code: 422, error: 'remindersPaused must be boolean.' };
    if (note !== undefined && (typeof note !== 'string' || !note.trim() || note.length > LIMITS.noteMax))
      return { ok: false, code: 422, error: `Notes must be 1–${LIMITS.noteMax} characters.` };
    if (customerResponded !== undefined && customerResponded !== true) return { ok: false, code: 422, error: 'customerResponded must be true.' };

    const ts = iso();
    if (status !== undefined && status !== inq.status) {
      const dueAt = status === 'QUOTATION_SENT' ? addBusinessDays(now(), config.followUp.quotationFollowUpBusinessDays).toISOString() : null;
      await db.run(
        `UPDATE inquiries SET status = $1, updated_at = $2,
           quotation_followup_due_at = CASE WHEN $1 = 'QUOTATION_SENT' THEN $3 ELSE quotation_followup_due_at END,
           quotation_followup_sent_at = CASE WHEN $1 = 'QUOTATION_SENT' THEN NULL ELSE quotation_followup_sent_at END,
           customer_responded_at = CASE WHEN $1 = 'QUOTATION_SENT' THEN NULL ELSE customer_responded_at END
         WHERE id = $4`,
        [status, ts, dueAt, id]
      );
      // Any move out of NEW (including into a terminal status) stops pending reminders.
      if (status !== 'NEW') await cancelOpenReminders(id);
      await addEvent(id, 'STATUS_CHANGED', `${inq.status} → ${status}`, actor);
    }
    if (assignedTo !== undefined && assignedTo !== inq.assigned_to) {
      await db.run('UPDATE inquiries SET assigned_to = $1, updated_at = $2 WHERE id = $3', [assignedTo, ts, id]);
      await addEvent(id, 'ASSIGNED', assignedTo ? `Primary owner: ${assignedTo}` : 'Unassigned', actor);
    }
    if (supportingRoles !== undefined) {
      const roles = ROLES.filter((r) => supportingRoles.includes(r));
      await db.run('UPDATE inquiries SET supporting_roles = $1, updated_at = $2 WHERE id = $3', [JSON.stringify(roles), ts, id]);
      await addEvent(id, 'SUPPORT_UPDATED', roles.length ? `Supporting: ${roles.join(', ')}` : 'No supporting roles', actor);
    }
    if (remindersPaused !== undefined && remindersPaused !== inq.reminders_paused) {
      await db.run('UPDATE inquiries SET reminders_paused = $1, updated_at = $2 WHERE id = $3', [remindersPaused, ts, id]);
      if (remindersPaused) await cancelOpenReminders(id);
      await addEvent(id, remindersPaused ? 'REMINDERS_PAUSED' : 'REMINDERS_RESUMED', '', actor);
    }
    if (customerResponded) {
      await db.run('UPDATE inquiries SET customer_responded_at = $1, updated_at = $1 WHERE id = $2', [ts, id]);
      await cancelOpenReminders(id);
      await addEvent(id, 'CUSTOMER_RESPONDED', 'Client reply recorded — automatic follow-ups stopped.', actor);
    }
    if (note !== undefined) await addEvent(id, 'NOTE', note.trim(), actor);

    return { ok: true, detail: await getInquiryDetail(id) };
  };

  /** Manual retry of a failed internal notification. Bounded: a fresh set of attempts each time. */
  const retryNotification = async (id, actor) => {
    const job = await db.get("SELECT * FROM email_jobs WHERE inquiry_id = $1 AND kind = 'internal_notification'", [id]);
    if (!job) return { ok: false, code: 404, error: 'No notification job for this inquiry.' };
    if (!['FAILED', 'BOUNCED'].includes(job.status)) return { ok: false, code: 409, error: `Notification is ${job.status}; only failed notifications can be retried.` };
    if (job.manual_retries >= 5) return { ok: false, code: 409, error: 'Manual retry limit reached. Check the email configuration.' };
    const ts = iso();
    await db.run(
      "UPDATE email_jobs SET status = 'PENDING', attempts = 0, manual_retries = manual_retries + 1, next_attempt_at = $1, locked_until = NULL, updated_at = $1 WHERE id = $2",
      [ts, job.id]
    );
    await db.run("UPDATE inquiries SET notification_status = 'PENDING', updated_at = $1 WHERE id = $2", [ts, id]);
    await addEvent(id, 'NOTIFICATION_RETRY', 'Manual retry requested.', actor);
    return { ok: true };
  };

  /** Applies a verified provider webhook event. Idempotent per event id. */
  const applyDeliveryEvent = async ({ eventId, type, providerMessageId, reason }) => {
    const seen = await db.run('INSERT INTO webhook_events (id, received_at) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [eventId, iso()]);
    if (seen.changes !== 1) return 'duplicate';
    const job = await db.get('SELECT * FROM email_jobs WHERE provider_message_id = $1', [providerMessageId]);
    if (!job) return 'unknown_message';

    const next = { 'email.delivered': 'DELIVERED', 'email.bounced': 'BOUNCED', 'email.complained': 'BOUNCED', 'email.failed': 'FAILED' }[type];
    if (!next) return 'ignored';
    if (JOB_STATE_RANK[next] <= (JOB_STATE_RANK[job.status] ?? 0)) return 'stale';

    const ts = iso();
    await db.run(
      'UPDATE email_jobs SET status = $1, delivered_at = CASE WHEN $1 = \'DELIVERED\' THEN $2 ELSE delivered_at END, last_error = $3, updated_at = $2 WHERE id = $4',
      [next, ts, next === 'DELIVERED' ? null : String(reason || type).slice(0, 500), job.id]
    );
    if (job.kind === 'internal_notification') {
      await db.run('UPDATE inquiries SET notification_status = $1, updated_at = $2 WHERE id = $3', [next, ts, job.inquiry_id]);
    }
    await addEvent(job.inquiry_id, `EMAIL_${next}`, `${job.kind}: ${type}`, 'provider');
    return 'applied';
  };

  return {
    createInquiry,
    processDueJobs,
    scheduleFollowUps,
    repairMissingJobs,
    tick,
    listInquiries,
    stats,
    getInquiryDetail,
    updateInquiry,
    retryNotification,
    applyDeliveryEvent,
  };
};

