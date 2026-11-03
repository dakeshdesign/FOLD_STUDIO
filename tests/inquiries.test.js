import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { validateInquiry, suggestAssignment, SERVICES, BUDGETS } from '../server/inquiries/schema.js';
import { renderInternalNotification, renderClientConfirmation, escapeHtml } from '../server/inquiries/emailTemplates.js';
import { createResendProvider } from '../server/inquiries/emailProvider.js';
import { verifySvixSignature } from '../server/inquiries/routes.js';
import { addBusinessDays } from '../server/inquiries/service.js';
import { createHarness, fakeProvider, validBody, CRON_SECRET, WEBHOOK_SECRET } from './helpers.js';

const HOUR = 3600_000;

describe('schema validation', () => {
  test('accepts a complete inquiry and normalises it', () => {
    const r = validateInquiry(validBody({ name: '  Alex   Morgan ', email: ' alex@brand.com ' }));
    assert.equal(r.ok, true);
    assert.equal(r.value.name, 'Alex Morgan');
    assert.equal(r.value.email, 'alex@brand.com');
  });

  test('keeps every selected service, in website order', () => {
    const r = validateInquiry(validBody({ services: ['Full Retainer', 'Digital Experiences', 'Creative Direction'] }));
    assert.deepEqual(r.value.services, ['Digital Experiences', 'Creative Direction', 'Full Retainer']);
  });

  test('single service', () => {
    assert.deepEqual(validateInquiry(validBody({ services: ['Website Design'] })).value.services, ['Website Design']);
  });

  test('every budget option is accepted exactly, including Not Sure Yet', () => {
    for (const budget of BUDGETS) assert.equal(validateInquiry(validBody({ budget })).value.budget, budget);
  });

  test('international names are preserved', () => {
    for (const name of ['Zoë Ångström', 'రాచగిరి దకేశ్వర్', '李小龍', "Seán O'Brien-Núñez"]) {
      assert.equal(validateInquiry(validBody({ name })).value.name, name);
    }
  });

  test('empty brief is allowed; multiline brief keeps line breaks', () => {
    assert.equal(validateInquiry(validBody({ projectBrief: '' })).ok, true);
    const brief = 'Line one.\r\n\r\nParagraph two — with “quotes” & ₹ symbols.\nLine three.';
    assert.equal(validateInquiry(validBody({ projectBrief: brief })).value.projectBrief, 'Line one.\n\nParagraph two — with “quotes” & ₹ symbols.\nLine three.');
  });

  const rejects = {
    'missing name': { name: '' },
    'one-letter name': { name: 'A' },
    'overlong name': { name: 'x'.repeat(121) },
    'name with newline': { name: 'Alex\nBcc: evil@x.com' },
    'missing email': { email: '' },
    'invalid email': { email: 'alex@' },
    'email header injection': { email: 'alex@brand.com\r\nBcc: victim@example.com' },
    'email with display name': { email: 'Evil <evil@x.com>' },
    'overlong email': { email: `${'a'.repeat(250)}@b.co` },
    'no services': { services: [] },
    'services not an array': { services: 'Brand Identity' },
    'unknown service': { services: ['Brand Identity', 'Hacking'] },
    'duplicate service': { services: ['Brand Identity', 'Brand Identity'] },
    'missing budget': { budget: '' },
    'unknown budget': { budget: '₹1' },
    'overlong brief': { projectBrief: 'x'.repeat(5001) },
    'non-string brief': { projectBrief: { $gt: '' } },
    'missing idempotency key': { idempotencyKey: undefined },
    'bad idempotency key': { idempotencyKey: '../../etc' },
  };
  for (const [label, override] of Object.entries(rejects)) {
    test(`rejects ${label}`, () => assert.equal(validateInquiry(validBody(override)).ok, false));
  }

  test('rejects non-object bodies', () => {
    for (const body of [null, [], 'x', 42]) assert.equal(validateInquiry(body).ok, false);
  });

  test('suggested assignment', () => {
    assert.deepEqual(suggestAssignment(['Website Design']), { primary: 'Developer', supporting: [] });
    assert.deepEqual(suggestAssignment(['Brand Identity']), { primary: 'Designer', supporting: [] });
    assert.equal(suggestAssignment(['Full Retainer']).primary, 'Client Manager');
    const multi = suggestAssignment(['Brand Identity', 'Website Design', 'Content Creation']);
    assert.equal(multi.primary, 'Client Manager');
    assert.deepEqual(multi.supporting, ['Designer', 'Developer', 'Social Media Manager']);
  });
});

