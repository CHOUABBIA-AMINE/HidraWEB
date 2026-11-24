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
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type { RequestAuditExportRequest } from '@/api/generated/audit/model';
import { useAuth } from '@/app/auth/useAuth';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchRecord,
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  searchWorkbenchRecords,
  workbenchQueryKeys,
  type WorkbenchRecord,
} from '@/features/workbench/api/workbenchApi';

import { requestAuditExport } from './api/auditApi';
import { PressureDecisionEvidencePanel } from './components/PressureDecisionEvidencePanel';
import { ScopedAuditEvidencePanel } from './components/ScopedAuditEvidencePanel';
import { admittedRoute, evidenceError, pressureEvidenceRoute, scopedAuditAdmission } from './model/auditEvidence';

const MODULE = 'audit';
const PAGE_SIZE = 50;
const WORKBENCH_LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';
const WORKBENCH_DETAIL_ROUTE = '/api/v1/workbench/{module}/{resource}/{id}';
const EXPORT_ROUTE = '/api/v1/audit/exports';
const DISCOVERY_ROUTE = '/api/v1/workbench/{module}/resources';
const SEARCH_ROUTE = '/api/v1/workbench/{module}/{resource}/search';

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
  return error ? evidenceError(error) : fallback;
}

export function AuditWorkspacePage() {
  const permissions = usePermissions();
  const auth = useAuth();
  const context = useShellUiStore(s => s.operationalContext);
  const pressure = admittedRoute(permissions, pressureEvidenceRoute, 'GET');
  const scoped = scopedAuditAdmission(permissions);
  const key = JSON.stringify([auth.session?.principal?.userId, auth.session?.sessionId, context?.companyPartyId,
    context?.scopeId, [...permissions.permissions].sort(), permissions.status, pressure, scoped,
    permissions.routes.filter(r => r.route.startsWith('/api/v1/workbench') || r.route === EXPORT_ROUTE)
      .map(r => [r.route, r.permission, r.methods])]);
  return <Container maxWidth="xl" sx={{ py: 3 }}>
    <Stack key={key} spacing={3}>
      <LegacyAuditWorkspace contextKey={key} actorId={auth.session?.principal?.userId} displayName={auth.session?.principal?.displayName} />
      {pressure ? <PressureDecisionEvidencePanel /> : null}
      {scoped.read ? <ScopedAuditEvidencePanel admission={scoped} /> : null}
    </Stack>
  </Container>;
}

