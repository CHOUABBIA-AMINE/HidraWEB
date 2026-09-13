import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { OpenCustodyMeasurementPeriodRequest } from '@/api/generated/custody/model';
import { openCustodyMeasurementPeriod } from '@/features/custody/api/custodyApi';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchRecord,
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  workbenchQueryKeys,
  type WorkbenchRecord,
} from '@/features/workbench/api/workbenchApi';

const MODULE = 'custody';
const PAGE_SIZE = 25;
const REFERENCE_PAGE_SIZE = 200;
const WORKBENCH_LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';
const WORKBENCH_DETAIL_ROUTE = '/api/v1/workbench/{module}/{resource}/{id}';
const CREATE_PERIOD_ROUTE = '/api/v1/custody/measurement-periods';

type RouteMethod = 'GET' | 'POST';

function permissionForRoute(
  routes: ReturnType<typeof usePermissions>['routes'],
  route: string,
  method: RouteMethod,
): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes(method))?.permission;
}

function optional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized || undefined;
}

function instant(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

function text(value: unknown): string {
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function attribute(record: WorkbenchRecord | undefined, name: string): string | undefined {
  const value = record?.attributes[name];
  return value === undefined || value === null || value === '' ? undefined : String(value);
}

function labelFor(record: WorkbenchRecord, preferredFields: string[]): string {
  for (const field of preferredFields) {
    const value = attribute(record, field);
    if (value) return value;
  }
  return text(record.id);
}

function errorMessage(error: unknown, resource: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return `HidraAPI refused access to ${resource}.`;
  return normalized.message || `${resource} could not be loaded.`;
}

export function CustodyMeasurementPeriodsPage() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [periodCode, setPeriodCode] = useState('');
  const [agreementId, setAgreementId] = useState('');
  const [transferPointId, setTransferPointId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const listPermission = permissionForRoute(permissions.routes, WORKBENCH_LIST_ROUTE, 'GET');
  const detailPermission = permissionForRoute(permissions.routes, WORKBENCH_DETAIL_ROUTE, 'GET');
  const createPermission = permissionForRoute(permissions.routes, CREATE_PERIOD_ROUTE, 'POST');
  const canRead = Boolean(listPermission && detailPermission && permissions.can(listPermission) && permissions.can(detailPermission));
  const canCreate = Boolean(createPermission && permissions.can(createPermission));

  const resourcesQuery = useQuery({
    queryKey: workbenchQueryKeys.resources(MODULE),
    queryFn: () => fetchWorkbenchResources(MODULE),
    enabled: canRead,
  });

  const measurementPeriodResource = useMemo(
    () => resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyMeasurementPeriodJpaEntity')),
    [resourcesQuery.data],
  );
  const agreementResource = useMemo(
    () => resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyAgreementJpaEntity')),
    [resourcesQuery.data],
  );
  const transferPointResource = useMemo(
    () => resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyTransferPointJpaEntity')),
    [resourcesQuery.data],
  );

  const periodsQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, measurementPeriodResource?.resource ?? '', page, PAGE_SIZE, query),
    queryFn: () => fetchWorkbenchRecords({
      module: MODULE,
      resource: measurementPeriodResource?.resource ?? '',
      page,
      size: PAGE_SIZE,
      query,
    }),
    enabled: canRead && Boolean(measurementPeriodResource),
  });

  const agreementsQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, agreementResource?.resource ?? '', 0, REFERENCE_PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({
      module: MODULE,
      resource: agreementResource?.resource ?? '',
      page: 0,
      size: REFERENCE_PAGE_SIZE,
    }),
    enabled: canRead && Boolean(agreementResource),
  });

  const transferPointsQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, transferPointResource?.resource ?? '', 0, REFERENCE_PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({
      module: MODULE,
      resource: transferPointResource?.resource ?? '',
      page: 0,
      size: REFERENCE_PAGE_SIZE,
    }),
    enabled: canRead && Boolean(transferPointResource),
  });

  const detailQuery = useQuery({
    queryKey: workbenchQueryKeys.detail(MODULE, measurementPeriodResource?.resource ?? '', selectedId),
    queryFn: () => fetchWorkbenchRecord(MODULE, measurementPeriodResource?.resource ?? '', selectedId),
    enabled: canRead && Boolean(measurementPeriodResource && selectedId),
  });

  const createMutation = useMutation({
    mutationFn: (request: OpenCustodyMeasurementPeriodRequest) => openCustodyMeasurementPeriod(request),
    onSuccess: async () => {
      setPeriodCode('');
      setAgreementId('');
      setTransferPointId('');
      setPeriodStart('');
      setPeriodEnd('');
      await queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', MODULE] });
    },
  });

  const submit = () => {
    createMutation.mutate({
      periodCode: optional(periodCode),
      agreementId: optional(agreementId),
      transferPointId: optional(transferPointId),
      periodStart: instant(periodStart),
      periodEnd: instant(periodEnd),
    });
  };

  if (permissions.status !== 'ready') {
    return <Container maxWidth="xl"><Alert severity="info">Loading custody permissions…</Alert></Container>;
  }

  if (!listPermission || !detailPermission) {
    return <Container maxWidth="xl"><Alert severity="warning">Custody workbench route-permission metadata is unavailable. Access is denied by default.</Alert></Container>;
  }

  if (!canRead) {
    return <Container maxWidth="xl"><Alert severity="warning">Your current HidraAPI grants do not allow custody workbench reads.</Alert></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4">Metering &amp; Custody</Typography>
          <Typography color="text.secondary">HWEB-012 measurement periods backed by custody-owned records and published HidraAPI commands.</Typography>
        </Box>
        <Alert severity="info">HidraAPI owns custody period status and lifecycle. HidraWEB displays backend status only and does not invent close, reopen, approve, or cancellation actions.</Alert>

        {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'custody resources')}</Alert> : null}
        {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
        {!resourcesQuery.isPending && !measurementPeriodResource ? <Alert severity="warning">HidraAPI did not publish a custody measurement-period workbench resource.</Alert> : null}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
            <Box>
              <Typography component="h2" variant="h6">Measurement periods</Typography>
              <Typography color="text.secondary" variant="body2">Runtime workbench resource: {measurementPeriodResource?.resource ?? 'unavailable'}</Typography>
            </Box>
            <TextField
              size="small"
              label="Search measurement periods"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(0); setSelectedId(''); }}
            />
          </Stack>
        </Paper>

        {periodsQuery.isError ? <Alert severity="error">{errorMessage(periodsQuery.error, 'measurement periods')}</Alert> : null}
        {periodsQuery.isPending && measurementPeriodResource ? <CircularProgress size={24} /> : null}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period code</TableCell>
                <TableCell>Agreement</TableCell>
                <TableCell>Transfer point</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Detail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(periodsQuery.data?.items ?? []).map((item, index) => {
                const id = item.id === undefined || item.id === null ? '' : String(item.id);
                return (
                  <TableRow key={id || index} selected={id === selectedId}>
                    <TableCell>{text(item.attributes.periodCode)}</TableCell>
                    <TableCell>{text(item.attributes.agreementId)}</TableCell>
                    <TableCell>{text(item.attributes.transferPointId)}</TableCell>
                    <TableCell>{text(item.attributes.periodStart)}</TableCell>
                    <TableCell>{text(item.attributes.periodEnd)}</TableCell>
                    <TableCell><Chip label={text(item.attributes.status)} size="small" variant="outlined" /></TableCell>
                    <TableCell align="right"><Button disabled={!id} onClick={() => setSelectedId(id)} size="small">Open</Button></TableCell>
                  </TableRow>
                );
              })}
              {(periodsQuery.data?.items.length ?? 0) === 0 ? <TableRow><TableCell colSpan={7}>No custody measurement periods returned by HidraAPI.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button disabled={page === 0} onClick={() => { setPage((value) => Math.max(0, value - 1)); setSelectedId(''); }}>Previous</Button>
          <Typography color="text.secondary" variant="body2">Page {page + 1}</Typography>
          <Button disabled={!periodsQuery.data || page + 1 >= periodsQuery.data.totalPages} onClick={() => { setPage((value) => value + 1); setSelectedId(''); }}>Next</Button>
        </Stack>

        {selectedId ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography component="h2" variant="h6">Selected measurement period</Typography>
              {detailQuery.isPending ? <CircularProgress size={20} /> : null}
              {detailQuery.isError ? <Alert severity="error">{errorMessage(detailQuery.error, 'measurement period detail')}</Alert> : null}
              {detailQuery.data ? <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto', m: 0 }}>{JSON.stringify(detailQuery.data.attributes, null, 2)}</Box> : null}
              <Button onClick={() => setSelectedId('')} size="small">Close detail</Button>
            </Stack>
          </Paper>
        ) : null}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography component="h2" variant="h6">Open measurement period</Typography>
              <Typography color="text.secondary" variant="body2">Agreement and transfer-point choices come only from runtime-discovered custody resources.</Typography>
            </Box>
            {!createPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for measurement-period creation.</Alert> : !canCreate ? <Alert severity="warning">Your current HidraAPI grants do not permit measurement-period creation.</Alert> : null}
            {!agreementResource ? <Alert severity="warning">Custody agreement resource is unavailable; no agreement value is inferred.</Alert> : null}
            {!transferPointResource ? <Alert severity="warning">Custody transfer-point resource is unavailable; no transfer-point value is inferred.</Alert> : null}
            <TextField label="Period code" value={periodCode} onChange={(event) => setPeriodCode(event.target.value)} />
            <FormControl fullWidth>
              <InputLabel id="custody-agreement-label">Agreement</InputLabel>
              <Select labelId="custody-agreement-label" label="Agreement" value={agreementId} onChange={(event) => setAgreementId(event.target.value)}>
                <MenuItem value=""><em>None</em></MenuItem>
                {(agreementsQuery.data?.items ?? []).map((record, index) => {
                  const id = record.id === undefined || record.id === null ? '' : String(record.id);
                  return <MenuItem key={id || index} value={id}>{labelFor(record, ['agreementNumber', 'agreementCode', 'code', 'nameEn', 'nameFr'])}</MenuItem>;
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="custody-transfer-point-label">Transfer point</InputLabel>
              <Select labelId="custody-transfer-point-label" label="Transfer point" value={transferPointId} onChange={(event) => setTransferPointId(event.target.value)}>
                <MenuItem value=""><em>None</em></MenuItem>
                {(transferPointsQuery.data?.items ?? []).map((record, index) => {
                  const id = record.id === undefined || record.id === null ? '' : String(record.id);
                  return <MenuItem key={id || index} value={id}>{labelFor(record, ['code', 'nameEn', 'nameFr', 'nameAr', 'topologyAssetNameSnapshot'])}</MenuItem>;
                })}
              </Select>
            </FormControl>
            <TextField label="Period start" type="datetime-local" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Period end" type="datetime-local" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <Button variant="contained" disabled={!canCreate || createMutation.isPending} onClick={submit}>Open measurement period</Button>
            {createMutation.isPending ? <CircularProgress size={20} /> : null}
            {createMutation.isError ? <Alert severity="error">{errorMessage(createMutation.error, 'measurement-period creation')}</Alert> : null}
            {createMutation.isSuccess ? <Alert severity="success">Measurement period opened by HidraAPI with status {text(createMutation.data.status)}.</Alert> : null}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