describe('email templates', () => {
  const inquiry = {
    id: 'FOLD-20261103-ABCDEFGH',
    customer_name: 'Alex Morgan',
    customer_email: 'alex@brand.com',
    selected_services: ['Brand Identity', 'Website Design', 'Content Creation'],
    estimated_budget: '₹25,000–₹50,000',
    project_brief: 'Line one\nLine two',
    status: 'NEW',
    assigned_to: 'Client Manager',
    supporting_roles: ['Designer'],
    created_at: '2026-11-03T06:30:00.000Z',
  };

  test('internal notification contains every field', () => {
    const { subject, html, text } = renderInternalNotification(inquiry, { adminUrl: 'https://fold.example/admin#x' });
    assert.match(subject, /^FOLD \| NEW PROJECT INQUIRY \| Alex Morgan \| Brand Identity \+2 more$/);
    for (const s of inquiry.selected_services) {
      assert.ok(html.includes(s), `html has ${s}`);
      assert.ok(text.includes(`- ${s}`), `text has ${s}`);
    }
    for (const part of [inquiry.estimated_budget, inquiry.id, 'alex@brand.com', '03 Nov 2026', 'IST', 'New Inquiry']) {
      assert.ok(html.includes(part) && text.includes(part), part);
    }
    assert.ok(html.includes('Line one<br>Line two'));
    assert.ok(text.includes('"Line one\nLine two"'));
  });

  test('IST timestamp conversion', () => {
    const { text } = renderInternalNotification(inquiry);
    assert.match(text, /Submitted: 03 Nov 2026, 12:00 pm IST/i);
  });

  test('empty brief shows "Not provided"', () => {
    const { html, text } = renderInternalNotification({ ...inquiry, project_brief: '' });
    assert.ok(html.includes('Not provided'));
    assert.ok(text.includes('PROJECT BRIEF\nNot provided'));
  });

  test('one or two services are listed in full in the subject', () => {
    assert.match(renderInternalNotification({ ...inquiry, selected_services: ['Website Design'] }).subject, /\| Website Design$/);
    assert.match(renderInternalNotification({ ...inquiry, selected_services: ['Website Design', 'Full Retainer'] }).subject, /Website Design \+ Full Retainer$/);
  });

  test('escapes script and HTML injection everywhere', () => {
    const evil = { ...inquiry, customer_name: '<script>alert(1)</script>', project_brief: '<img src=x onerror=alert(1)><a href="javascript:x">y</a>' };
    const { html } = renderInternalNotification(evil);
    assert.ok(!html.includes('<script>alert'));
    assert.ok(!html.includes('<img src=x'));
    assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert.equal(escapeHtml(`"'<>&`), '&quot;&#39;&lt;&gt;&amp;');
  });

  test('subject can never contain line breaks', () => {
    const { subject } = renderInternalNotification({ ...inquiry, customer_name: 'A\r\nBcc: x@y.z' });
    assert.ok(!/[\r\n]/.test(subject));
  });

  test('client confirmation makes no time or price promises', () => {
    const { subject, text, html } = renderClientConfirmation(inquiry);
    assert.equal(subject, "FOLD Studio | We've Received Your Project Inquiry");
    assert.ok(text.startsWith('Hi Alex Morgan,'));
    for (const s of inquiry.selected_services) assert.ok(text.includes(s));
    assert.ok(text.includes(inquiry.estimated_budget));
    assert.ok(!/hours|within|guarantee|quote/i.test(text + html.replace(/<[^>]+>/g, '')));
  });
});

