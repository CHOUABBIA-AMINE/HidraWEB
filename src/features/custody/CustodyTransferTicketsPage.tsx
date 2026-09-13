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
import { useState } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { CreateCustodyTransferTicketRequest } from '@/api/generated/custody/model';
import { createCustodyTransferTicket } from '@/features/custody/api/custodyApi';
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
const CREATE_TICKET_ROUTE = '/api/v1/custody/transfer-tickets';

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

type WorkbenchResource = Awaited<ReturnType<typeof fetchWorkbenchResources>>[number];

function useReferenceRecords(resource: WorkbenchResource | undefined, canRead: boolean) {
  return useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, resource?.resource ?? '', 0, REFERENCE_PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({
      module: MODULE,
      resource: resource?.resource ?? '',
      page: 0,
      size: REFERENCE_PAGE_SIZE,
    }),
    enabled: canRead && Boolean(resource),
  });
}

interface ReferenceSelectProps {
  id: string;
  label: string;
  value: string;
  records: WorkbenchRecord[];
  labelFields: string[];
  onChange: (value: string) => void;
}

function ReferenceSelect({ id, label, value, records, labelFields, onChange }: ReferenceSelectProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        labelId={`${id}-label`}
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value=""><em>None</em></MenuItem>
        {records.map((record, index) => {
          const recordId = record.id === undefined || record.id === null ? '' : String(record.id);
          return <MenuItem key={recordId || index} value={recordId}>{labelFor(record, labelFields)}</MenuItem>;
        })}
      </Select>
    </FormControl>
  );
}

