import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useMemo, useState } from 'react';

import type { RequestAuditExportRequest } from '@/api/generated/audit/model';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchRecord,
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  workbenchQueryKeys,
  type WorkbenchRecord,
} from '@/features/workbench/api/workbenchApi';

import { requestAuditExport } from './api/auditApi';

const MODULE = 'audit';
const PAGE_SIZE = 50;
const WORKBENCH_LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';
const WORKBENCH_DETAIL_ROUTE = '/api/v1/workbench/{module}/{resource}/{id}';
const EXPORT_ROUTE = '/api/v1/audit/exports';

function permissionForRoute(
  routes: ReturnType<typeof usePermissions>['routes'],
  route: string,
  method: 'GET' | 'POST',
): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes(method))?.permission;
}

function text(value: unknown): string {
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function recordId(record: WorkbenchRecord): string {
  return record.id === undefined || record.id === null ? '' : String(record.id);
}

function errorMessage(error: unknown, fallback: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return 'HidraAPI refused this audit operation.';
  return normalized.message || fallback;
}

export function AuditWorkspacePage() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [queryInput, setQueryInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [exportForm, setExportForm] = useState<RequestAuditExportRequest>({
    requestedByActorId: '',
    requestedByDisplayNameSnapshot: '',
    purposeId: '',
    filterJson: '',
    format: '',
    workflowInstanceId: '',
  });

  const listPermission = permissionForRoute(permissions.routes, WORKBENCH_LIST_ROUTE, 'GET');
  const detailPermission = permissionForRoute(permissions.routes, WORKBENCH_DETAIL_ROUTE, 'GET');
  const exportPermission = permissionForRoute(permissions.routes, EXPORT_ROUTE, 'POST');
  const canRead = Boolean(
    listPermission
      && detailPermission
      && permissions.can(listPermission)
      && permissions.can(detailPermission),
  );
  const canRequestExport = Boolean(exportPermission && permissions.can(exportPermission));

  const resourcesQuery = useQuery({
    queryKey: workbenchQueryKeys.resources(MODULE),
    queryFn: () => fetchWorkbenchResources(MODULE),
    enabled: canRead,
  });

  const eventResource = useMemo(
    () => resourcesQuery.data?.find((item) => item.javaType.endsWith('AuditEventJpaEntity')),
    [resourcesQuery.data],
  );

  const eventsQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, eventResource?.resource ?? '', 0, PAGE_SIZE, submittedQuery),
    queryFn: () => fetchWorkbenchRecords({
      module: MODULE,
      resource: eventResource?.resource ?? '',
      page: 0,
      size: PAGE_SIZE,
      query: submittedQuery,
    }),
    enabled: canRead && Boolean(eventResource),
  });

  const detailQuery = useQuery({
    queryKey: workbenchQueryKeys.detail(MODULE, eventResource?.resource ?? '', selectedId),
    queryFn: () => fetchWorkbenchRecord(MODULE, eventResource?.resource ?? '', selectedId),
    enabled: canRead && Boolean(eventResource && selectedId),
  });

  const exportMutation = useMutation({
    mutationFn: requestAuditExport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.resources(MODULE) });
    },
  });

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSelectedId('');
    setSubmittedQuery(queryInput.trim());
  }

  function submitExport(event: FormEvent) {
    event.preventDefault();
    if (!canRequestExport) return;
    exportMutation.mutate(exportForm);
  }

  if (permissions.status !== 'ready') {
    return <Container maxWidth="xl"><Alert severity="info">Loading audit permissions…</Alert></Container>;
  }

  if (!listPermission || !detailPermission) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning">Audit workbench route-permission metadata is unavailable. Audit evidence reads are denied by default.</Alert>
      </Container>
    );
  }

  if (!canRead) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning">Your current HidraAPI grants do not allow audit evidence reads.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4">Audit evidence</Typography>
          <Typography color="text.secondary">
            HWEB-014 audit search and export-request workspace backed only by runtime workbench reads and the published audit export request contract.
          </Typography>
        </Box>

        <Alert severity="info">
          HidraAPI publishes no dedicated audit search endpoint and no audit artifact download endpoint. Search therefore uses the generic workbench query over the runtime-discovered audit event resource. Export creates an audit-owned export request only; status is evidence and does not imply a downloadable file.
        </Alert>

        {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
        {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'Audit resources could not be loaded.')}</Alert> : null}

        {!eventResource && !resourcesQuery.isPending ? (
          <Alert severity="warning">HidraAPI did not publish an AuditEventJpaEntity workbench resource. No audit search UI is available.</Alert>
        ) : null}

        {eventResource ? (
          <Stack spacing={2}>
            <Typography color="text.secondary" variant="body2">
              Runtime resource: {eventResource.resource}. Searchable fields published by HidraAPI: {eventResource.searchableFields.length ? eventResource.searchableFields.join(', ') : 'none declared'}.
            </Typography>

            <Box component="form" onSubmit={submitSearch}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  fullWidth
                  label="Search audit evidence"
                  value={queryInput}
                  onChange={(event) => setQueryInput(event.target.value)}
                />
                <Button type="submit" variant="contained">Search</Button>
                <Button type="button" onClick={() => { setQueryInput(''); setSubmittedQuery(''); }}>Clear</Button>
              </Stack>
            </Box>

            {eventsQuery.isPending ? <CircularProgress size={24} /> : null}
            {eventsQuery.isError ? <Alert severity="error">{errorMessage(eventsQuery.error, 'Audit evidence could not be loaded.')}</Alert> : null}

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Occurred at</TableCell>
                    <TableCell>Actor</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Source module</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Operation</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Detail</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(eventsQuery.data?.items ?? []).map((item, index) => {
                    const id = recordId(item);
                    return (
                      <TableRow key={id || index}>
                        <TableCell>{text(item.attributes.occurredAt)}</TableCell>
                        <TableCell>{text(item.attributes.actorDisplayNameSnapshot ?? item.attributes.actorId)}</TableCell>
                        <TableCell>{text(item.attributes.actionCode)}</TableCell>
                        <TableCell>{text(item.attributes.sourceModule)}</TableCell>
                        <TableCell>{text(item.attributes.targetType)} / {text(item.attributes.targetId)}</TableCell>
                        <TableCell>{text(item.attributes.operation)}</TableCell>
                        <TableCell><Chip size="small" variant="outlined" label={text(item.attributes.eventStatus)} /></TableCell>
                        <TableCell align="right"><Button disabled={!id} size="small" onClick={() => setSelectedId(id)}>Open</Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedId ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography component="h2" variant="h6">Audit event detail</Typography>
                  {detailQuery.isPending ? <CircularProgress size={20} /> : null}
                  {detailQuery.isError ? <Alert severity="error">{errorMessage(detailQuery.error, 'Audit detail could not be loaded.')}</Alert> : null}
                  {detailQuery.data ? (
                    <Box component="pre" sx={{ m: 0, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(detailQuery.data.attributes, null, 2)}
                    </Box>
                  ) : null}
                  <Button size="small" onClick={() => setSelectedId('')}>Close detail</Button>
                </Stack>
              </Paper>
            ) : null}
          </Stack>
        ) : null}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack component="form" spacing={2} onSubmit={submitExport}>
            <Box>
              <Typography component="h2" variant="h6">Request audit export</Typography>
              <Typography color="text.secondary" variant="body2">
                This submits the exact RequestAuditExportRequest contract. HidraWEB does not infer approval, generation, or download behavior from the returned status.
              </Typography>
            </Box>

            {!exportPermission ? <Alert severity="warning">Audit export route-permission metadata is unavailable. Export is denied by default.</Alert> : null}
            {exportPermission && !canRequestExport ? <Alert severity="warning">Your current HidraAPI grants do not allow audit export requests.</Alert> : null}

            <TextField label="Requested by actor ID" value={exportForm.requestedByActorId ?? ''} onChange={(event) => setExportForm((value) => ({ ...value, requestedByActorId: event.target.value }))} />
            <TextField label="Requested by display name snapshot" value={exportForm.requestedByDisplayNameSnapshot ?? ''} onChange={(event) => setExportForm((value) => ({ ...value, requestedByDisplayNameSnapshot: event.target.value }))} />
            <TextField label="Purpose ID" value={exportForm.purposeId ?? ''} onChange={(event) => setExportForm((value) => ({ ...value, purposeId: event.target.value }))} />
            <TextField label="Format" value={exportForm.format ?? ''} onChange={(event) => setExportForm((value) => ({ ...value, format: event.target.value }))} />
            <TextField minRows={3} multiline label="Filter JSON" value={exportForm.filterJson ?? ''} onChange={(event) => setExportForm((value) => ({ ...value, filterJson: event.target.value }))} />
            <TextField label="Workflow instance ID" value={exportForm.workflowInstanceId ?? ''} onChange={(event) => setExportForm((value) => ({ ...value, workflowInstanceId: event.target.value }))} />
            <Button disabled={!canRequestExport || exportMutation.isPending} type="submit" variant="contained">
              {exportMutation.isPending ? 'Requesting…' : 'Request export'}
            </Button>

            {exportMutation.isError ? <Alert severity="error">{errorMessage(exportMutation.error, 'Audit export request failed.')}</Alert> : null}
            {exportMutation.data ? (
              <Alert severity="success">
                Export request {text(exportMutation.data.id)} recorded with status {text(exportMutation.data.status)}. No download endpoint is published by the accepted contract.
              </Alert>
            ) : null}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