describe('Resend provider', () => {
  const mkFetch = (status, body, calls) => async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  };

  test('sends to Resend with auth, reply-to, idempotency key and text part', async () => {
    const calls = [];
    const p = createResendProvider({ apiKey: 're_123', from: 'FOLD <a@fold.example>', fetchImpl: mkFetch(200, { id: 'abc' }, calls) });
    const r = await p.send({ to: 'enquiryfoldstudio@gmail.com', replyTo: 'alex@brand.com', subject: 's', html: '<p>h</p>', text: 't', idempotencyKey: 'job_1-0' });
    assert.equal(r.providerMessageId, 'abc');
    assert.equal(calls[0].url, 'https://api.resend.com/emails');
    assert.equal(calls[0].init.headers.Authorization, 'Bearer re_123');
    assert.equal(calls[0].init.headers['Idempotency-Key'], 'job_1-0');
    const body = JSON.parse(calls[0].init.body);
    assert.deepEqual(body.to, ['enquiryfoldstudio@gmail.com']);
    assert.equal(body.from, 'FOLD <a@fold.example>');
    assert.equal(body.reply_to, 'alex@brand.com');
    assert.equal(body.text, 't');
  });

  test('429/5xx are retryable, other 4xx are not', async () => {
    for (const [status, retryable] of [[429, true], [500, true], [503, true], [401, false], [403, false], [422, false]]) {
      const p = createResendProvider({ apiKey: 'k', from: 'f@x.co', fetchImpl: mkFetch(status, { message: 'nope' }, []) });
      await assert.rejects(p.send({ to: 'a@b.co', subject: 's', html: 'h', text: 't', idempotencyKey: 'k' }), (e) => e.retryable === retryable);
    }
  });

  test('missing credentials fail without calling the API', async () => {
    const calls = [];
    const p = createResendProvider({ apiKey: '', from: '', fetchImpl: mkFetch(200, { id: 'x' }, calls) });
    await assert.rejects(p.send({ to: 'a@b.co', subject: 's', html: 'h', text: 't', idempotencyKey: 'k' }), (e) => e.retryable === false);
    assert.equal(calls.length, 0);
  });

  test('network errors are retryable', async () => {
    const p = createResendProvider({ apiKey: 'k', from: 'f@x.co', fetchImpl: async () => { throw new TypeError('fetch failed'); } });
    await assert.rejects(p.send({ to: 'a@b.co', subject: 's', html: 'h', text: 't', idempotencyKey: 'k' }), (e) => e.retryable === true);
  });
});

