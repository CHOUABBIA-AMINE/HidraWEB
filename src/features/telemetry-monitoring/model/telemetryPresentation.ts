import type { ReadingView } from '@/api/generated/telemetry-monitoring/model';

export function readingValue(reading?: ReadingView | null): string {
  if (!reading) return '—';
  if (reading.numericValue !== undefined && reading.numericValue !== null) return String(reading.numericValue);
  if (reading.textValue !== undefined && reading.textValue !== null && reading.textValue !== '') return reading.textValue;
  if (reading.booleanValue !== undefined && reading.booleanValue !== null) return String(reading.booleanValue);
  return '—';
}

export function readingTimestamp(reading?: ReadingView | null): string {
  return reading?.sourceTimestamp ?? reading?.receivedAt ?? '—';
}

export function numericTrendPath(readings: readonly ReadingView[], width = 480, height = 120): string | null {
  const values = readings
    .map((reading, index) => ({ index, value: reading.numericValue }))
    .filter((item): item is { index: number; value: number } => typeof item.value === 'number' && Number.isFinite(item.value));

  if (values.length < 2) return null;

  const min = Math.min(...values.map((item) => item.value));
  const max = Math.max(...values.map((item) => item.value));
  const range = max - min || 1;
  const lastIndex = Math.max(readings.length - 1, 1);

  return values.map((item, position) => {
    const x = (item.index / lastIndex) * width;
    const y = height - ((item.value - min) / range) * height;
    return `${position === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}
