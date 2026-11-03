import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SERVICES, BUDGETS, toggleService, validateInquiryFields, buildInquiryPayload, newIdempotencyKey } from '../src/utils/inquiryForm.ts';

const fields = (o = {}) => ({ name: 'Alex Morgan', email: 'alex@brand.com', services: ['Website Design'], budget: '₹25,000–₹50,000', details: '', ...o });

test('service labels and budget ranges are unchanged', () => {
  assert.deepEqual(SERVICES, ['Brand Identity', 'Website Design', 'Digital Experiences', 'Content Creation', 'Creative Direction', 'Full Retainer']);
  assert.deepEqual(BUDGETS, ['₹5,000–₹10,000', '₹10,000–₹25,000', '₹25,000–₹50,000', '₹50,000–₹1,00,000', '₹1,00,000+', 'Not Sure Yet']);
});

test('multi-select keeps earlier selections and supports deselection', () => {
  let s: string[] = [];
  s = toggleService(s, 'Brand Identity');
  s = toggleService(s, 'Website Design');
  s = toggleService(s, 'Content Creation');
  assert.deepEqual(s, ['Brand Identity', 'Website Design', 'Content Creation']);
  s = toggleService(s, 'Website Design');
  assert.deepEqual(s, ['Brand Identity', 'Content Creation']);
  s = toggleService(toggleService(s, 'Brand Identity'), 'Content Creation');
  assert.deepEqual(s, []);
});

test('valid single and multiple selections pass; every budget passes', () => {
  assert.deepEqual(validateInquiryFields(fields()), {});
  assert.deepEqual(validateInquiryFields(fields({ services: ['Digital Experiences', 'Creative Direction', 'Full Retainer'] })), {});
  for (const budget of BUDGETS) assert.deepEqual(validateInquiryFields(fields({ budget })), {});
});

test('required field errors', () => {
  const e = validateInquiryFields(fields({ name: ' ', email: '', services: [], budget: '' }));
  assert.ok(e.name && e.email && e.services && e.budget);
  assert.ok(validateInquiryFields(fields({ email: 'alex@brand' })).email);
  assert.ok(validateInquiryFields(fields({ email: 'alex brand@x.com' })).email);
  assert.ok(validateInquiryFields(fields({ name: 'x'.repeat(121) })).name);
  assert.ok(validateInquiryFields(fields({ details: 'x'.repeat(5001) })).details);
});

test('brief is optional; multiline brief is sent intact', () => {
  assert.deepEqual(validateInquiryFields(fields({ details: '' })), {});
  const p = buildInquiryPayload(fields({ name: '  Alex Morgan ', details: '  Goals:\n- launch\n\nTimeline: Q1  ', services: ['Brand Identity', 'Content Creation'] }), 'key-123456789');
  assert.deepEqual(p, {
    name: 'Alex Morgan',
    email: 'alex@brand.com',
    services: ['Brand Identity', 'Content Creation'],
    budget: '₹25,000–₹50,000',
    projectBrief: 'Goals:\n- launch\n\nTimeline: Q1',
    idempotencyKey: 'key-123456789',
  });
});

test('payload services is a copy, not the live state array', () => {
  const f = fields({ services: ['Brand Identity'] });
  const p = buildInquiryPayload(f, 'key-123456789');
  f.services.push('Website Design');
  assert.deepEqual(p.services, ['Brand Identity']);
});

test('idempotency keys are unique and server-acceptable', () => {
  const keys = new Set(Array.from({ length: 200 }, newIdempotencyKey));
  assert.equal(keys.size, 200);
  for (const k of keys) assert.match(k, /^[A-Za-z0-9_-]{8,100}$/);
});