describe('POST /api/inquiries', () => {
  test('valid request is saved durably and notification is sent', async () => {
    const h = await createHarness();
    try {
      const body = validBody();
      const res = await h.request('/api/inquiries', { method: 'POST', body });
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.recorded, true);
      assert.equal(res.body.notification, 'PENDING');
      assert.match(res.body.inquiryId, /^FOLD-20261103-[0-9A-Z]{8}$/);

      const row = await h.db.get('SELECT * FROM inquiries WHERE id = $1', [res.body.inquiryId]);
      assert.equal(row.customer_name, 'Alex Morgan');
      assert.equal(row.customer_email, 'alex@brand.com');
      assert.deepEqual(row.selected_services, body.services);
      assert.equal(row.estimated_budget, '₹25,000–₹50,000');
      assert.equal(row.project_brief, body.projectBrief);
      assert.equal(row.status, 'NEW');
      assert.equal(row.assigned_to, 'Client Manager');
      assert.equal(row.created_at, '2026-11-03T06:30:00.000Z');

      await h.service.processDueJobs();
      assert.equal(h.provider.sent.length, 1);
      const msg = h.provider.sent[0];
      assert.equal(msg.to, 'enquiryfoldstudio@gmail.com');
      assert.equal(msg.replyTo, 'alex@brand.com');
      for (const s of body.services) assert.ok(msg.text.includes(s));
      assert.ok(msg.text.includes('₹25,000–₹50,000'));
      assert.ok(msg.text.includes(body.projectBrief));
      assert.ok(msg.text.includes(res.body.inquiryId));
      assert.ok(msg.html.includes('https://fold.example/admin#'));

      const after = await h.db.get('SELECT * FROM inquiries WHERE id = $1', [res.body.inquiryId]);
      assert.equal(after.notification_status, 'SENT');
      assert.equal(after.provider_message_id, 'msg_1');
      assert.ok(after.notification_sent_at);
    } finally {
      await h.close();
    }
  });

  test('legacy /api/inquiry path still works', async () => {
    const h = await createHarness();
    try {
      assert.equal((await h.request('/api/inquiry', { method: 'POST', body: validBody() })).status, 201);
    } finally {
      await h.close();
    }
  });

  test('duplicate submission returns the same inquiry and sends one email', async () => {
    const h = await createHarness();
    try {
      const body = validBody();
      const [a, b, c] = await Promise.all([1, 2, 3].map(() => h.request('/api/inquiries', { method: 'POST', body })));
      const ids = new Set([a, b, c].map((r) => r.body.inquiryId));
      assert.equal(ids.size, 1);
      assert.deepEqual([a, b, c].map((r) => r.status).sort(), [200, 200, 201]);
      await h.service.processDueJobs();
      await h.service.processDueJobs();
      assert.equal(h.provider.sent.length, 1);
      assert.equal(Number((await h.db.get('SELECT COUNT(*) AS n FROM inquiries')).n), 1);
    } finally {
      await h.close();
    }
  });

  test('invalid values -> 422 with field errors; malformed -> 400', async () => {
    const h = await createHarness();
    try {
      const bad = await h.request('/api/inquiries', { method: 'POST', body: validBody({ services: ['Nope'], budget: 'free', email: 'x' }) });
      assert.equal(bad.status, 422);
      assert.ok(bad.body.errors.services && bad.body.errors.budget && bad.body.errors.email);
      const malformed = await h.request('/api/inquiries', { method: 'POST', raw: '{not json' });
      assert.equal(malformed.status, 400);
      assert.equal(malformed.body.message, 'Malformed request.');
      assert.equal((await h.request('/api/inquiries', { method: 'POST', raw: '[1,2]' })).status, 400);
      assert.equal(Number((await h.db.get('SELECT COUNT(*) AS n FROM inquiries')).n), 0);
    } finally {
      await h.close();
    }
  });

  test('oversized payload is refused', async () => {
    const h = await createHarness();
    try {
      const res = await h.request('/api/inquiries', { method: 'POST', body: validBody({ projectBrief: 'x'.repeat(60_000) }) });
      assert.equal(res.status, 413);
      assert.equal(res.body.message, 'Request too large.');
      assert.equal(Number((await h.db.get('SELECT COUNT(*) AS n FROM inquiries')).n), 0);
    } finally {
      await h.close();
    }
  });

  test('honeypot submissions look successful but store nothing', async () => {
    const h = await createHarness();
    try {
      const res = await h.request('/api/inquiries', { method: 'POST', body: { ...validBody(), honeypot: 'http://spam' } });
      assert.equal(res.status, 201);
      assert.equal(res.body.inquiryId, undefined);
      assert.equal(Number((await h.db.get('SELECT COUNT(*) AS n FROM inquiries')).n), 0);
    } finally {
      await h.close();
    }
  });

  test('rate limiting returns 429', async () => {
    const h = await createHarness({ env: { INQUIRY_RATE_MAX: '2' } });
    try {
      const statuses = [];
      for (let i = 0; i < 4; i += 1) statuses.push((await h.request('/api/inquiries', { method: 'POST', body: validBody() })).status);
      assert.deepEqual(statuses, [201, 201, 429, 429]);
    } finally {
      await h.close();
    }
  });

  test('database failure returns 503 without leaking details', async () => {
    const h = await createHarness();
    try {
      await h.db.run('DROP TABLE email_jobs');
      await h.db.run('DROP TABLE inquiry_events');
      await h.db.run('DROP TABLE inquiries');
      const res = await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      assert.equal(res.status, 503);
      assert.ok(!/sqlite|table|stack/i.test(JSON.stringify(res.body)));
    } finally {
      await h.close();
    }
  });

  test('client confirmation is sent only when enabled', async () => {
    const h = await createHarness({ env: { SEND_CLIENT_CONFIRMATION: 'true' } });
    try {
      await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      await h.service.processDueJobs();
      assert.deepEqual(h.provider.sent.map((m) => m.to).sort(), ['alex@brand.com', 'enquiryfoldstudio@gmail.com']);
      const confirm = h.provider.sent.find((m) => m.to === 'alex@brand.com');
      assert.equal(confirm.replyTo, 'enquiryfoldstudio@gmail.com');
    } finally {
      await h.close();
    }
    const off = await createHarness();
    try {
      await off.request('/api/inquiries', { method: 'POST', body: validBody() });
      await off.service.processDueJobs();
      assert.equal(off.provider.sent.length, 1);
    } finally {
      await off.close();
    }
  });
});

