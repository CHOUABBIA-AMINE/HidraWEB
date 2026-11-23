import { describe, expect, it } from 'vitest';
import type { ReadingView } from '@/api/generated/telemetry-monitoring/model';
import { legacyReadingStatus, legacyReadingTimeline } from '@/features/telemetry-monitoring/model/telemetryEvidence';

describe('UXR-15 Telemetry legacy source provenance', () => {
  it('shows raw unit, source time, received time and quality without inventing revision or trust', () => {
    const reading: ReadingView = { id: 'r1', pointId: 'PT-1', numericValue: 42.5,
      unitId: 'bar', qualityCodeId: 'GOOD', state: 'TRUSTED',
      sourceTimestamp: '2026-11-20T10:00:00Z', receivedAt: '2026-11-20T10:00:03Z' };
    const result = legacyReadingStatus(reading);
    expect(result.value).toBe('42.5');
    expect(result.source).toContain('legacy');
    expect(result.observedAt).toBe(reading.sourceTimestamp);
    expect(result.receivedAt).toBe(reading.receivedAt);
    expect(result.quality).toBe('GOOD');
    expect(result.revision).toBeUndefined();
    expect(result.effectiveFrom).toBeUndefined();
  });

  it('never presents another point’s readings as the selected point’s history', () => {
    const readings: ReadingView[] = [
      { id: 'one', pointId: 'PT-1', numericValue: 1.5, unitId: 'bar' },
      { id: 'other', pointId: 'PT-2', numericValue: 999, unitId: 'bar' },
    ];
    const entries = legacyReadingTimeline(readings, 'PT-1');
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('one');
    expect(entries[0].unit).toBe('bar');
    expect(entries[0].quality).toBeUndefined();
  });
});