export function CustodyTransferTicketsPage() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [measurementPeriodId, setMeasurementPeriodId] = useState('');
  const [agreementId, setAgreementId] = useState('');
  const [transferPointId, setTransferPointId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [quantityCalculationId, setQuantityCalculationId] = useState('');
  const [ticketDate, setTicketDate] = useState('');
  const [issuedByActorId, setIssuedByActorId] = useState('');
  const [workflowInstanceId, setWorkflowInstanceId] = useState('');

  const listPermission = permissionForRoute(permissions.routes, WORKBENCH_LIST_ROUTE, 'GET');
  const detailPermission = permissionForRoute(permissions.routes, WORKBENCH_DETAIL_ROUTE, 'GET');
  const createPermission = permissionForRoute(permissions.routes, CREATE_TICKET_ROUTE, 'POST');
  const canRead = Boolean(
    listPermission
      && detailPermission
      && permissions.can(listPermission)
      && permissions.can(detailPermission),
  );
  const canCreate = Boolean(createPermission && permissions.can(createPermission));

  const resourcesQuery = useQuery({
    queryKey: workbenchQueryKeys.resources(MODULE),
    queryFn: () => fetchWorkbenchResources(MODULE),
    enabled: canRead,
  });

  const ticketResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyTransferTicketJpaEntity'));
  const measurementPeriodResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyMeasurementPeriodJpaEntity'));
  const agreementResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyAgreementJpaEntity'));
  const transferPointResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyTransferPointJpaEntity'));
  const batchResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyBatchJpaEntity'));
  const quantityCalculationResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyQuantityCalculationJpaEntity'));

  const ticketsQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, ticketResource?.resource ?? '', page, PAGE_SIZE, query),
    queryFn: () => fetchWorkbenchRecords({
      module: MODULE,
      resource: ticketResource?.resource ?? '',
      page,
      size: PAGE_SIZE,
      query,
    }),
    enabled: canRead && Boolean(ticketResource),
  });

  const measurementPeriodsQuery = useReferenceRecords(measurementPeriodResource, canRead);
  const agreementsQuery = useReferenceRecords(agreementResource, canRead);
  const transferPointsQuery = useReferenceRecords(transferPointResource, canRead);
  const batchesQuery = useReferenceRecords(batchResource, canRead);
  const quantityCalculationsQuery = useReferenceRecords(quantityCalculationResource, canRead);

  const detailQuery = useQuery({
    queryKey: workbenchQueryKeys.detail(MODULE, ticketResource?.resource ?? '', selectedId),
    queryFn: () => fetchWorkbenchRecord(MODULE, ticketResource?.resource ?? '', selectedId),
    enabled: canRead && Boolean(ticketResource && selectedId),
  });

  const createMutation = useMutation({
    mutationFn: (request: CreateCustodyTransferTicketRequest) => createCustodyTransferTicket(request),
    onSuccess: async () => {
      setTicketNumber('');
      setMeasurementPeriodId('');
      setAgreementId('');
      setTransferPointId('');
      setBatchId('');
      setQuantityCalculationId('');
      setTicketDate('');
      setIssuedByActorId('');
      setWorkflowInstanceId('');
      await queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', MODULE] });
    },
  });

  const submit = () => {
    createMutation.mutate({
      ticketNumber: optional(ticketNumber),
      measurementPeriodId: optional(measurementPeriodId),
      agreementId: optional(agreementId),
      transferPointId: optional(transferPointId),
      batchId: optional(batchId),
      quantityCalculationId: optional(quantityCalculationId),
      ticketDate: instant(ticketDate),
      issuedByActorId: optional(issuedByActorId),
      workflowInstanceId: optional(workflowInstanceId),
    });
  };

  if (permissions.status !== 'ready') {
    return <Container maxWidth="xl"><Alert severity="info">Loading custody permissions…</Alert></Container>;
  }

  if (!listPermission || !detailPermission) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning">Custody workbench route-permission metadata is unavailable. Access is denied by default.</Alert>
      </Container>
    );
  }

  if (!canRead) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning">Your current HidraAPI grants do not allow custody workbench reads.</Alert>
      </Container>
    );
  }

  const missingReferences = [
    { name: 'measurement-period', resource: measurementPeriodResource },
    { name: 'agreement', resource: agreementResource },
    { name: 'transfer-point', resource: transferPointResource },
    { name: 'batch', resource: batchResource },
    { name: 'quantity-calculation', resource: quantityCalculationResource },
  ].filter((item) => !item.resource).map((item) => item.name);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4">Custody transfer tickets</Typography>
          <Typography color="text.secondary">
            HWEB-012 transfer-ticket records backed by custody-owned workbench reads and the published HidraAPI create command.
          </Typography>
        </Box>
        <Alert severity="info">
          HidraAPI owns transfer-ticket status and lifecycle. HidraWEB displays backend status only and does not invent submit, approve, reject, cancel, correct, or close actions.
        </Alert>

        {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'custody resources')}</Alert> : null}
        {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
        {!resourcesQuery.isPending && !ticketResource ? (
          <Alert severity="warning">HidraAPI did not publish a custody transfer-ticket workbench resource.</Alert>
        ) : null}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography component="h2" variant="h6">Transfer tickets</Typography>
              <Typography color="text.secondary" variant="body2">
                Runtime workbench resource: {ticketResource?.resource ?? 'unavailable'}
              </Typography>
            </Box>
            <TextField
              size="small"
              label="Search transfer tickets"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
                setSelectedId('');
              }}
            />
          </Stack>
        </Paper>

        {ticketsQuery.isError ? <Alert severity="error">{errorMessage(ticketsQuery.error, 'transfer tickets')}</Alert> : null}
        {ticketsQuery.isPending && ticketResource ? <CircularProgress size={24} /> : null}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ticket number</TableCell>
                <TableCell>Measurement period</TableCell>
                <TableCell>Agreement</TableCell>
                <TableCell>Transfer point</TableCell>
                <TableCell>Ticket date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Detail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(ticketsQuery.data?.items ?? []).map((item, index) => {
                const id = item.id === undefined || item.id === null ? '' : String(item.id);
                return (
                  <TableRow key={id || index} selected={id === selectedId}>
                    <TableCell>{text(item.attributes.ticketNumber)}</TableCell>
                    <TableCell>{text(item.attributes.measurementPeriodId)}</TableCell>
                    <TableCell>{text(item.attributes.agreementId)}</TableCell>
                    <TableCell>{text(item.attributes.transferPointId)}</TableCell>
                    <TableCell>{text(item.attributes.ticketDate)}</TableCell>
                    <TableCell><Chip label={text(item.attributes.status)} size="small" variant="outlined" /></TableCell>
                    <TableCell align="right">
                      <Button disabled={!id} onClick={() => setSelectedId(id)} size="small">Open</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(ticketsQuery.data?.items.length ?? 0) === 0 ? (
                <TableRow><TableCell colSpan={7}>No custody transfer tickets returned by HidraAPI.</TableCell></TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button
            disabled={page === 0}
            onClick={() => {
              setPage((value) => Math.max(0, value - 1));
              setSelectedId('');
            }}
          >
            Previous
          </Button>
          <Typography color="text.secondary" variant="body2">Page {page + 1}</Typography>
          <Button
            disabled={!ticketsQuery.data || page + 1 >= ticketsQuery.data.totalPages}
            onClick={() => {
              setPage((value) => value + 1);
              setSelectedId('');
            }}
          >
            Next
          </Button>
        </Stack>

        {selectedId ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography component="h2" variant="h6">Selected transfer ticket</Typography>
              {detailQuery.isPending ? <CircularProgress size={20} /> : null}
              {detailQuery.isError ? <Alert severity="error">{errorMessage(detailQuery.error, 'transfer-ticket detail')}</Alert> : null}
              {detailQuery.data ? (
                <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto', m: 0 }}>
                  {JSON.stringify(detailQuery.data.attributes, null, 2)}
                </Box>
              ) : null}
              <Button onClick={() => setSelectedId('')} size="small">Close detail</Button>
            </Stack>
          </Paper>
        ) : null}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography component="h2" variant="h6">Create transfer ticket</Typography>
              <Typography color="text.secondary" variant="body2">
                Custody-owned references come only from runtime-discovered custody resources. Actor and workflow values remain optional neutral identifiers.
              </Typography>
            </Box>
            {!createPermission ? (
              <Alert severity="warning">HidraAPI did not publish route-permission metadata for transfer-ticket creation.</Alert>
            ) : !canCreate ? (
              <Alert severity="warning">Your current HidraAPI grants do not permit transfer-ticket creation.</Alert>
            ) : null}
            {missingReferences.length > 0 ? (
              <Alert severity="warning">Missing custody reference resources: {missingReferences.join(', ')}. No reference value is inferred.</Alert>
            ) : null}
            <TextField label="Ticket number" value={ticketNumber} onChange={(event) => setTicketNumber(event.target.value)} />
            <ReferenceSelect
              id="ticket-period"
              label="Measurement period"
              value={measurementPeriodId}
              onChange={setMeasurementPeriodId}
              records={measurementPeriodsQuery.data?.items ?? []}
              labelFields={['periodCode', 'code']}
            />
            <ReferenceSelect
              id="ticket-agreement"
              label="Agreement"
              value={agreementId}
              onChange={setAgreementId}
              records={agreementsQuery.data?.items ?? []}
              labelFields={['agreementNumber', 'agreementCode', 'code', 'nameEn', 'nameFr']}
            />
            <ReferenceSelect
              id="ticket-transfer-point"
              label="Transfer point"
              value={transferPointId}
              onChange={setTransferPointId}
              records={transferPointsQuery.data?.items ?? []}
              labelFields={['code', 'nameEn', 'nameFr', 'nameAr', 'topologyAssetNameSnapshot']}
            />
            <ReferenceSelect
              id="ticket-batch"
              label="Batch"
              value={batchId}
              onChange={setBatchId}
              records={batchesQuery.data?.items ?? []}
              labelFields={['batchNumber', 'batchCode', 'code']}
            />
            <ReferenceSelect
              id="ticket-quantity-calculation"
              label="Quantity calculation"
              value={quantityCalculationId}
              onChange={setQuantityCalculationId}
              records={quantityCalculationsQuery.data?.items ?? []}
              labelFields={['calculationNumber', 'calculationCode', 'code']}
            />
            <TextField
              label="Ticket date"
              type="datetime-local"
              value={ticketDate}
              onChange={(event) => setTicketDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField label="Issued by actor ID" value={issuedByActorId} onChange={(event) => setIssuedByActorId(event.target.value)} />
            <TextField label="Workflow instance ID" value={workflowInstanceId} onChange={(event) => setWorkflowInstanceId(event.target.value)} />
            <Button variant="contained" disabled={!canCreate || createMutation.isPending} onClick={submit}>
              Create transfer ticket
            </Button>
            {createMutation.isPending ? <CircularProgress size={20} /> : null}
            {createMutation.isError ? <Alert severity="error">{errorMessage(createMutation.error, 'transfer-ticket creation')}</Alert> : null}
            {createMutation.isSuccess ? (
              <Alert severity="success">Transfer ticket created by HidraAPI with status {text(createMutation.data.status)}.</Alert>
            ) : null}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