describe('delivery reliability', () => {
  test('transient failures retry with backoff, then succeed', async () => {
    const h = await createHarness({ provider: fakeProvider(['retryable', 'retryable', 'ok']), env: { EMAIL_RETRY_BASE_MS: '30000' } });
    try {
      const { body } = await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      await h.service.processDueJobs();
      let job = await h.db.get('SELECT * FROM email_jobs');
      assert.equal(job.status, 'RETRYING');
      assert.equal(job.attempts, 1);
      assert.match(job.last_error, /503/);
      // Not due yet -> nothing happens.
      await h.service.processDueJobs();
      assert.equal((await h.db.get('SELECT attempts FROM email_jobs')).attempts, 1);
      h.advance(HOUR);
      await h.service.processDueJobs();
      h.advance(HOUR);
      await h.service.processDueJobs();
      job = await h.db.get('SELECT * FROM email_jobs');
      assert.equal(job.status, 'SENT');
      assert.equal(job.attempts, 3);
      assert.equal(h.provider.sent.length, 1);
      assert.equal((await h.db.get('SELECT notification_status FROM inquiries WHERE id = $1', [body.inquiryId])).notification_status, 'SENT');
    } finally {
      await h.close();
    }
  });

  test('retries are bounded, then the inquiry is kept with FAILED status', async () => {
    const h = await createHarness({ provider: fakeProvider(Array(10).fill('retryable')), env: { EMAIL_MAX_ATTEMPTS: '3' } });
    try {
      const { body } = await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      for (let i = 0; i < 6; i += 1) { await h.service.processDueJobs(); h.advance(6 * HOUR); }
      const job = await h.db.get('SELECT * FROM email_jobs');
      assert.equal(job.status, 'FAILED');
      assert.equal(job.attempts, 3);
      const inq = await h.db.get('SELECT * FROM inquiries WHERE id = $1', [body.inquiryId]);
      assert.equal(inq.notification_status, 'FAILED');
      assert.equal(inq.customer_name, 'Alex Morgan');
    } finally {
      await h.close();
    }
  });

  test('non-retryable failure fails immediately; manual retry works and is bounded', async () => {
    const h = await createHarness({ provider: fakeProvider(['fatal', 'ok']) });
    try {
      const { body } = await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      await h.service.processDueJobs();
      assert.equal((await h.db.get('SELECT status, attempts FROM email_jobs')).status, 'FAILED');

      const retry = await h.admin(`/api/admin/inquiries/${body.inquiryId}/retry-notification`, { method: 'POST' });
      assert.equal(retry.status, 200);
      await h.service.processDueJobs();
      assert.equal((await h.db.get('SELECT status FROM email_jobs')).status, 'SENT');
      assert.equal(h.provider.sent.length, 1);
      // Retrying a sent notification is refused.
      assert.equal((await h.admin(`/api/admin/inquiries/${body.inquiryId}/retry-notification`, { method: 'POST' })).status, 409);
    } finally {
      await h.close();
    }
  });

  test('without an email provider, jobs wait in the queue (nothing is lost or faked)', async () => {
    const h = await createHarness({ provider: { name: 'none', async send() { throw new Error('should not be called'); } } });
    try {
      await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      const r = await h.service.processDueJobs();
      assert.ok(r.skipped);
      assert.equal((await h.db.get('SELECT status FROM email_jobs')).status, 'PENDING');
      assert.equal((await h.db.get('SELECT notification_status FROM inquiries')).notification_status, 'PENDING');
    } finally {
      await h.close();
    }
  });

  test('a job claimed by one worker is not sent again by a concurrent one', async () => {
    const h = await createHarness();
    try {
      await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      await Promise.all([h.service.processDueJobs(), h.service.processDueJobs(), h.service.processDueJobs()]);
      assert.equal(h.provider.sent.length, 1);
    } finally {
      await h.close();
    }
  });

  test('inquiry saved without a job (crash) is repaired by the worker', async () => {
    const h = await createHarness();
    try {
      const { body } = await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      await h.db.run('DELETE FROM email_jobs');
      const r = await h.service.tick();
      assert.equal(r.repaired, 1);
      assert.equal(h.provider.sent.length, 1);
      assert.ok(h.provider.sent[0].text.includes(body.inquiryId));
    } finally {
      await h.close();
    }
  });
});

