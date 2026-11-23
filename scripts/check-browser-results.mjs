import console from 'node:console';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// This is the mocked full-suite gate, not the independent native qualification.
// The 15 skips belong only to the separately executed native A1/F18 specs.
// Reject an extra skip, a missing baseline test, an unexpected result or any
// retry-pass classified as flaky by Playwright.
export function assertBrowserReport(report) {
  const stats = report?.stats;
  if (!stats || !['expected', 'unexpected', 'flaky', 'skipped']
    .every((field) => Number.isSafeInteger(stats[field]) && stats[field] >= 0)) {
    throw new Error('Playwright JSON report is missing valid final statistics.');
  }

  const failures = [];
  if (stats.unexpected !== 0) failures.push(`${stats.unexpected} unexpected test(s)`);
  if (stats.flaky !== 0) failures.push(`${stats.flaky} flaky retry-pass(es)`);
  if (stats.skipped !== 15) failures.push(`${stats.skipped} skipped (expected exactly 15 native-only tests)`);
  if (stats.expected < 109) failures.push(`${stats.expected} passing (minimum baseline 109)`);
  if (failures.length) throw new Error(`Mocked Chromium qualification FAILED: ${failures.join('; ')}.`);
  return stats;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw new Error('Usage: node scripts/check-browser-results.mjs <playwright-json-report>');
    const report = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    const stats = assertBrowserReport(report);
    console.log(`Mocked Chromium qualification PASSED: ${stats.expected} passed; ${stats.skipped} native-only skips; 0 flaky/unexpected.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
