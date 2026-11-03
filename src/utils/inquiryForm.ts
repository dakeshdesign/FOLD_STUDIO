// Form options and pure helpers for the START A PROJECT inquiry modal.
// SERVICES and BUDGETS must stay identical to server/inquiries/schema.js (a test enforces this).

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

export const LIMITS = { nameMax: 120, emailMax: 254, briefMax: 5000 };

export interface InquiryFields {
  name: string;
  email: string;
  services: string[];
  budget: string;
  details: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  services?: string;
  budget?: string;
  details?: string;
}

const EMAIL_RE = /^[^\s@<>()",;:\\[\]]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

/** Adds the service if absent, removes it if present. Never drops other selections. */
export const toggleService = (selected: string[], service: string): string[] =>
  selected.includes(service) ? selected.filter((s) => s !== service) : [...selected, service];

export const validateInquiryFields = (fields: InquiryFields): FormErrors => {
  const errors: FormErrors = {};
  const name = fields.name.trim();
  const email = fields.email.trim();

  if (name.length < 2) errors.name = 'Please enter your name (minimum 2 characters).';
  else if (name.length > LIMITS.nameMax) errors.name = `Name must be ${LIMITS.nameMax} characters or fewer.`;

  if (!email) errors.email = 'Please enter your work email address.';
  else if (email.length > LIMITS.emailMax || !EMAIL_RE.test(email)) {
    errors.email = 'Please enter a valid work email address (e.g. name@brand.com).';
  }

  if (fields.services.length === 0) errors.services = 'Please select at least one required service.';
  if (!BUDGETS.includes(fields.budget)) errors.budget = 'Please select an estimated budget range.';
  if (fields.details.trim().length > LIMITS.briefMax) {
    errors.details = `Project brief must be ${LIMITS.briefMax} characters or fewer.`;
  }
  return errors;
};

export const buildInquiryPayload = (fields: InquiryFields, idempotencyKey: string) => ({
  name: fields.name.trim(),
  email: fields.email.trim(),
  services: [...fields.services],
  budget: fields.budget,
  projectBrief: fields.details.trim(),
  idempotencyKey,
});

export const newIdempotencyKey = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
