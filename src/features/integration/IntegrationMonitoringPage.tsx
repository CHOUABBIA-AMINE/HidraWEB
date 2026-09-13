import { Alert, Box, CircularProgress, Container, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import { fetchWorkbenchRecords, fetchWorkbenchResources, workbenchQueryKeys, type WorkbenchRecord } from '@/features/workbench/api/workbenchApi';

const MODULE = 'integration';
const PAGE_SIZE = 50;
const LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';

function permissionForRoute(routes: ReturnType<typeof usePermissions>['routes']) {
  return routes.find((item) => item.route === LIST_ROUTE && item.methods.includes('GET'))?.permission;
}

function errorMessage(error: unknown) {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403 ? 'HidraAPI refused this integration evidence read.' : normalized.message || 'Integration evidence could not be loaded.';
}

function EvidenceTable({ title, items }: { title: string; items: WorkbenchRecord[] }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography component="h2" variant="h6">{title}</Typography>
      {items.length === 0 ? <Typography color="text.secondary">No evidence returned.</Typography> : (
        <TableContainer>
          <Table size="small">
            <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Evidence</TableCell></TableRow></TableHead>
            <TableBody>{items.map((item, index) => (
              <TableRow key={String(item.id ?? index)}>
                <TableCell>{String(item.id ?? '—')}</TableCell>
                <TableCell><Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(item.attributes, null, 2)}</Box></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export function IntegrationMonitoringPage() {
  const permissions = usePermissions();
  const readPermission = permissionForRoute(permissions.routes);
  const canRead = Boolean(readPermission && permissions.can(readPermission));

  const resourcesQuery = useQuery({ queryKey: workbenchQueryKeys.resources(MODULE), queryFn: () => fetchWorkbenchResources(MODULE), enabled: canRead });
  const resources = useMemo(() => resourcesQuery.data ?? [], [resourcesQuery.data]);
  const connectorResource = useMemo(() => resources.find((r) => r.javaType.endsWith('ConnectorInstanceJpaEntity')), [resources]);
  const jobRunResource = useMemo(() => resources.find((r) => r.javaType.endsWith('IntegrationJobRunJpaEntity')), [resources]);
  const deadLetterResource = useMemo(() => resources.find((r) => r.javaType.endsWith('IntegrationDeadLetterRecordJpaEntity')), [resources]);
  const retryAttemptResource = useMemo(() => resources.find((r) => r.javaType.endsWith('IntegrationRetryAttemptJpaEntity')), [resources]);
  const healthResource = useMemo(() => resources.find((r) => r.javaType.endsWith('IntegrationHealthSnapshotJpaEntity')), [resources]);

  const connectorQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, connectorResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: connectorResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(connectorResource) });
  const jobRunQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, jobRunResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: jobRunResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(jobRunResource) });
  const deadLetterQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, deadLetterResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: deadLetterResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(deadLetterResource) });
  const retryAttemptQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, retryAttemptResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: retryAttemptResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(retryAttemptResource) });
  const healthQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, healthResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: healthResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(healthResource) });

  if (permissions.status !== 'ready') return <Container maxWidth="xl"><Alert severity="info">Loading integration permissions…</Alert></Container>;
  if (!readPermission) return <Container maxWidth="xl"><Alert severity="warning">Integration workbench route-permission metadata is unavailable. Monitoring is denied by default.</Alert></Container>;
  if (!canRead) return <Container maxWidth="xl"><Alert severity="warning">Your current HidraAPI grants do not allow integration evidence reads.</Alert></Container>;

  const missing = [connectorResource, jobRunResource, deadLetterResource, retryAttemptResource, healthResource].filter((descriptor) => !descriptor).length;
  const firstError = [connectorQuery, jobRunQuery, deadLetterQuery, retryAttemptQuery, healthQuery].find((query) => query.isError)?.error;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}><Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">Integration monitoring</Typography>
        <Typography color="text.secondary">HWEB-014-04 connector, job-run, dead-letter, retry-attempt, and health evidence from runtime workbench resources.</Typography>
      </Box>
      <Alert severity="info">Monitoring is evidence-only. HidraAPI publishes no retry, replay, cancel, restart, pause, or dead-letter lifecycle mutation endpoint, so no such action is exposed here.</Alert>
      {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
      {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error)}</Alert> : null}
      {firstError ? <Alert severity="error">{errorMessage(firstError)}</Alert> : null}
      {missing ? <Alert severity="warning">One or more integration monitoring resources are not published by runtime workbench discovery.</Alert> : null}
      {connectorResource ? <EvidenceTable title={`Connectors — ${connectorResource.resource}`} items={connectorQuery.data?.items ?? []} /> : null}
      {jobRunResource ? <EvidenceTable title={`Job runs — ${jobRunResource.resource}`} items={jobRunQuery.data?.items ?? []} /> : null}
      {deadLetterResource ? <EvidenceTable title={`Dead letters — ${deadLetterResource.resource}`} items={deadLetterQuery.data?.items ?? []} /> : null}
      {retryAttemptResource ? <EvidenceTable title={`Retry attempts — ${retryAttemptResource.resource}`} items={retryAttemptQuery.data?.items ?? []} /> : null}
      {healthResource ? <EvidenceTable title={`Health snapshots — ${healthResource.resource}`} items={healthQuery.data?.items ?? []} /> : null}
    </Stack></Container>
  );
}
