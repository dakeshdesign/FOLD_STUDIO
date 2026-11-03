// Reads inquiry-automation settings from the environment. No secrets are hard-coded.

const int = (value, fallback) => {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const ROLE_ENV = {
  'Client Manager': 'TEAM_CLIENT_MANAGER',
  'Social Media Manager': 'TEAM_SOCIAL_MEDIA_MANAGER',
  Designer: 'TEAM_DESIGNER',
  Developer: 'TEAM_DEVELOPER',
  'Assistant Developer': 'TEAM_ASSISTANT_DEVELOPER',
};

// Defaults mirror the TEAM section of the website. Emails are optional; reminders
// for a role without an email go to the main inquiry inbox.
const DEFAULT_TEAM = {
  'Client Manager': 'Likhitha',
  'Social Media Manager': 'Ganesh',
  Designer: 'Dakesh',
  Developer: 'Ganesh',
  'Assistant Developer': 'Manikanta',
};

/** TEAM_DESIGNER="Dakesh <dakesh@example.com>" or just "Dakesh". */
const parseMember = (raw, fallbackName) => {
  const match = /^\s*([^<]*?)\s*(?:<([^>]+)>)?\s*$/.exec(raw || '');
  const name = (match?.[1] || fallbackName).trim();
  const email = match?.[2]?.trim() || null;
  return { name, email };
};

export const loadConfig = (env = process.env) => {
  const team = {};
  for (const [role, key] of Object.entries(ROLE_ENV)) team[role] = parseMember(env[key], DEFAULT_TEAM[role]);

  return {
    production: env.NODE_ENV === 'production',
    // DATABASE_URL is only used when it is PostgreSQL; anything else (e.g. a legacy sqlite
    // value) falls back to the local dev database. DATABASE_URL_INQUIRIES overrides both.
    databaseUrl: env.DATABASE_URL_INQUIRIES || (/^postgres(ql)?:\/\//.test(env.DATABASE_URL || '') ? env.DATABASE_URL : undefined),
    email: {
      provider: env.RESEND_API_KEY ? 'resend' : 'none',
      resendApiKey: env.RESEND_API_KEY || '',
      from: env.EMAIL_FROM || '',
      to: env.EMAIL_TO || env.INQUIRY_RECIPIENT || 'enquiryfoldstudio@gmail.com',
      sendClientConfirmation: env.SEND_CLIENT_CONFIRMATION === 'true',
      webhookSecret: env.RESEND_WEBHOOK_SECRET || '',
    },
    adminToken: env.ADMIN_TOKEN || '',
    cronSecret: env.CRON_SECRET || '',
    appBaseUrl: (env.APP_BASE_URL || '').replace(/\/+$/, ''),
    queue: {
      maxAttempts: int(env.EMAIL_MAX_ATTEMPTS, 6),
      baseDelayMs: int(env.EMAIL_RETRY_BASE_MS, 30_000),
      pollIntervalMs: int(env.EMAIL_POLL_INTERVAL_MS, 60_000),
      lockMs: 2 * 60_000,
    },
    followUp: {
      unreviewedReminderHours: int(env.REMINDER_UNREVIEWED_HOURS, 24),
      quotationFollowUpBusinessDays: int(env.QUOTATION_FOLLOWUP_BUSINESS_DAYS, 3),
    },
    rateLimit: {
      windowMs: int(env.INQUIRY_RATE_WINDOW_MS, 10 * 60_000),
      max: int(env.INQUIRY_RATE_MAX, 5),
    },
    team,
  };
};