function LegacyAuditWorkspace({ contextKey, actorId, displayName }: { contextKey: string; actorId?: string; displayName?: string }) {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [queryInput, setQueryInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [page, setPage] = useState(0);
  const [traceInput, setTraceInput] = useState('');
  const [submittedTrace, setSubmittedTrace] = useState('');
  const [exportForm, setExportForm] = useState<RequestAuditExportRequest>({
    purposeId: '',
    filterJson: '',
    format: '',
    workflowInstanceId: '',
  });

  const listPermission = permissionForRoute(permissions.routes, WORKBENCH_LIST_ROUTE, 'GET');
  const detailPermission = permissionForRoute(permissions.routes, WORKBENCH_DETAIL_ROUTE, 'GET');
  const exportPermission = permissionForRoute(permissions.routes, EXPORT_ROUTE, 'POST');
  const discoveryPermission = permissionForRoute(permissions.routes, DISCOVERY_ROUTE, 'GET');
  const searchPermission = permissionForRoute(permissions.routes, SEARCH_ROUTE, 'POST');
  const canSearch = Boolean(searchPermission && permissions.can(searchPermission));
  const canRead = Boolean(
    permissions.status === 'ready' && discoveryPermission && permissions.can(discoveryPermission) && listPermission
      && detailPermission
      && permissions.can(listPermission)
      && permissions.can(detailPermission),
  );
  const canRequestExport = Boolean(permissions.status === 'ready' && actorId && exportPermission && permissions.can(exportPermission));

  const resourcesQuery = useQuery({
    queryKey: [...workbenchQueryKeys.resources(MODULE), contextKey],
    queryFn: () => fetchWorkbenchResources(MODULE),
    enabled: canRead, retry: false, staleTime: 0, gcTime: 0,
  });

  const eventResource = useMemo(
    () => resourcesQuery.isSuccess && !resourcesQuery.isFetching
      ? resourcesQuery.data.find((item) => item.javaType.endsWith('AuditEventJpaEntity')) : undefined,
    [resourcesQuery.data, resourcesQuery.isSuccess, resourcesQuery.isFetching],
  );

  const eventsQuery = useQuery({
    queryKey: [...(submittedTrace
      ? workbenchQueryKeys.search(MODULE, eventResource?.resource ?? '', { filters: { correlationId: submittedTrace }, page, size: PAGE_SIZE })
      : workbenchQueryKeys.list(MODULE, eventResource?.resource ?? '', page, PAGE_SIZE, submittedQuery)), contextKey],
    queryFn: async () => {
      const result = submittedTrace
        ? await searchWorkbenchRecords(MODULE, eventResource!.resource, { filters: { correlationId: submittedTrace }, page, size: PAGE_SIZE })
        : await fetchWorkbenchRecords({ module: MODULE, resource: eventResource!.resource, page, size: PAGE_SIZE, query: submittedQuery });
      if (result.page !== page || result.items.length > PAGE_SIZE ||
          (submittedTrace && result.items.some(item => item.attributes.correlationId !== submittedTrace))) {
        throw new Error('Mismatched Audit page or trace.');
      }
      return result;
    },
    enabled: canRead && Boolean(eventResource) && (!submittedTrace || (canSearch && !!eventResource?.searchableFields.includes('correlationId'))),
    retry: false, staleTime: 0, gcTime: 0,
  });

  const detailQuery = useQuery({
    queryKey: [...workbenchQueryKeys.detail(MODULE, eventResource?.resource ?? '', selectedId), contextKey],
    queryFn: async () => {
      const record = await fetchWorkbenchRecord(MODULE, eventResource!.resource, selectedId);
      if (recordId(record) !== selectedId) throw new Error('Mismatched audit event identity.');
      return record;
    },
    enabled: canRead && Boolean(eventResource && selectedId) && eventsQuery.isSuccess && !eventsQuery.isFetching,
    retry: false, staleTime: 0, gcTime: 0,
  });

  const exportMutation = useMutation({
    mutationFn: (request: RequestAuditExportRequest) => {
      if (!actorId || !exportPermission) throw new Error('Current export requester unavailable.');
      return requestAuditExport(request, actorId, exportPermission);
    },
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.resources(MODULE) });
    },
  });

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSelectedId(''); setPage(0); setSubmittedTrace(''); setTraceInput('');
    setSubmittedQuery(queryInput.trim());
  }

  function submitTrace(event: FormEvent) {
    event.preventDefault();
    if (!canSearch || !eventResource?.searchableFields.includes('correlationId') || !traceInput.trim()) return;
    setSelectedId(''); setPage(0); setQueryInput(''); setSubmittedQuery(''); setSubmittedTrace(traceInput.trim());
  }

  function submitExport(event: FormEvent) {
    event.preventDefault();
    if (!canRequestExport || exportMutation.isPending) return;
    exportMutation.mutate(exportForm);
  }

  if (permissions.status !== 'ready') {
    return <Container maxWidth="xl"><Alert severity="info">Loading audit permissions…</Alert></Container>;
  }

  return (
    <Stack spacing={3}>
      {!canRead ? <Alert severity="warning">{!discoveryPermission || !listPermission || !detailPermission
        ? "Audit workbench route-permission metadata is unavailable. Audit evidence reads are denied by default."
        : "Your current HidraAPI grants do not allow audit evidence reads."}</Alert> : <>
        <Box>
          <Typography component="h1" variant="h4">Audit evidence</Typography>
          <Typography color="text.secondary">
            Runtime-approved generic audit events and exact trace inspection. This register is not a company-scoped owner evidence query.
          </Typography>
        </Box>

        <Alert severity="info">
          Only the runtime-approved Workbench resource and published fields are shown here. Generic event reads are not a substitute for separately authorized Topology or scoped Risk evidence.
        </Alert>

        {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
        {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'Audit resources could not be loaded.')}</Alert> : null}

        {!eventResource && resourcesQuery.isSuccess && !resourcesQuery.isFetching ? (
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
                <Button type="button" onClick={() => { setQueryInput(''); setSubmittedQuery(''); setTraceInput(''); setSubmittedTrace(''); setSelectedId(''); setPage(0); }}>Clear</Button>
              </Stack>
            </Box>

            {canSearch && eventResource.searchableFields.includes('correlationId') ? (
              <Box component="form" onSubmit={submitTrace}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField fullWidth label="Exact correlation ID" value={traceInput} onChange={e => setTraceInput(e.target.value)} />
                  <Button type="submit" disabled={!traceInput.trim()}>Find exact trace</Button>
                </Stack>
              </Box>
            ) : null}
            {eventsQuery.isFetching ? <CircularProgress size={24} /> : null}
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
                  {(eventsQuery.isSuccess && !eventsQuery.isFetching ? eventsQuery.data.items : []).map((item, index) => {
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

            {eventsQuery.isSuccess && !eventsQuery.isFetching ? <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button disabled={page === 0} onClick={() => { setSelectedId(''); setPage(p => p - 1); }}>Previous audit page</Button>
              <Typography variant="body2">Page {page + 1} · {eventsQuery.data.items.length} loaded</Typography>
              <Button disabled={page + 1 >= eventsQuery.data.totalPages} onClick={() => { setSelectedId(''); setPage(p => p + 1); }}>Next audit page</Button>
            </Stack> : null}
            {selectedId && eventsQuery.isSuccess && !eventsQuery.isFetching ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography component="h2" variant="h6">Audit event detail</Typography>
                  {detailQuery.isPending ? <CircularProgress size={20} /> : null}
                  {detailQuery.isError ? <Alert severity="error">{errorMessage(detailQuery.error, 'Audit detail could not be loaded.')}</Alert> : null}
                  {detailQuery.isSuccess && !detailQuery.isFetching ? (
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

        </>}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack component="form" spacing={2} onSubmit={submitExport}>
            <Box>
              <Typography component="h2" variant="h6">Request audit export</Typography>
              <Typography color="text.secondary" variant="body2">
                This legacy request binds requester metadata to the current principal and submits the published contract. Its status does not establish approval, generation or download.
              </Typography>
            </Box>

            {!exportPermission ? <Alert severity="warning">Audit export route-permission metadata is unavailable. Export is denied by default.</Alert> : null}
            {exportPermission && !canRequestExport ? <Alert severity="warning">Your current HidraAPI grants do not allow audit export requests.</Alert> : null}

            <TextField label="Requested by actor ID" value={actorId ?? ''} disabled />
            <TextField label="Requested by display name snapshot" value={displayName ?? ''} disabled />
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
                Export request {text(exportMutation.data.id)} recorded with status {text(exportMutation.data.status)}. No downloadable artifact is implied by this legacy request.
              </Alert>
            ) : null}
          </Stack>
        </Paper>
    </Stack>
  );
}
