# FOLD Inquiry Automation

Every START A PROJECT submission is validated, **saved to the database first**, then emailed to
`enquiryfoldstudio@gmail.com` through a retrying queue. The team tracks follow-up in `/admin`.

```
Visitor ─► START A PROJECT modal (React)
             │  POST /api/inquiries  {name, email, services[], budget, projectBrief, idempotencyKey}
             ▼
        Express API ── validate (strict service/budget lists, length limits, rate limit, honeypot)
             │
             ▼
        PostgreSQL ── inquiries · email_jobs · inquiry_events · webhook_events
             │                      ▲
             ▼                      │ status, owner, notes, reminders
        Email worker (in-process, every 60s + immediately after each submit; also /api/cron/inquiries)
             │  bounded retries, exponential backoff, Resend Idempotency-Key
             ▼
        Resend API ─► enquiryfoldstudio@gmail.com  (Reply-To = customer)
             │
             └─► POST /api/webhooks/resend (signed) ─► DELIVERED / BOUNCED recorded
```

The browser never sees an API key. The response "inquiry received" means the inquiry is **stored**;
email delivery is tracked separately (`PENDING → SENT → DELIVERED`, or `FAILED` / `BOUNCED`).

## Files

| Path | Purpose |
|---|---|
| `server/inquiries/schema.js` | Allowed services/budgets/statuses/roles, server validation, suggested owner |
| `server/inquiries/db.js` | PostgreSQL (production) / built-in SQLite (local dev & tests), schema |
| `server/inquiries/service.js` | Save, idempotency, email queue + retries, reminders, admin actions, webhook handling |
| `server/inquiries/emailTemplates.js` | Internal notification, client confirmation, internal reminders (HTML + text) |
| `server/inquiries/emailProvider.js` | Resend REST client |
| `server/inquiries/routes.js` | `/api/inquiries`, `/api/webhooks/resend`, `/api/cron/inquiries`, `/api/admin/*`, `/admin` |
| `server/inquiries/config.js`, `index.js` | Env config; wiring + worker |
| `server/admin/*` | Token-protected team dashboard |
| `src/utils/inquiryForm.ts` | Form options, validation, payload builder (shared by the modal and tests) |
| `src/components/ProjectModal.tsx` | Existing modal, now posting to the backend (visual design unchanged) |
| `tests/*.test.{js,ts}` | `npm test` |
| `docs/email-preview-*.html` | Rendered sample emails |

## 1. Email sender (Resend)

1. Create an account at <https://resend.com>.
2. **Domain (recommended, required for client confirmations):** Resend → Domains → Add domain
   (e.g. `foldstudio.in` or a subdomain like `mail.foldstudio.in`). Add the SPF/DKIM DNS records
   it shows at your domain registrar and wait for **Verified**. Then set
   `EMAIL_FROM="FOLD Studio <inquiries@yourdomain>"`.
   - **Without a domain:** `EMAIL_FROM="FOLD Studio <onboarding@resend.dev>"` only delivers to the
     email address that owns the Resend account. Sign up to Resend **with enquiryfoldstudio@gmail.com**
     and internal notifications will work; client confirmations and team reminders to other
     addresses will not (keep `SEND_CLIENT_CONFIRMATION=false`).
3. Resend → API Keys → create a key with **Sending access** → `RESEND_API_KEY`.
4. Resend → Webhooks → add endpoint `https://<your-host>/api/webhooks/resend`, events
   `email.delivered`, `email.bounced`, `email.complained`, `email.failed` → copy the signing
   secret → `RESEND_WEBHOOK_SECRET`.

Receiving stays in the existing Gmail inbox; no Google Workspace is needed.

## 2. Database

Production needs PostgreSQL (the host's disk is wiped on redeploy, so SQLite is refused when
`NODE_ENV=production`). Any of these free tiers works:

- **Supabase** → Project → Connect → *Session pooler* URI
- **Neon** → Connection string
- Render Postgres (free instances expire; use a paid plan if you choose this)

Set `DATABASE_URL=postgres://...`. For Supabase also download the CA certificate (Database → SSL
Configuration → Download certificate) and paste its full contents into `DATABASE_CA_CERT`; without it
the connection fails with `SELF_SIGNED_CERT_IN_CHAIN`. Tables are created automatically on first start. Enable the
provider's daily backups. Use a database user that only has access to this database.

## 3. Environment variables

