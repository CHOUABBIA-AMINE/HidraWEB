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
import type { OpenCustodyDiscrepancyRequest } from '@/api/generated/custody/model';
import { openCustodyDiscrepancy } from '@/features/custody/api/custodyApi';
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
const OPEN_DISCREPANCY_ROUTE = '/api/v1/custody/discrepancies';

type RouteMethod = 'GET' | 'POST';
type WorkbenchResource = Awaited<ReturnType<typeof fetchWorkbenchResources>>[number];

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

function decimal(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function instant(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

function text(value: unknown): string {
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function errorMessage(error: unknown, resource: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return `HidraAPI refused access to ${resource}.`;
  return normalized.message || `${resource} could not be loaded.`;
}

function recordId(record: WorkbenchRecord): string {
  return record.id === undefined || record.id === null ? '' : String(record.id);
}

function useRecords(resource: WorkbenchResource | undefined, canRead: boolean, page = 0, size = PAGE_SIZE) {
  return useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, resource?.resource ?? '', page, size, ''),
    queryFn: () => fetchWorkbenchRecords({
      module: MODULE,
      resource: resource?.resource ?? '',
      page,
      size,
    }),
    enabled: canRead && Boolean(resource),
  });
}

export function CustodyDiscrepanciesPage() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [reconciliationPage, setReconciliationPage] = useState(0);
  const [discrepancyPage, setDiscrepancyPage] = useState(0);
  const [selectedReconciliationId, setSelectedReconciliationId] = useState('');
  const [selectedDiscrepancyId, setSelectedDiscrepancyId] = useState('');
  const [discrepancyNumber, setDiscrepancyNumber] = useState('');
  const [reconciliationId, setReconciliationId] = useState('');
  const [discrepancyTypeId, setDiscrepancyTypeId] = useState('');
  const [differenceQuantity, setDifferenceQuantity] = useState('');
  const [quantityUnitId, setQuantityUnitId] = useState('');
  const [description, setDescription] = useState('');
  const [assignedActorId, setAssignedActorId] = useState('');
  const [openedAt, setOpenedAt] = useState('');

  const listPermission = permissionForRoute(permissions.routes, WORKBENCH_LIST_ROUTE, 'GET');
  const detailPermission = permissionForRoute(permissions.routes, WORKBENCH_DETAIL_ROUTE, 'GET');
  const createPermission = permissionForRoute(permissions.routes, OPEN_DISCREPANCY_ROUTE, 'POST');
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

  const reconciliationResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyReconciliationJpaEntity'));
  const discrepancyResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyDiscrepancyJpaEntity'));

  const reconciliationsQuery = useRecords(reconciliationResource, canRead, reconciliationPage);
  const discrepanciesQuery = useRecords(discrepancyResource, canRead, discrepancyPage);
  const reconciliationReferencesQuery = useRecords(reconciliationResource, canRead, 0, REFERENCE_PAGE_SIZE);

  const reconciliationDetailQuery = useQuery({
    queryKey: workbenchQueryKeys.detail(MODULE, reconciliationResource?.resource ?? '', selectedReconciliationId),
    queryFn: () => fetchWorkbenchRecord(MODULE, reconciliationResource?.resource ?? '', selectedReconciliationId),
    enabled: canRead && Boolean(reconciliationResource && selectedReconciliationId),
  });

  const discrepancyDetailQuery = useQuery({
    queryKey: workbenchQueryKeys.detail(MODULE, discrepancyResource?.resource ?? '', selectedDiscrepancyId),
    queryFn: () => fetchWorkbenchRecord(MODULE, discrepancyResource?.resource ?? '', selectedDiscrepancyId),
    enabled: canRead && Boolean(discrepancyResource && selectedDiscrepancyId),
  });

  const createMutation = useMutation({
    mutationFn: (request: OpenCustodyDiscrepancyRequest) => openCustodyDiscrepancy(request),
    onSuccess: async () => {
      setDiscrepancyNumber('');
      setReconciliationId('');
      setDiscrepancyTypeId('');
      setDifferenceQuantity('');
      setQuantityUnitId('');
      setDescription('');
      setAssignedActorId('');
      setOpenedAt('');
      await queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', MODULE] });
    },
  });

  const submit = () => {
    createMutation.mutate({
      discrepancyNumber: optional(discrepancyNumber),
      reconciliationId: optional(reconciliationId),
      discrepancyTypeId: optional(discrepancyTypeId),
      differenceQuantity: decimal(differenceQuantity),
      quantityUnitId: optional(quantityUnitId),
      description: optional(description),
      assignedActorId: optional(assignedActorId),
      openedAt: instant(openedAt),
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

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4">Custody discrepancies & reconciliation</Typography>
          <Typography color="text.secondary">
            HWEB-012 reconciliation and discrepancy records backed by runtime custody workbench reads and the published discrepancy-open command.
          </Typography>
        </Box>

        <Alert severity="info">
          HidraAPI owns reconciliation and discrepancy lifecycle. HidraWEB exposes no reconcile, accept, reject, resolve, close, cancel, or status-transition actions.
        </Alert>

        {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'custody resources')}</Alert> : null}
        {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
        {!resourcesQuery.isPending && !reconciliationResource ? (
          <Alert severity="warning">HidraAPI did not publish a custody reconciliation workbench resource.</Alert>
        ) : null}
        {!resourcesQuery.isPending && !discrepancyResource ? (
          <Alert severity="warning">HidraAPI did not publish a custody discrepancy workbench resource.</Alert>
        ) : null}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography component="h2" variant="h6">Reconciliations</Typography>
              <Typography color="text.secondary" variant="body2">
                Read-only runtime workbench resource: {reconciliationResource?.resource ?? 'unavailable'}
              </Typography>
            </Box>
            {reconciliationsQuery.isError ? <Alert severity="error">{errorMessage(reconciliationsQuery.error, 'reconciliations')}</Alert> : null}
            {reconciliationsQuery.isPending && reconciliationResource ? <CircularProgress size={20} /> : null}
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Status</TableCell><TableCell align="right">Detail</TableCell></TableRow></TableHead>
                <TableBody>
                  {(reconciliationsQuery.data?.items ?? []).map((item, index) => {
                    const id = recordId(item);
                    return (
                      <TableRow key={id || index} selected={id === selectedReconciliationId}>
                        <TableCell>{text(id)}</TableCell>
                        <TableCell><Chip label={text(item.attributes.status)} size="small" variant="outlined" /></TableCell>
                        <TableCell align="right"><Button disabled={!id} onClick={() => setSelectedReconciliationId(id)} size="small">Open reconciliation</Button></TableCell>
                      </TableRow>
                    );
                  })}
                  {(reconciliationsQuery.data?.items.length ?? 0) === 0 ? <TableRow><TableCell colSpan={3}>No reconciliations returned by HidraAPI.</TableCell></TableRow> : null}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button disabled={reconciliationPage === 0} onClick={() => setReconciliationPage((value) => Math.max(0, value - 1))}>Previous</Button>
              <Typography variant="body2" color="text.secondary">Page {reconciliationPage + 1}</Typography>
              <Button disabled={!reconciliationsQuery.data || reconciliationPage + 1 >= reconciliationsQuery.data.totalPages} onClick={() => setReconciliationPage((value) => value + 1)}>Next</Button>
            </Stack>
          </Stack>
        </Paper>

        {selectedReconciliationId ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography component="h2" variant="h6">Selected reconciliation</Typography>
              {reconciliationDetailQuery.isPending ? <CircularProgress size={20} /> : null}
              {reconciliationDetailQuery.isError ? <Alert severity="error">{errorMessage(reconciliationDetailQuery.error, 'reconciliation detail')}</Alert> : null}
              {reconciliationDetailQuery.data ? <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto', m: 0 }}>{JSON.stringify(reconciliationDetailQuery.data.attributes, null, 2)}</Box> : null}
              <Button onClick={() => setSelectedReconciliationId('')} size="small">Close detail</Button>
            </Stack>
          </Paper>
        ) : null}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography component="h2" variant="h6">Discrepancies</Typography>
              <Typography color="text.secondary" variant="body2">
                Runtime workbench resource: {discrepancyResource?.resource ?? 'unavailable'}
              </Typography>
            </Box>
            {discrepanciesQuery.isError ? <Alert severity="error">{errorMessage(discrepanciesQuery.error, 'discrepancies')}</Alert> : null}
            {discrepanciesQuery.isPending && discrepancyResource ? <CircularProgress size={20} /> : null}
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>Number</TableCell><TableCell>Reconciliation</TableCell><TableCell>Type</TableCell><TableCell>Difference</TableCell><TableCell>Status</TableCell><TableCell>Opened</TableCell><TableCell align="right">Detail</TableCell></TableRow></TableHead>
                <TableBody>
                  {(discrepanciesQuery.data?.items ?? []).map((item, index) => {
                    const id = recordId(item);
                    return (
                      <TableRow key={id || index} selected={id === selectedDiscrepancyId}>
                        <TableCell>{text(item.attributes.discrepancyNumber)}</TableCell>
                        <TableCell>{text(item.attributes.reconciliationId)}</TableCell>
                        <TableCell>{text(item.attributes.discrepancyTypeId)}</TableCell>
                        <TableCell>{text(item.attributes.differenceQuantity)}</TableCell>
                        <TableCell><Chip label={text(item.attributes.status)} size="small" variant="outlined" /></TableCell>
                        <TableCell>{text(item.attributes.openedAt)}</TableCell>
                        <TableCell align="right"><Button disabled={!id} onClick={() => setSelectedDiscrepancyId(id)} size="small">Open discrepancy</Button></TableCell>
                      </TableRow>
                    );
                  })}
                  {(discrepanciesQuery.data?.items.length ?? 0) === 0 ? <TableRow><TableCell colSpan={7}>No custody discrepancies returned by HidraAPI.</TableCell></TableRow> : null}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button disabled={discrepancyPage === 0} onClick={() => setDiscrepancyPage((value) => Math.max(0, value - 1))}>Previous</Button>
              <Typography variant="body2" color="text.secondary">Page {discrepancyPage + 1}</Typography>
              <Button disabled={!discrepanciesQuery.data || discrepancyPage + 1 >= discrepanciesQuery.data.totalPages} onClick={() => setDiscrepancyPage((value) => value + 1)}>Next</Button>
            </Stack>
          </Stack>
        </Paper>

        {selectedDiscrepancyId ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography component="h2" variant="h6">Selected discrepancy</Typography>
              {discrepancyDetailQuery.isPending ? <CircularProgress size={20} /> : null}
              {discrepancyDetailQuery.isError ? <Alert severity="error">{errorMessage(discrepancyDetailQuery.error, 'discrepancy detail')}</Alert> : null}
              {discrepancyDetailQuery.data ? <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto', m: 0 }}>{JSON.stringify(discrepancyDetailQuery.data.attributes, null, 2)}</Box> : null}
              <Button onClick={() => setSelectedDiscrepancyId('')} size="small">Close detail</Button>
            </Stack>
          </Paper>
        ) : null}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography component="h2" variant="h6">Open discrepancy</Typography>
              <Typography color="text.secondary" variant="body2">
                All request properties preserve HidraAPI OpenAPI optionality. The reconciliation reference comes only from the runtime-discovered custody resource; type, unit, and actor remain neutral identifiers.
              </Typography>
            </Box>
            {!createPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for discrepancy opening.</Alert> : !canCreate ? <Alert severity="warning">Your current HidraAPI grants do not permit discrepancy opening.</Alert> : null}
            <TextField label="Discrepancy number" value={discrepancyNumber} onChange={(event) => setDiscrepancyNumber(event.target.value)} />
            <FormControl fullWidth>
              <InputLabel id="reconciliation-id-label">Reconciliation</InputLabel>
              <Select labelId="reconciliation-id-label" label="Reconciliation" value={reconciliationId} onChange={(event) => setReconciliationId(event.target.value)}>
                <MenuItem value=""><em>None</em></MenuItem>
                {(reconciliationReferencesQuery.data?.items ?? []).map((record, index) => {
                  const id = recordId(record);
                  return <MenuItem key={id || index} value={id}>{id || `Reconciliation ${index + 1}`}</MenuItem>;
                })}
              </Select>
            </FormControl>
            <TextField label="Discrepancy type ID" value={discrepancyTypeId} onChange={(event) => setDiscrepancyTypeId(event.target.value)} />
            <TextField label="Difference quantity" inputMode="decimal" value={differenceQuantity} onChange={(event) => setDifferenceQuantity(event.target.value)} />
            <TextField label="Quantity unit ID" value={quantityUnitId} onChange={(event) => setQuantityUnitId(event.target.value)} />
            <TextField label="Description" multiline minRows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
            <TextField label="Assigned actor ID" value={assignedActorId} onChange={(event) => setAssignedActorId(event.target.value)} />
            <TextField label="Opened at" type="datetime-local" value={openedAt} onChange={(event) => setOpenedAt(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            {createMutation.isError ? <Alert severity="error">{errorMessage(createMutation.error, 'discrepancy opening')}</Alert> : null}
            {createMutation.data ? <Alert severity="success">Discrepancy opened by HidraAPI with status {text(createMutation.data.status)}.</Alert> : null}
            <Button variant="contained" disabled={!canCreate || createMutation.isPending} onClick={submit}>Open discrepancy</Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
