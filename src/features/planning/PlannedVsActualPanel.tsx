import {
  Alert,
  Button,
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
import { useTranslation } from 'react-i18next';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import { RevisionConcurrencyPanel } from '@/features/planning/RevisionConcurrencyPanel';
import {
  fetchOperationalPlan,
  fetchPlanRevision,
  fetchPlanTargets,
  fetchPlanTarget,
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
  return `${resource} is unavailable.`;
}

const policy = { retry: false, refetchOnMount: 'always', gcTime: 0 } as const;
function fresh<T>(query: { isSuccess: boolean; isFetching: boolean; isFetchedAfterMount: boolean; data?: T }): T | undefined {
  return query.isSuccess && query.isFetchedAfterMount && !query.isFetching ? query.data : undefined;
}
export function PlannedVsActualPanel({ revisionId, scope = '', revisionKey, onUnavailable }: { revisionId: string; scope?: string; revisionKey?: readonly unknown[]; onUnavailable?: () => void }) {
  return <CurrentComparison key={JSON.stringify([scope, revisionId])} revisionId={revisionId} scope={scope} revisionKey={revisionKey} onUnavailable={onUnavailable} />;
}
function CurrentComparison({ revisionId, scope, revisionKey, onUnavailable }: { revisionId: string; scope: string; revisionKey?: readonly unknown[]; onUnavailable?: () => void }) {
  const { routes, can } = usePermissions();
  const { t } = useTranslation();
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [epoch, setEpoch] = useState(0);
  const [targetEpoch, setTargetEpoch] = useState(0);
  const [unavailable, setUnavailable] = useState(false);

  const permissions = useMemo(() => ({
    revision: permissionForRoute(routes, '/api/v1/planning/revisions/{id}'),
    plan: permissionForRoute(routes, '/api/v1/planning/operational-plans/{id}'),
    target: permissionForRoute(routes, '/api/v1/planning/targets/{id}'),
    targets: permissionForRoute(routes, TARGETS_ROUTE),
    deviations: permissionForRoute(routes, DEVIATIONS_ROUTE),
  }), [routes]);

  const canReadTargets = permissions.targets ? can(permissions.targets) : false;
  const canReadDeviations = permissions.deviations ? can(permissions.deviations) : false;

  const readRevision = Boolean(permissions.revision && can(permissions.revision));
  const readPlan = Boolean(permissions.plan && can(permissions.plan));
  const readTarget = Boolean(permissions.target && can(permissions.target));
  const revisionQuery = useQuery({
    queryKey: [...planningQueryKeys.revision(revisionId), 'comparison', scope, epoch],
    queryFn: ({ signal }) => fetchPlanRevision(revisionId, signal),
    enabled: Boolean(revisionId && readRevision), ...policy,
  });
  const revision = readRevision && fresh(revisionQuery)?.id === revisionId ? fresh(revisionQuery) : undefined;
  const planQuery = useQuery({
    queryKey: [...planningQueryKeys.plan(revision?.planId ?? ''), 'comparison', scope, revisionId, epoch],
    queryFn: ({ signal }) => fetchOperationalPlan(revision?.planId ?? '', signal),
    enabled: Boolean(revision?.planId && readPlan), ...policy,
  });
  const plan = readPlan && revision && fresh(planQuery)?.id === revision.planId ? fresh(planQuery) : undefined;
  const approved = Boolean(plan && revision && plan.currentRevisionId === revisionId && plan.approvedRevisionId === revisionId && revision.status === 'APPROVED');
  const targetsQuery = useQuery({
    queryKey: [...planningQueryKeys.targets({ revisionId, page: 0, size: PAGE_SIZE }), 'comparison', scope, epoch],
    queryFn: ({ signal }) => fetchPlanTargets({ revisionId, page: 0, size: PAGE_SIZE }, signal),
    enabled: approved && canReadTargets && readTarget, ...policy,
  });
  const targetPage = approved && !unavailable && canReadTargets ? fresh(targetsQuery) : undefined;
  const validTargets = targetPage?.content?.every(row => row.id && row.revisionId === revisionId && row.status === 'ACTIVE') && new Set(targetPage?.content?.map(row => row.id)).size === targetPage?.content?.length;
  const targets = validTargets ? targetPage?.content ?? [] : [];
  const listed = targets.find(row => row.id === selectedTargetId);
  const targetQuery = useQuery({
    queryKey: [...planningQueryKeys.target(selectedTargetId), 'comparison', scope, revisionId, epoch, targetEpoch],
    queryFn: ({ signal }) => fetchPlanTarget(selectedTargetId, signal),
    enabled: Boolean(approved && readTarget && listed), ...policy,
  });
  const rawTarget = fresh(targetQuery);
  const target = readTarget && listed && rawTarget?.id === selectedTargetId && rawTarget.revisionId === revisionId && rawTarget.status === 'ACTIVE' && rawTarget.updatedAt === listed.updatedAt ? rawTarget : undefined;
  const deviationsQuery = useQuery({
    queryKey: [...telemetryMonitoringQueryKeys.deviations({ planTargetId: selectedTargetId, page: 0, size: PAGE_SIZE }), 'comparison', scope, revisionId, epoch, targetEpoch],
    queryFn: () => fetchDeviations({ planTargetId: selectedTargetId, page: 0, size: PAGE_SIZE }),
    enabled: Boolean(approved && target && canReadDeviations), ...policy,
  });
  const deviationPage = target && canReadDeviations ? fresh(deviationsQuery) : undefined;
  const validDeviations = deviationPage?.content?.every(row => row.planTargetId === selectedTargetId &&
    Boolean(row.trustedTelemetryReadingId && row.detectedAt && Number.isFinite(Date.parse(row.detectedAt)) && target?.unitId && row.unitId === target.unitId &&
      (!target.telemetryPointId || row.telemetryPointId === target.telemetryPointId) &&
      (!target.topologyAssetId || (row.topologyAssetId === target.topologyAssetId && row.topologyAssetType === target.topologyAssetType)) &&
      (!target.validFrom || Date.parse(row.detectedAt) >= Date.parse(target.validFrom)) &&
      (!target.validTo || Date.parse(row.detectedAt) <= Date.parse(target.validTo))));
  const deviations = validDeviations ? deviationPage?.content ?? [] : [];
  if (selectedTargetId && (!approved || (targetPage && !listed) || revisionQuery.isError || planQuery.isError || targetsQuery.isError ||
    (targetPage && !validTargets) || targetQuery.isError || (fresh(targetQuery) && !target) ||
    deviationsQuery.isError || (deviationPage && !validDeviations))) {
    setSelectedTargetId(''); setUnavailable(true);
  }

  return (
    <Stack spacing={2}>
      {revision && plan ? (
        <RevisionConcurrencyPanel key={JSON.stringify([revision.id, plan.currentRevisionId])} revision={revision} currentRevisionId={plan.currentRevisionId} revisionKeys={[[...planningQueryKeys.revision(revisionId), 'comparison', scope, epoch], ...(revisionKey ? [revisionKey] : [])]} onUnavailable={onUnavailable} />
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

          <Button onClick={() => { setSelectedTargetId(''); setUnavailable(false); setEpoch(e => e + 1); }}>{t('uxr29.refreshComparison')}</Button>
          {unavailable ? <Alert severity="warning">{t('uxr29.comparisonUnavailable')}</Alert> : null}
          {!permissions.targets || !permissions.deviations || !permissions.revision || !permissions.plan || !permissions.target ? (
            <Alert severity="warning">Planning-target or monitoring-deviation route-permission metadata is unavailable. Comparison access is denied by default.</Alert>
          ) : !canReadTargets ? (
            <Alert severity="warning">Your current HidraAPI grants do not allow planning-target reads.</Alert>
          ) : !approved || !readTarget ? (
            <Alert severity="info">{t('uxr29.currentApprovedRequired')}</Alert>
          ) : unavailable ? null : targetsQuery.isPending || targetsQuery.isFetching ? (
            <CircularProgress size={24} />
          ) : targetsQuery.isError ? (
            <Alert severity="error">{errorMessage(targetsQuery.error, 'plan targets')}</Alert>
          ) : (
            <>
              <TextField
                fullWidth
                label="Plan target"
                onChange={(event) => { setUnavailable(false); setTargetEpoch(e => e + 1); setSelectedTargetId(event.target.value); }}
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
                ) : targetQuery.isPending || targetQuery.isFetching || deviationsQuery.isPending || deviationsQuery.isFetching ? (
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
