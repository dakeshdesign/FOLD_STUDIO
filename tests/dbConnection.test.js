import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { pgConnectionOptions } from '../server/inquiries/db.js';

const SUPABASE = 'postgresql://postgres.ref:pw@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';
const PEM = '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----';

describe('postgres connection options', () => {
  test('verifies remote certificates by default', () => {
    assert.deepEqual(pgConnectionOptions(SUPABASE, {}).ssl, { rejectUnauthorized: true });
  });

  test('uses DATABASE_CA_CERT and keeps verification on', () => {
    const { ssl } = pgConnectionOptions(SUPABASE, { DATABASE_CA_CERT: PEM });
    assert.equal(ssl.rejectUnauthorized, true);
    assert.equal(ssl.ca, PEM);
  });

  test('accepts a CA pasted with literal \\n sequences', () => {
    const { ssl } = pgConnectionOptions(SUPABASE, { DATABASE_CA_CERT: PEM.replace(/\n/g, '\\n') });
    assert.equal(ssl.ca, PEM);
  });

  test('removes sslmode from the URL so it cannot override the TLS options', () => {
    const { connectionString, ssl } = pgConnectionOptions(`${SUPABASE}?sslmode=require`, { DATABASE_CA_CERT: PEM });
    assert.ok(!connectionString.includes('sslmode'));
    assert.equal(ssl.ca, PEM);
  });

  test('no TLS for localhost or sslmode=disable', () => {
    assert.equal(pgConnectionOptions('postgres://u:p@localhost:5432/db', {}).ssl, false);
    assert.equal(pgConnectionOptions(`${SUPABASE}?sslmode=disable`, {}).ssl, false);
  });
});