describe('webhooks', () => {
  const sign = (payload, { secret = WEBHOOK_SECRET, ts = Math.floor(Date.now() / 1000), id = `msg_${crypto.randomUUID()}` } = {}) => {
    const raw = JSON.stringify(payload);
    const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    const sig = crypto.createHmac('sha256', key).update(`${id}.${ts}.${raw}`).digest('base64');
    return { raw, headers: { 'svix-id': id, 'svix-timestamp': String(ts), 'svix-signature': `v1,${sig}` } };
  };

  test('signature verification', () => {
    const { raw, headers } = sign({ a: 1 });
    assert.equal(verifySvixSignature({ secret: WEBHOOK_SECRET, headers, rawBody: Buffer.from(raw) }), true);
    assert.equal(verifySvixSignature({ secret: WEBHOOK_SECRET, headers, rawBody: Buffer.from(raw + ' ') }), false);
    const old = sign({ a: 1 }, { ts: Math.floor(Date.now() / 1000) - 3600 });
    assert.equal(verifySvixSignature({ secret: WEBHOOK_SECRET, headers: old.headers, rawBody: Buffer.from(old.raw) }), false);
  });

  test('forged webhook is rejected; valid one marks delivered once', async () => {
    const h = await createHarness();
    try {
      const { body } = await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      await h.service.processDueJobs();
      const payload = { type: 'email.delivered', data: { email_id: 'msg_1' } };

      const forged = sign(payload, { secret: `whsec_${Buffer.from('wrong').toString('base64')}` });
      assert.equal((await h.request('/api/webhooks/resend', { method: 'POST', raw: forged.raw, headers: forged.headers })).status, 401);
      assert.equal((await h.request('/api/webhooks/resend', { method: 'POST', body: payload })).status, 401);
      assert.equal((await h.db.get('SELECT notification_status FROM inquiries')).notification_status, 'SENT');

      const ok = sign(payload);
      const first = await h.request('/api/webhooks/resend', { method: 'POST', raw: ok.raw, headers: ok.headers });
      assert.equal(first.body.result, 'applied');
      const replay = await h.request('/api/webhooks/resend', { method: 'POST', raw: ok.raw, headers: ok.headers });
      assert.equal(replay.body.result, 'duplicate');
      const inq = await h.db.get('SELECT notification_status FROM inquiries WHERE id = $1', [body.inquiryId]);
      assert.equal(inq.notification_status, 'DELIVERED');
    } finally {
      await h.close();
    }
  });

  test('bounce is recorded', async () => {
    const h = await createHarness();
    try {
      await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      await h.service.processDueJobs();
      const s = sign({ type: 'email.bounced', data: { email_id: 'msg_1', bounce: { message: 'Mailbox does not exist' } } });
      await h.request('/api/webhooks/resend', { method: 'POST', raw: s.raw, headers: s.headers });
      const job = await h.db.get('SELECT * FROM email_jobs');
      assert.equal(job.status, 'BOUNCED');
      assert.match(job.last_error, /Mailbox/);
      assert.equal((await h.db.get('SELECT notification_status FROM inquiries')).notification_status, 'BOUNCED');
    } finally {
      await h.close();
    }
  });
});

