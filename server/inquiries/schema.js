// Allowed values and validation for website project inquiries.
// SERVICES and BUDGETS must stay identical to src/utils/inquiryForm.ts (a test enforces this).

export const SERVICES = [
  'Brand Identity',
  'Website Design',
  'Digital Experiences',
  'Content Creation',
  'Creative Direction',
  'Full Retainer',
];

export const BUDGETS = [
  '₹5,000–₹10,000',
  '₹10,000–₹25,000',
  '₹25,000–₹50,000',
  '₹50,000–₹1,00,000',
  '₹1,00,000+',
  'Not Sure Yet',
];

export const STATUSES = [
  'NEW',
  'CONTACTED',
  'REQUIREMENTS_DISCUSSED',
  'QUOTATION_SENT',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'DECLINED',
  'CLOSED',
];

export const STATUS_LABELS = {
  NEW: 'New Inquiry',
  CONTACTED: 'Contacted',
  REQUIREMENTS_DISCUSSED: 'Requirements Discussed',
  QUOTATION_SENT: 'Quotation Sent',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DECLINED: 'Declined',
  CLOSED: 'Closed',
};

// Statuses after which no lead-conversion reminders are sent.
export const TERMINAL_STATUSES = ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED', 'CLOSED'];

export const ROLES = [
  'Client Manager',
  'Social Media Manager',
  'Designer',
  'Developer',
  'Assistant Developer',
];

// Suggested default owners per service. The Client Manager can override these.
export const SERVICE_ROLE_MAP = {
  'Brand Identity': ['Designer'],
  'Website Design': ['Developer'],
  'Digital Experiences': ['Developer', 'Designer'],
  'Content Creation': ['Designer', 'Social Media Manager'],
  'Creative Direction': ['Designer', 'Client Manager'],
  'Full Retainer': ['Client Manager'],
};

export const LIMITS = {
  nameMin: 2,
  nameMax: 120,
  emailMax: 254,
  briefMax: 5000,
  idempotencyKeyMax: 100,
  noteMax: 2000,
};

// Pragmatic address check: one @, no whitespace/control/angle brackets/quotes/commas,
// a dotted domain. Rejects CR/LF so the value can never inject mail headers.
const EMAIL_RE = /^[^\s@<>()",;:\\[\]]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const LINE_BREAKS = /[\r\n\u2028\u2029]/;
const IDEMPOTENCY_RE = /^[A-Za-z0-9_-]{8,100}$/;

export const isValidEmail = (value) =>
  typeof value === 'string' && value.length <= LIMITS.emailMax && EMAIL_RE.test(value);

/**
 * Validates a raw request body. Returns { ok: true, value } with normalised fields,
 * or { ok: false, errors } keyed by field name.
 */
export const validateInquiry = (body) => {
  const errors = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: { form: 'Malformed request.' } };
  }

  const name = typeof body.name === 'string' ? body.name.normalize('NFC').trim().replace(/\s+/g, ' ') : '';
  if (name.length < LIMITS.nameMin) errors.name = 'Please enter your name (minimum 2 characters).';
  else if (name.length > LIMITS.nameMax) errors.name = `Name must be ${LIMITS.nameMax} characters or fewer.`;
  else if (CONTROL_CHARS.test(name) || LINE_BREAKS.test(body.name)) errors.name = 'Name contains invalid characters.';

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email) errors.email = 'Please enter your work email address.';
  else if (LINE_BREAKS.test(body.email) || !isValidEmail(email)) errors.email = 'Please enter a valid work email address.';

  const rawServices = body.services;
  if (!Array.isArray(rawServices) || rawServices.length === 0) {
    errors.services = 'Please select at least one required service.';
  } else if (rawServices.length > SERVICES.length || rawServices.some((s) => !SERVICES.includes(s))) {
    errors.services = 'One or more selected services are not recognised.';
  } else if (new Set(rawServices).size !== rawServices.length) {
    errors.services = 'Each service can only be selected once.';
  }
  // Keep the website's display order regardless of click order.
  const services = Array.isArray(rawServices) ? SERVICES.filter((s) => rawServices.includes(s)) : [];

  const budget = body.budget;
  if (typeof budget !== 'string' || !budget) errors.budget = 'Please select an estimated budget range.';
  else if (!BUDGETS.includes(budget)) errors.budget = 'The selected budget is not recognised.';

  const rawBrief = body.projectBrief ?? body.brief ?? '';
  let projectBrief = '';
  if (typeof rawBrief !== 'string') {
    errors.projectBrief = 'Project brief must be text.';
  } else {
    projectBrief = rawBrief.normalize('NFC').replace(/\r\n?/g, '\n').replace(CONTROL_CHARS, '').trim();
    if (projectBrief.length > LIMITS.briefMax) {
      errors.projectBrief = `Project brief must be ${LIMITS.briefMax} characters or fewer.`;
    }
  }

  const idempotencyKey = body.idempotencyKey;
  if (typeof idempotencyKey !== 'string' || !IDEMPOTENCY_RE.test(idempotencyKey)) {
    errors.idempotencyKey = 'Missing or invalid submission key.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: { name, email, services, budget, projectBrief, idempotencyKey },
  };
};

/** Suggested primary owner + supporting roles for a set of services. */
export const suggestAssignment = (services) => {
  const roles = [];
  for (const service of services) {
    for (const role of SERVICE_ROLE_MAP[service] || []) {
      if (!roles.includes(role)) roles.push(role);
    }
  }
  // Multi-discipline or retainer work is coordinated by the Client Manager.
  const primary = services.length > 1 || roles.includes('Client Manager') ? 'Client Manager' : roles[0] || 'Client Manager';
  return { primary, supporting: roles.filter((r) => r !== primary) };
};
