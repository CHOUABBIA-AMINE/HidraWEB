import type { ReadingView } from '@/api/generated/telemetry-monitoring/model';
import { readingValue } from '@/features/telemetry-monitoring/model/telemetryPresentation';
import type { EvidenceEvent, StatusEvidence } from '@/shell/evidence/evidenceTypes';

/** Legacy point readings: neither the state string nor a quality code proves trusted freshness. */
export function legacyReadingStatus(reading: ReadingView): StatusEvidence {
  return {
    source: 'HidraAPI Telemetry / point readings (legacy)',
    value: readingValue(reading),
    status: reading.state,
    quality: reading.qualityCodeId,
    unit: reading.unitId,
    observedAt: reading.sourceTimestamp,
    receivedAt: reading.receivedAt,
    reference: reading.id,
  };
}

export function legacyReadingTimeline(readings: readonly ReadingView[], pointId: string): EvidenceEvent[] {
  // An owner response for a different point must not become this selection's history.
  return readings.filter(reading => reading.pointId === pointId).map(reading => ({
    source: 'HidraAPI Telemetry / point readings (legacy)',
    id: reading.id,
    title: readingValue(reading),
    occurredAt: reading.sourceTimestamp ?? reading.receivedAt,
    status: reading.state,
    quality: reading.qualityCodeId,
    unit: reading.unitId,
    note: reading.rejectionReason,
    correlationId: reading.correlationId,
  }));
}
