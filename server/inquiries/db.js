// Storage adapter: PostgreSQL in production (DATABASE_URL=postgres://...),
// Node's built-in SQLite for local development and tests.
// Queries are written once with $1, $2 ... placeholders and run on both engines.

const PG_SCHEMA = `
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  selected_services JSONB NOT NULL,
  estimated_budget TEXT NOT NULL,
  project_brief TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'NEW',
  assigned_to TEXT,
  supporting_roles JSONB NOT NULL DEFAULT '[]',
  notification_status TEXT NOT NULL DEFAULT 'PENDING',
  notification_sent_at TIMESTAMPTZ,
  provider_message_id TEXT,
  customer_responded_at TIMESTAMPTZ,
  reminders_paused BOOLEAN NOT NULL DEFAULT FALSE,
  unreviewed_reminder_sent_at TIMESTAMPTZ,
  quotation_followup_due_at TIMESTAMPTZ,
  quotation_followup_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries (status, created_at);

CREATE TABLE IF NOT EXISTS email_jobs (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL REFERENCES inquiries(id),
  kind TEXT NOT NULL,
  dedupe_key TEXT NOT NULL UNIQUE,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL,
  manual_retries INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL,
  locked_until TIMESTAMPTZ,
  last_error TEXT,
  provider_message_id TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS email_jobs_due_idx ON email_jobs (status, next_attempt_at);
CREATE INDEX IF NOT EXISTS email_jobs_provider_idx ON email_jobs (provider_message_id);

CREATE TABLE IF NOT EXISTS inquiry_events (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL REFERENCES inquiries(id),
  type TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS inquiry_events_inquiry_idx ON inquiry_events (inquiry_id, created_at);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL
);
`;

// Same shape for SQLite; JSON stored as TEXT, timestamps as ISO-8601 UTC TEXT, booleans as 0/1.
const SQLITE_SCHEMA = PG_SCHEMA
  .replace(/JSONB/g, 'TEXT')
  .replace(/TIMESTAMPTZ/g, 'TEXT')
  .replace(/BOOLEAN NOT NULL DEFAULT FALSE/g, 'INTEGER NOT NULL DEFAULT 0');

const JSON_COLUMNS = ['selected_services', 'supporting_roles'];
const BOOL_COLUMNS = ['reminders_paused'];

const normaliseRow = (row) => {
  if (!row) return row;
  const out = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (value instanceof Date) out[key] = value.toISOString();
    else if (JSON_COLUMNS.includes(key) && typeof value === 'string') out[key] = JSON.parse(value);
    else if (BOOL_COLUMNS.includes(key)) out[key] = Boolean(value);
  }
  return out;
};

// TLS for PostgreSQL. Supabase signs its server certificates with its own CA, which Node does not
// trust by default: put that CA (Supabase → Database → SSL Configuration → Download certificate)
// in DATABASE_CA_CERT so the server certificate can be verified.
// An sslmode in the URL would override these options inside pg, so it is removed here.
export const pgConnectionOptions = (connectionString, env = {}) => {
  const url = new URL(connectionString);
  const sslmode = url.searchParams.get('sslmode');
  url.searchParams.delete('sslmode');
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname);
  let ssl;
  if (sslmode === 'disable' || (local && !sslmode)) ssl = false;
  else if (env.DATABASE_CA_CERT) ssl = { ca: env.DATABASE_CA_CERT.replace(/\\n/g, '\n'), rejectUnauthorized: true };
  else ssl = { rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' };
  return { connectionString: url.toString(), ssl };
};

const createPgDb = async (connectionString) => {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({
    ...pgConnectionOptions(connectionString, process.env),
    max: Number(process.env.DATABASE_POOL_MAX) || 5,
  });
  pool.on('error', (err) => console.error('[inquiries/db] idle client error:', err.message));
  await pool.query(PG_SCHEMA);
  return {
    engine: 'postgres',
    async all(sql, params = []) {
      const { rows } = await pool.query(sql, params);
      return rows.map(normaliseRow);
    },
    async get(sql, params = []) {
      const { rows } = await pool.query(sql, params);
      return normaliseRow(rows[0]);
    },
    async run(sql, params = []) {
      const { rowCount } = await pool.query(sql, params);
      return { changes: rowCount };
    },
    async close() {
      await pool.end();
    },
  };
};

const createSqliteDb = async (file) => {
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SQLITE_SCHEMA);
  // $1 -> ?1 (SQLite numbered parameters); booleans -> 0/1.
  const prep = (sql) => db.prepare(sql.replace(/\$(\d+)/g, '?$1'));
  const bind = (params) => params.map((p) => (typeof p === 'boolean' ? Number(p) : p));
  return {
    engine: 'sqlite',
    async all(sql, params = []) {
      return prep(sql).all(...bind(params)).map(normaliseRow);
    },
    async get(sql, params = []) {
      return normaliseRow(prep(sql).get(...bind(params)));
    },
    async run(sql, params = []) {
      const { changes } = prep(sql).run(...bind(params));
      return { changes: Number(changes) };
    },
    async close() {
      db.close();
    },
  };
};

/**
 * DATABASE_URL=postgres://... -> PostgreSQL.
 * DATABASE_URL=sqlite:./path.db, sqlite::memory:, or unset -> SQLite (local only).
 */
export const createDb = async (databaseUrl) => {
  if (databaseUrl && /^postgres(ql)?:\/\//.test(databaseUrl)) return createPgDb(databaseUrl);
  const file = databaseUrl?.startsWith('sqlite:') ? databaseUrl.slice('sqlite:'.length) || ':memory:' : './server/inquiries.local.db';
  return createSqliteDb(file);
};
