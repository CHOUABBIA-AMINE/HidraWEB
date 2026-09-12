import { Alert, Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { OperationalSearchRequest } from '@/api/generated/workbench/model';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import {
  searchWorkbenchRecords,
  workbenchQueryKeys,
  type WorkbenchRecord,
  type WorkbenchResourceDescriptor,
} from '@/features/workbench/api/workbenchApi';

const MODULE = 'assets';
const MAX_HISTORY_SIZE = 200;

export interface AssetLifecycleEventEvidence {
  id?: string;
  eventType?: string;
  oldStatus?: string;
  newStatus?: string;
  eventReasonId?: string;
  eventComment?: string;
  actorId?: string;
  eventAt?: string;
  correlationId?: string;
  createdAt?: string;
}

export interface AssetHistoryTimelineProps {
  maintainableAssetId: string;
  lifecycleResource?: WorkbenchResourceDescriptor;
  searchPermission?: string;
  allowed: boolean;
}

function text(attributes: Record<string, unknown>, field: string): string | undefined {
  const value = attributes[field];
  if (value === null || value === undefined) return undefined;
  const normalized = String(value).trim();
  return normalized || undefined;
}

export function toAssetLifecycleEventEvidence(record: WorkbenchRecord): AssetLifecycleEventEvidence {
  return {
    id: record.id === null || record.id === undefined ? text(record.attributes, 'id') : String(record.id),
    eventType: text(record.attributes, 'eventType'),
    oldStatus: text(record.attributes, 'oldStatus'),
    newStatus: text(record.attributes, 'newStatus'),
    eventReasonId: text(record.attributes, 'eventReasonId'),
    eventComment: text(record.attributes, 'eventComment'),
    actorId: text(record.attributes, 'actorId'),
    eventAt: text(record.attributes, 'eventAt'),
    correlationId: text(record.attributes, 'correlationId'),
    createdAt: text(record.attributes, 'createdAt'),
  };
}

function historyError(error: unknown): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return 'HidraAPI refused access to asset lifecycle history.';
  return normalized.message || 'Asset lifecycle history could not be loaded.';
}

function EvidenceField({ label, value }: { label: string; value?: string }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {label}: <Box component="span" color="text.primary">{value ?? '—'}</Box>
    </Typography>
  );
}

export function AssetHistoryTimeline({
  maintainableAssetId,
  lifecycleResource,
  searchPermission,
  allowed,
}: AssetHistoryTimelineProps) {
  const request = useMemo<OperationalSearchRequest>(() => ({
    filters: { maintainableAssetId },
    page: 0,
    size: MAX_HISTORY_SIZE,
    sortBy: 'eventAt',
    sortDirection: 'desc',
  }), [maintainableAssetId]);

  const historyQuery = useQuery({
    queryKey: lifecycleResource
      ? workbenchQueryKeys.search(MODULE, lifecycleResource.resource, request)
      : ['hidra', 'workbench', MODULE, 'asset-lifecycle-history', maintainableAssetId, 'resource-unavailable'],
    queryFn: () => searchWorkbenchRecords(MODULE, lifecycleResource!.resource, request),
    enabled: Boolean(maintainableAssetId && lifecycleResource && searchPermission && allowed),
  });

  const events = useMemo(
    () => (historyQuery.data?.items ?? []).map(toAssetLifecycleEventEvidence),
    [historyQuery.data],
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6">Asset lifecycle history</Typography>
          <Typography variant="body2" color="text.secondary">
            Backend lifecycle-event evidence for maintainable asset {maintainableAssetId}. No history is reconstructed from current status.
          </Typography>
        </Box>

        {!lifecycleResource && (
          <Alert severity="warning">HidraAPI workbench did not publish an AssetLifecycleEvent resource.</Alert>
        )}
        {lifecycleResource && !searchPermission && (
          <Alert severity="warning">HidraAPI did not publish a route permission for workbench search.</Alert>
        )}
        {lifecycleResource && searchPermission && !allowed && (
          <Alert severity="info">Your effective grants do not permit asset lifecycle history search.</Alert>
        )}
        {historyQuery.isLoading && <Alert severity="info">Loading backend lifecycle events…</Alert>}
        {historyQuery.isError && <Alert severity="error">{historyError(historyQuery.error)}</Alert>}
        {historyQuery.isSuccess && events.length === 0 && (
          <Alert severity="info">No backend lifecycle events were returned for this maintainable asset.</Alert>
        )}

        {events.length > 0 && (
          <Stack divider={<Divider flexItem />} spacing={2}>
            {events.map((event, index) => (
              <Box key={event.id ?? `${event.eventAt ?? 'event'}-${index}`}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ alignItems: { md: 'center' }, mb: 1 }}>
                  <Chip size="small" label={event.eventType ?? 'Event type unavailable'} />
                  <Typography variant="subtitle2">{event.eventAt ?? 'Event time unavailable'}</Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <EvidenceField label="Old status" value={event.oldStatus} />
                  <EvidenceField label="New status" value={event.newStatus} />
                  <EvidenceField label="Reason ID" value={event.eventReasonId} />
                  <EvidenceField label="Comment" value={event.eventComment} />
                  <EvidenceField label="Actor ID" value={event.actorId} />
                  <EvidenceField label="Correlation ID" value={event.correlationId} />
                  <EvidenceField label="Created at" value={event.createdAt} />
                  <EvidenceField label="Event ID" value={event.id} />
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