| Variable | Where | Notes |
|---|---|---|
| `DATABASE_URL` | Prod | PostgreSQL URL (required in production) |
| `DATABASE_CA_CERT` | Prod | Database CA certificate (PEM); required for Supabase |
| `RESEND_API_KEY` | Prod | Sending-access key |
| `EMAIL_FROM` | Prod | Verified sender (see above) |
| `EMAIL_TO` | Prod | `enquiryfoldstudio@gmail.com` |
| `RESEND_WEBHOOK_SECRET` | Prod | `whsec_...` |
| `APP_BASE_URL` | Prod | Public site URL, used for dashboard links in emails |
| `ADMIN_TOKEN` | Prod | ≥24 random chars (`openssl rand -base64 32`). Share only with staff |
| `CRON_SECRET` | Prod | Random string for the scheduled job |
| `SEND_CLIENT_CONFIRMATION` | Optional | `true` to email customers an acknowledgement (needs verified domain) |
| `TEAM_CLIENT_MANAGER` … `TEAM_ASSISTANT_DEVELOPER` | Optional | `"Name <email>"`; reminders go to the owner, else `EMAIL_TO` |
| `REMINDER_UNREVIEWED_HOURS` | Optional | default 24 |
| `QUOTATION_FOLLOWUP_BUSINESS_DAYS` | Optional | default 3 |
| `VITE_API_BASE_URL` | Frontend build | Only when the site is hosted separately from Express, e.g. `https://fold-studio.onrender.com/api` |

Locally, copy `.env.example` → `.env`. Never commit `.env`.

**Rotating credentials:** create the new Resend key / webhook secret / admin token, update the
host's env vars, redeploy, then revoke the old one in Resend (or simply change `ADMIN_TOKEN` —
all dashboard sessions are invalidated immediately).

## 4. Deploy (Render — matches the existing `render.yaml`)

The Express server serves both the built site and the API, so one Render Web Service runs everything.

1. Push the repo to GitHub, then Render → New → Blueprint → select the repo (uses `render.yaml`).
2. Fill the env vars marked `sync: false` (DATABASE_URL, RESEND_API_KEY, EMAIL_FROM,
   RESEND_WEBHOOK_SECRET, APP_BASE_URL). `ADMIN_TOKEN` and `CRON_SECRET` are generated — copy them
   from the dashboard.
3. Deploy. Logs should show: `[inquiries] ready — db: postgres, email: resend, admin: enabled`.
4. **Scheduled processing:** Render's free plan sleeps after ~15 min idle, pausing the in-process
   worker (new inquiries are still sent instantly because the request wakes it). For retries and
   24h reminders, create a free job at <https://cron-job.org> (every 10 min):
   - `POST https://<your-host>/api/cron/inquiries`
   - Header `Authorization: Bearer <CRON_SECRET>`
   (or upgrade to a paid instance, which never sleeps).
5. Point your domain at the service and set `APP_BASE_URL`.

If the site stays on **Netlify/Vercel** as a static build, deploy the Express server on Render as
above and build the frontend with `VITE_API_BASE_URL=https://<render-host>/api`.

## 5. Local testing

```bash
npm install
npm test                 # 75 automated tests (SQLite)
npm run build && npm start   # http://localhost:5001  ·  dashboard: /admin
```

Without `RESEND_API_KEY` inquiries are saved and their emails wait in the queue as `PENDING`
(shown in the dashboard). Add a key to send real emails. To run the suite against PostgreSQL:
`TEST_DATABASE_URL=postgres://... DATABASE_POOL_MAX=1 node --test --test-concurrency=1 tests/`.

Sample request:

```bash
curl -i -X POST http://localhost:5001/api/inquiries -H 'Content-Type: application/json' -d '{"name":"Alex Morgan","email":"you+test@example.com","services":["Brand Identity","Website Design","Content Creation"],"budget":"₹25,000–₹50,000","projectBrief":"We need complete branding, a website and promotional creative materials for our new company.","idempotencyKey":"manual-test-0001"}'
```

## 6. Team workflow

- New inquiry → status **NEW**, suggested owner from the services (multi-service and Full Retainer →
  Client Manager, with supporting roles), email to the inbox with Reply-To = customer.
- Still NEW after 24h → one reminder to the owner (never repeated).
- Statuses: NEW · CONTACTED · REQUIREMENTS DISCUSSED · QUOTATION SENT · ACCEPTED · IN PROGRESS ·
  COMPLETED · DECLINED · CLOSED.
- QUOTATION SENT → after N business days with no recorded client reply, one internal reminder to
  follow up. **No email is ever sent to a customer automatically** except the optional acknowledgement.
- "Client responded", "Pause reminders", moving out of NEW, or closing all stop pending reminders.
- Reply detection is manual ("Client responded" button) — Gmail replies are not read by the system.

## 7. Security notes

Strict allow-lists for services/budgets/statuses/roles; length limits; CR/LF rejected in name/email
(no header injection); all email/dashboard output escaped; 5 submissions / 10 min per IP; honeypot;
50 KB body limit; idempotency keys; signed + replay-protected webhooks; constant-time token checks
with lockout after 20 bad attempts; dashboard served with a strict CSP and `noindex`; no customer
data on any public endpoint. Stored data: name, email, services, budget, brief, status history —
delete closed inquiries after your chosen retention period (e.g. 24 months) directly in the database.

`app.use(cors())` in `server/server.js` is still open to all origins (it predates this work and the
payment routes rely on it). Inquiry and admin routes don't depend on cookies, so this does not expose
them, but restrict it to your domain once the payment flow is confirmed.