describe('admin API', () => {
  test('requires the admin token', async () => {
    const h = await createHarness();
    try {
      await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      assert.equal((await h.request('/api/admin/inquiries')).status, 401);
      assert.equal((await h.request('/api/admin/inquiries', { headers: { Authorization: 'Bearer wrong' } })).status, 401);
      assert.equal((await h.request('/api/admin/inquiries', { method: 'PATCH', body: { status: 'CLOSED' } })).status, 401);
      const ok = await h.admin('/api/admin/inquiries');
      assert.equal(ok.status, 200);
      assert.equal(ok.body.inquiries.length, 1);
      assert.equal(ok.body.inquiries[0].idempotency_key, undefined);
      assert.equal(ok.headers.get('cache-control'), 'no-store');
    } finally {
      await h.close();
    }
  });

  test('admin is disabled when ADMIN_TOKEN is missing or weak', async () => {
    const h = await createHarness({ env: { ADMIN_TOKEN: 'short' } });
    try {
      assert.equal((await h.request('/api/admin/inquiries', { headers: { Authorization: 'Bearer short' } })).status, 503);
    } finally {
      await h.close();
    }
  });

  test('locks out repeated bad tokens', async () => {
    const h = await createHarness();
    try {
      for (let i = 0; i < 20; i += 1) await h.request('/api/admin/stats', { headers: { Authorization: 'Bearer nope' } });
      assert.equal((await h.request('/api/admin/stats', { headers: { Authorization: 'Bearer nope' } })).status, 429);
    } finally {
      await h.close();
    }
  });

  test('status, assignment, notes and invalid updates', async () => {
    const h = await createHarness();
    try {
      const { body } = await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      const url = `/api/admin/inquiries/${body.inquiryId}`;
      assert.equal((await h.admin(url, { method: 'PATCH', body: { status: 'HACKED' } })).status, 422);
      assert.equal((await h.admin(url, { method: 'PATCH', body: { assignedTo: 'CEO' } })).status, 422);
      assert.equal((await h.admin(url, { method: 'PATCH', body: { note: '' } })).status, 422);
      assert.equal((await h.admin('/api/admin/inquiries/nope', { method: 'PATCH', body: { status: 'CLOSED' } })).status, 404);

      const res = await h.admin(url, {
        method: 'PATCH',
        body: { status: 'CONTACTED', assignedTo: 'Designer', supportingRoles: ['Developer'], note: 'Called client, sending deck.' },
        headers: { 'X-Staff-Name': 'Likhitha' },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.inquiry.status, 'CONTACTED');
      assert.equal(res.body.inquiry.assigned_to, 'Designer');
      assert.deepEqual(res.body.inquiry.supporting_roles, ['Developer']);
      const types = res.body.events.map((e) => e.type);
      for (const t of ['CREATED', 'STATUS_CHANGED', 'ASSIGNED', 'SUPPORT_UPDATED', 'NOTE']) assert.ok(types.includes(t), t);
      assert.ok(res.body.events.every((e) => e.actor === 'website' || e.actor === 'admin:Likhitha' || e.actor === 'system'));

      const stats = await h.admin('/api/admin/stats');
      assert.equal(stats.body.total, 1);
      assert.equal(stats.body.byStatus.CONTACTED, 1);
    } finally {
      await h.close();
    }
  });

  test('cron endpoint requires its secret', async () => {
    const h = await createHarness();
    try {
      assert.equal((await h.request('/api/cron/inquiries', { method: 'POST' })).status, 401);
      const ok = await h.request('/api/cron/inquiries', { method: 'POST', headers: { Authorization: `Bearer ${CRON_SECRET}` } });
      assert.equal(ok.status, 200);
      assert.equal(ok.body.ok, true);
    } finally {
      await h.close();
    }
  });

  test('dashboard page is served with a strict CSP and no customer data', async () => {
    const h = await createHarness();
    try {
      await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      const res = await fetch(`${h.base}/admin/`);
      const html = await res.text();
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-security-policy'), /script-src 'self'/);
      assert.match(res.headers.get('content-security-policy'), /frame-ancestors 'none'/);
      assert.ok(html.includes('Staff sign-in'));
      assert.ok(!html.includes('Alex Morgan') && !html.includes('alex@brand.com'));
    } finally {
      await h.close();
    }
  });
});

describe('follow-up automation', () => {
  test('unreviewed reminder fires once after 24h, to the owner', async () => {
    const h = await createHarness({ env: { TEAM_CLIENT_MANAGER: 'Likhitha <likhitha@fold.example>' } });
    try {
      await h.request('/api/inquiries', { method: 'POST', body: validBody() });
      await h.service.tick();
      assert.equal(h.provider.sent.length, 1);
      h.advance(23 * HOUR);
      await h.service.tick();
      assert.equal(h.provider.sent.length, 1);
      h.advance(2 * HOUR);
      await h.service.tick();
      await h.service.tick();
      h.advance(48 * HOUR);
      await h.service.tick();
      assert.equal(h.provider.sent.length, 2);
      const reminder = h.provider.sent[1];
      assert.equal(reminder.to, 'likhitha@fold.example');
      assert.match(reminder.subject, /REMINDER/);
      assert.ok(reminder.text.startsWith('Hi Likhitha,'));
    } finally {
      await h.close();
    }
  });

  test('no reminder once contacted, or when paused', async () => {
    const h = await createHarness();
    try {
      const a = (await h.request('/api/inquiries', { method: 'POST', body: validBody() })).body.inquiryId;
      const b = (await h.request('/api/inquiries', { method: 'POST', body: validBody() })).body.inquiryId;
      await h.service.tick();
      await h.admin(`/api/admin/inquiries/${a}`, { method: 'PATCH', body: { status: 'CONTACTED' } });
      await h.admin(`/api/admin/inquiries/${b}`, { method: 'PATCH', body: { remindersPaused: true } });
      h.advance(30 * HOUR);
      await h.service.tick();
      assert.equal(h.provider.sent.length, 2); // just the two notifications
    } finally {
      await h.close();
    }
  });

  test('quotation follow-up after N business days; client response stops it', async () => {
    // Tue 3 Nov 2026 12:00 IST; 3 business days -> Fri 6 Nov.
    const h = await createHarness();
    try {
      const a = (await h.request('/api/inquiries', { method: 'POST', body: validBody() })).body.inquiryId;
      const b = (await h.request('/api/inquiries', { method: 'POST', body: validBody() })).body.inquiryId;
      await h.service.tick();
      for (const id of [a, b]) await h.admin(`/api/admin/inquiries/${id}`, { method: 'PATCH', body: { status: 'QUOTATION_SENT' } });
      const due = (await h.db.get('SELECT quotation_followup_due_at FROM inquiries WHERE id = $1', [a])).quotation_followup_due_at;
      assert.equal(due, '2026-11-06T06:30:00.000Z');

      await h.admin(`/api/admin/inquiries/${b}`, { method: 'PATCH', body: { customerResponded: true } });
      h.advance(2 * 24 * HOUR);
      await h.service.tick();
      assert.equal(h.provider.sent.length, 2);
      h.advance(2 * 24 * HOUR);
      await h.service.tick();
      await h.service.tick();
      assert.equal(h.provider.sent.length, 3);
      assert.match(h.provider.sent[2].subject, /Quotation follow-up/);
      assert.ok(h.provider.sent[2].to === 'enquiryfoldstudio@gmail.com'); // no customer is ever emailed automatically
    } finally {
      await h.close();
    }
  });

  test('closing an inquiry cancels a queued reminder', async () => {
    const h = await createHarness({ provider: fakeProvider(['ok', 'retryable']) });
    try {
      const id = (await h.request('/api/inquiries', { method: 'POST', body: validBody() })).body.inquiryId;
      await h.service.tick();
      h.advance(25 * HOUR);
      await h.service.tick(); // reminder attempt fails transiently -> RETRYING
      assert.equal((await h.db.get("SELECT status FROM email_jobs WHERE kind = 'reminder_unreviewed'")).status, 'RETRYING');
      await h.admin(`/api/admin/inquiries/${id}`, { method: 'PATCH', body: { status: 'CLOSED' } });
      assert.equal((await h.db.get("SELECT status FROM email_jobs WHERE kind = 'reminder_unreviewed'")).status, 'CANCELLED');
    } finally {
      await h.close();
    }
  });

  test('business-day arithmetic skips weekends (IST)', () => {
    assert.equal(addBusinessDays(new Date('2026-11-06T06:30:00Z'), 1).toISOString(), '2026-11-09T06:30:00.000Z'); // Fri -> Mon
    assert.equal(addBusinessDays(new Date('2026-11-03T06:30:00Z'), 3).toISOString(), '2026-11-06T06:30:00.000Z');
  });
});

test('server and frontend option lists are identical', async () => {
  const fs = await import('node:fs/promises');
  const src = await fs.readFile(new URL('../src/utils/inquiryForm.ts', import.meta.url), 'utf8');
  const list = (name) => JSON.parse(src.match(new RegExp(`export const ${name} = (\\[[\\s\\S]*?\\]);`))[1].replace(/'/g, '"').replace(/,\s*\]/, ']'));
  assert.deepEqual(list('SERVICES'), SERVICES);
  assert.deepEqual(list('BUDGETS'), BUDGETS);
});
