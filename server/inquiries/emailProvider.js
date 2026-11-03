// Resend REST integration (https://resend.com/docs/api-reference/emails/send-email).
// Uses fetch directly, so no SDK dependency. The API key never leaves the server.

export class EmailError extends Error {
  constructor(message, { retryable }) {
    super(message);
    this.retryable = retryable;
  }
}

export const createResendProvider = ({ apiKey, from, fetchImpl = fetch, timeoutMs = 15_000 }) => ({
  name: 'resend',
  async send({ to, replyTo, subject, html, text, idempotencyKey }) {
    if (!apiKey || !from) throw new EmailError('Email provider is not configured (RESEND_API_KEY / EMAIL_FROM).', { retryable: false });
    let res;
    try {
      res = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          // Resend de-duplicates sends with the same key for 24h, so a retry after a
          // lost response cannot produce a second email.
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          from,
          to: [to],
          ...(replyTo ? { reply_to: replyTo } : {}),
          subject,
          html,
          text,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      throw new EmailError(`Network error contacting Resend: ${err.name}`, { retryable: true });
    }

    const body = await res.json().catch(() => ({}));
    if (res.ok && body.id) return { providerMessageId: body.id };

    const detail = typeof body.message === 'string' ? body.message.slice(0, 300) : res.statusText;
    // 429 and 5xx are transient; other 4xx (bad key, unverified domain, invalid recipient) are not.
    const retryable = res.status === 429 || res.status >= 500;
    throw new EmailError(`Resend ${res.status}: ${detail}`, { retryable });
  },
});

/** Used when no provider is configured: every send fails visibly instead of pretending. */
export const createUnconfiguredProvider = () => ({
  name: 'none',
  async send() {
    throw new EmailError('No email provider configured. Set RESEND_API_KEY and EMAIL_FROM.', { retryable: false });
  },
});
