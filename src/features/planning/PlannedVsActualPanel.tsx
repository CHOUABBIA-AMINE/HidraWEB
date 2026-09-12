import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import { RevisionConcurrencyPanel } from '@/features/planning/RevisionConcurrencyPanel';
import {
  fetchOperationalPlan,
  fetchPlanRevision,
  fetchPlanTargets,
  planningQueryKeys,
} from '@/features/planning/api/planningApi';
import { fetchDeviations, telemetryMonitoringQueryKeys } from '@/features/telemetry-monitoring/api/telemetryMonitoringApi';

const PAGE_SIZE = 50;
const TARGETS_ROUTE = '/api/v1/planning/targets';
const DEVIATIONS_ROUTE = '/api/v1/monitoring/deviations';

function permissionForRoute(
  routes: ReturnType<typeof usePermissions>['routes'],
  route: string,
): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes('GET'))?.permission;
}

function valueOrDash(value?: string | number | null): string {
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function errorMessage(error: unknown, resource: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return `HidraAPI refused access to ${resource}.`;
  return normalized.message || `${resource} could not be loaded.`;
}

export function PlannedVsActualPanel({ revisionId }: { revisionId: string }) {
  const { routes, can } = usePermissions();
  const [selectedTargetId, setSelectedTargetId] = useState('');

  const permissions = useMemo(() => ({
    targets: permissionForRoute(routes, TARGETS_ROUTE),
    deviations: permissionForRoute(routes, DEVIATIONS_ROUTE),
  }), [routes]);

  const canReadTargets = permissions.targets ? can(permissions.targets) : false;
  const canReadDeviations = permissions.deviations ? can(permissions.deviations) : false;

  const revisionQuery = useQuery({
    queryKey: planningQueryKeys.revision(revisionId),
    queryFn: () => fetchPlanRevision(revisionId),
    enabled: Boolean(revisionId),
  });

  const planQuery = useQuery({
    queryKey: planningQueryKeys.plan(revisionQuery.data?.planId ?? ''),
    queryFn: () => fetchOperationalPlan(revisionQuery.data?.planId ?? ''),
    enabled: Boolean(revisionQuery.data?.planId),
  });

  const targetsQuery = useQuery({
    queryKey: planningQueryKeys.targets({ revisionId, page: 0, size: PAGE_SIZE }),
    queryFn: () => fetchPlanTargets({ revisionId, page: 0, size: PAGE_SIZE }),
    enabled: Boolean(revisionId) && canReadTargets,
  });

  const deviationsQuery = useQuery({
    queryKey: telemetryMonitoringQueryKeys.deviations({ planTargetId: selectedTargetId, page: 0, size: PAGE_SIZE }),
    queryFn: () => fetchDeviations({ planTargetId: selectedTargetId, page: 0, size: PAGE_SIZE }),
    enabled: Boolean(selectedTargetId) && canReadDeviations,
  });

  const targets = targetsQuery.data?.content ?? [];
  const deviations = deviationsQuery.data?.content ?? [];

  return (
    <Stack spacing={2}>
      {revisionQuery.data ? (
        <RevisionConcurrencyPanel revision={revisionQuery.data} currentRevisionId={planQuery.data?.currentRevisionId} />
      ) : null}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography color="text.secondary" variant="overline">Backend-authoritative comparison</Typography>
            <Typography component="h3" variant="h6">Planned vs actual</Typography>
            <Typography color="text.secondary" variant="body2">
              Planning supplies target identity; monitoring supplies the authoritative expected, actual, difference, percentage, severity and status values.
            </Typography>
          </Box>

          {!permissions.targets || !permissions.deviations ? (
            <Alert severity="warning">Planning-target or monitoring-deviation route-permission metadata is unavailable. Comparison access is denied by default.</Alert>
          ) : !canReadTargets ? (
            <Alert severity="warning">Your current HidraAPI grants do not allow planning-target reads.</Alert>
          ) : targetsQuery.isPending ? (
            <CircularProgress size={24} />
          ) : targetsQuery.isError ? (
            <Alert severity="error">{errorMessage(targetsQuery.error, 'plan targets')}</Alert>
          ) : (
            <>
              <TextField
                fullWidth
                label="Plan target"
                onChange={(event) => setSelectedTargetId(event.target.value)}
                select
                size="small"
                value={selectedTargetId}
              >
                <MenuItem value="">Select a target</MenuItem>
                {targets.map((target) => (
                  <MenuItem key={target.id ?? `${target.telemetryPointId}-${target.targetTypeId}`} value={target.id ?? ''} disabled={!target.id}>
                    {target.id ?? 'Target'} · {target.telemetryPointCodeSnapshot ?? target.telemetryPointId ?? target.topologyAssetCode ?? target.topologyAssetId ?? 'unscoped'} · {valueOrDash(target.targetValue ?? target.targetTextValue)} {target.unitId ?? ''}
                  </MenuItem>
                ))}
              </TextField>

              {targets.length === 0 ? <Alert severity="info">HidraAPI returned no plan targets for this revision.</Alert> : null}

              {selectedTargetId ? (
                !canReadDeviations ? (
                  <Alert severity="warning">Your current HidraAPI grants do not allow monitoring-deviation reads.</Alert>
                ) : deviationsQuery.isPending ? (
                  <CircularProgress size={24} />
                ) : deviationsQuery.isError ? (
                  <Alert severity="error">{errorMessage(deviationsQuery.error, 'target-scoped monitoring deviations')}</Alert>
                ) : deviations.length === 0 ? (
                  <Alert severity="info">Monitoring returned no authoritative comparison rows for the selected plan target.</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small" aria-label="Planned versus actual deviations">
                      <TableHead>
                        <TableRow>
                          <TableCell>Detected</TableCell>
                          <TableCell>Expected</TableCell>
                          <TableCell>Actual</TableCell>
                          <TableCell>Difference</TableCell>
                          <TableCell>Difference %</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell>Severity</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Reading</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {deviations.map((deviation) => (
                          <TableRow key={deviation.id ?? `${deviation.planTargetId}-${deviation.detectedAt}`}>
                            <TableCell>{valueOrDash(deviation.detectedAt)}</TableCell>
                            <TableCell>{valueOrDash(deviation.expectedValue)}</TableCell>
                            <TableCell>{valueOrDash(deviation.actualValue)}</TableCell>
                            <TableCell>{valueOrDash(deviation.differenceValue)}</TableCell>
                            <TableCell>{valueOrDash(deviation.differencePercent)}</TableCell>
                            <TableCell>{valueOrDash(deviation.unitId)}</TableCell>
                            <TableCell><Chip label={deviation.severity ?? '—'} size="small" variant="outlined" /></TableCell>
                            <TableCell><Chip label={deviation.status ?? '—'} size="small" variant="outlined" /></TableCell>
                            <TableCell>{valueOrDash(deviation.trustedTelemetryReadingId)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              ) : (
                <Typography color="text.secondary" variant="body2">Select a plan target to load monitoring-owned comparison rows.</Typography>
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
