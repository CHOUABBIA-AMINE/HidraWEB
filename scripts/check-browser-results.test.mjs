import assert from 'node:assert/strict';
import test from 'node:test';
import { assertBrowserReport } from './check-browser-results.mjs';

const accepted = { stats: { expected: 109, unexpected: 0, flaky: 0, skipped: 15 } };

test('accepts complete baseline mocked Chromium results with only native-only skips', () => {
  assert.deepEqual(assertBrowserReport(accepted), accepted.stats);
  assert.equal(assertBrowserReport({ stats: { ...accepted.stats, expected: 124 } }).expected, 124);
});

test('refuses a retry-pass classified as flaky even when all final tests pass', () => {
  assert.throws(() => assertBrowserReport({ stats: { ...accepted.stats, flaky: 1 } }), /flaky retry-pass/);
});

test('refuses unexpected results and any additional or missing native skip', () => {
  assert.throws(() => assertBrowserReport({ stats: { ...accepted.stats, unexpected: 1 } }), /unexpected/);
  assert.throws(() => assertBrowserReport({ stats: { ...accepted.stats, skipped: 16 } }), /skipped/);
  assert.throws(() => assertBrowserReport({ stats: { ...accepted.stats, skipped: 14 } }), /skipped/);
});

test('refuses a silently reduced suite and malformed reports', () => {
  assert.throws(() => assertBrowserReport({ stats: { ...accepted.stats, expected: 108 } }), /minimum baseline 109/);
  assert.throws(() => assertBrowserReport({ stats: { expected: 109, unexpected: 0, flaky: 0 } }), /valid final statistics/);
  assert.throws(() => assertBrowserReport(null), /valid final statistics/);
});
