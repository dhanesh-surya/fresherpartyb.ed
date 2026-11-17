import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adminDeleteJunior,
  adminUpsertJunior,
  applyThankYouHit,
  buildCalendarIcs,
  DEFAULT_EVENT_CONFIG,
  getEventCountdown,
  normalizeJuniorName,
  registerJuniorLogin,
  sanitizeEventConfig,
  summarizeThankYouLedger,
  verifySeniorCredentials,
} from './invitationLogic';
import type { ThankYouRecord } from '../types/invitation';

test('normalizeJuniorName trims spaces and enforces length bounds', () => {
  const empty = normalizeJuniorName('   ');
  assert.equal(empty.valid, false);
  assert.ok(empty.error);

  const tooShort = normalizeJuniorName('A');
  assert.equal(tooShort.valid, false);

  const valid = normalizeJuniorName('  Riya   Sharma  ');
  assert.equal(valid.valid, true);
  assert.equal(valid.name, 'Riya Sharma');
  assert.equal(valid.key, 'riya sharma');
  assert.equal(valid.error, null);
});

test('verifySeniorCredentials validates name and passcode', () => {
  assert.equal(verifySeniorCredentials('', 'BED2026').valid, false);
  assert.equal(verifySeniorCredentials('Senior Admin', 'WRONG').valid, false);
  const ok = verifySeniorCredentials('  Dhanesh Senior ', 'bed2026');
  assert.equal(ok.valid, true);
  assert.equal(ok.name, 'Dhanesh Senior');
});

test('registerJuniorLogin registers a new Junior as Pending and preserves existing hits', () => {
  const initial: ThankYouRecord[] = [];
  const first = registerJuniorLogin(initial, 'Riya Sharma', '2026-11-16T12:00:00.000Z');
  assert.equal(first.currentRecord.name, 'Riya Sharma');
  assert.equal(first.currentRecord.status, 'Pending');
  assert.equal(first.currentRecord.hits, 0);

  const thanked = applyThankYouHit(
    first.records,
    'riya sharma',
    '2026-11-16T12:01:00.000Z'
  );
  assert.equal(thanked.currentRecord.status, 'Thanked');
  assert.equal(thanked.currentRecord.hits, 1);

  const relogin = registerJuniorLogin(
    thanked.records,
    'Riya Sharma',
    '2026-11-16T12:05:00.000Z'
  );
  assert.equal(relogin.currentRecord.status, 'Thanked');
  assert.equal(relogin.currentRecord.hits, 1);
});

test('adminUpsertJunior and adminDeleteJunior handle Create, Update, and Delete cleanly', () => {
  const created = adminUpsertJunior(
    [],
    { name: 'Sonal Gupta', hits: 0, status: 'Pending' },
    '2026-11-17T06:00:00.000Z'
  );
  assert.equal(created.record.name, 'Sonal Gupta');
  assert.equal(created.record.status, 'Pending');

  const updated = adminUpsertJunior(
    created.records,
    { targetId: 'sonal gupta', name: 'Sonal Verma', hits: 3, status: 'Thanked' },
    '2026-11-17T06:05:00.000Z'
  );
  assert.equal(updated.record.name, 'Sonal Verma');
  assert.equal(updated.record.hits, 3);
  assert.equal(updated.record.status, 'Thanked');

  const afterDelete = adminDeleteJunior(updated.records, 'sonal verma');
  assert.equal(afterDelete.length, 0);
});

test('sanitizeEventConfig preserves edits and fills missing defaults', () => {
  const sanitized = sanitizeEventConfig({
    ...DEFAULT_EVENT_CONFIG,
    venueDisplay: 'Main Auditorium',
  });
  assert.equal(sanitized.venueDisplay, 'Main Auditorium');
  assert.equal(sanitized.program.length, DEFAULT_EVENT_CONFIG.program.length);
});

test('applyThankYouHit increments hit count by name and sorts Thanked entries first', () => {
  const seed: ThankYouRecord[] = [
    {
      id: 'aman verma',
      name: 'Aman Verma',
      hits: 0,
      status: 'Pending',
      firstLoggedInAt: '2026-11-16T10:00:00.000Z',
      lastHitAt: null,
    },
  ];

  const firstHit = applyThankYouHit(seed, 'Neha Patel', '2026-11-16T11:00:00.000Z');
  assert.equal(firstHit.currentRecord.hits, 1);
  assert.equal(firstHit.records[0].name, 'Neha Patel');

  const secondHit = applyThankYouHit(
    firstHit.records,
    'Neha Patel',
    '2026-11-16T11:02:00.000Z'
  );
  assert.equal(secondHit.currentRecord.hits, 2);

  const summary = summarizeThankYouLedger(secondHit.records, 'Neha Patel', 'all', '');
  assert.equal(summary.totalHits, 2);
  assert.equal(summary.thankedCount, 1);
  assert.equal(summary.pendingCount, 1);
  assert.equal(summary.currentRecord?.hits, 2);
});

test('getEventCountdown computes upcoming, live, and ended phases accurately', () => {
  const upcoming = getEventCountdown(new Date(2026, 10, 16, 22, 0, 0));
  assert.equal(upcoming.phase, 'upcoming');
  assert.equal(upcoming.days, 2);
  assert.equal(upcoming.hours, 12);
  assert.equal(upcoming.minutes, 0);

  const live = getEventCountdown(new Date(2026, 10, 19, 12, 30, 0));
  assert.equal(live.phase, 'live');

  const ended = getEventCountdown(new Date(2026, 10, 20, 9, 0, 0));
  assert.equal(ended.phase, 'ended');
});

test('buildCalendarIcs includes venue, date, and guest name', () => {
  const ics = buildCalendarIcs('Riya Sharma');
  assert.ok(ics.includes('Hall / Room No. 30'));
  assert.ok(ics.includes('20261119T100000'));
  assert.ok(ics.includes('Dear Riya Sharma'));
});
