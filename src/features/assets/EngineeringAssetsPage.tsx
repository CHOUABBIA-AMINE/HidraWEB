import {
  Alert, Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Link as RouterLink } from 'react-router';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import {
  createMaintenanceWorkOrder,
  recordAssetCondition,
  registerMaintainableAsset,
  type CreateMaintenanceWorkOrderRequest,
  type RecordAssetConditionRequest,
  type RegisterMaintainableAssetRequest,
} from '@/features/assets/api/assetsApi';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchRecord,
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  workbenchQueryKeys,
} from '@/features/workbench/api/workbenchApi';

const MODULE = 'assets';
const PAGE_SIZE = 25;
const WORKBENCH_LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';
const WORKBENCH_DETAIL_ROUTE = '/api/v1/workbench/{module}/{resource}/{id}';
const REGISTER_ASSET_ROUTE = '/api/v1/assets/maintainable-assets';
const RECORD_CONDITION_ROUTE = '/api/v1/assets/asset-conditions';
const CREATE_WORK_ORDER_ROUTE = '/api/v1/assets/maintenance-work-orders';

type RouteMethod = 'GET' | 'POST';
type FormState = Record<string, string>;

function permissionForRoute(
  routes: ReturnType<typeof usePermissions>['routes'], route: string, method: RouteMethod,
): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes(method))?.permission;
}

function clean(value: string): string | undefined {
  const normalized = value.trim();
  return normalized || undefined;
}

function instant(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

function errorMessage(error: unknown, resource: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return `HidraAPI refused access to ${resource}.`;
  return normalized.message || `${resource} could not be loaded.`;
}

export function EngineeringAssetsPage() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [resource, setResource] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [assetForm, setAssetForm] = useState<FormState>({
    assetNumber: '', assetCode: '', assetName: '', assetTypeId: '', topologyAssetTypeCode: '', topologyAssetId: '',
    topologyAssetCodeSnapshot: '', topologyAssetNameSnapshot: '', criticalityId: '', ownerOrganizationUnitId: '',
    ownerOrganizationUnitNameSnapshot: '', manufacturerPartyId: '', manufacturerNameSnapshot: '', modelId: '',
    serialIdentityId: '', installedAt: '', commissionedAt: '', createdByActorId: '',
  });
  const [conditionForm, setConditionForm] = useState<FormState>({
    maintainableAssetId: '', conditionStatus: '', conditionTypeId: '', sourceModule: '', sourceReferenceId: '',
    summary: '', conditionScore: '', observedAt: '', observedByActorId: '',
  });
  const [workOrderForm, setWorkOrderForm] = useState<FormState>({
    workOrderNumber: '', maintainableAssetId: '', maintenancePlanId: '', sourceRecommendationId: '', workOrderTypeId: '',
    priorityId: '', title: '', description: '', assignedOrganizationUnitId: '', assignedActorId: '', plannedStartAt: '',
    plannedEndAt: '', workflowInstanceId: '', createdByActorId: '',
  });

  const listPermission = permissionForRoute(permissions.routes, WORKBENCH_LIST_ROUTE, 'GET');
  const detailPermission = permissionForRoute(permissions.routes, WORKBENCH_DETAIL_ROUTE, 'GET');
  const registerPermission = permissionForRoute(permissions.routes, REGISTER_ASSET_ROUTE, 'POST');
  const conditionPermission = permissionForRoute(permissions.routes, RECORD_CONDITION_ROUTE, 'POST');
  const workOrderPermission = permissionForRoute(permissions.routes, CREATE_WORK_ORDER_ROUTE, 'POST');
  const canRead = Boolean(listPermission && detailPermission && permissions.can(listPermission) && permissions.can(detailPermission));
  const canRegister = Boolean(registerPermission && permissions.can(registerPermission));
  const canRecordCondition = Boolean(conditionPermission && permissions.can(conditionPermission));
  const canCreateWorkOrder = Boolean(workOrderPermission && permissions.can(workOrderPermission));

  const resourcesQuery = useQuery({
    queryKey: workbenchQueryKeys.resources(MODULE),
    queryFn: () => fetchWorkbenchResources(MODULE),
    enabled: canRead,
  });
  const effectiveResource = resource || resourcesQuery.data?.[0]?.resource || '';
  const listQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, effectiveResource, page, PAGE_SIZE, query),
    queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: effectiveResource, page, size: PAGE_SIZE, query }),
    enabled: canRead && Boolean(effectiveResource),
  });
  const detailQuery = useQuery({
    queryKey: workbenchQueryKeys.detail(MODULE, effectiveResource, selectedId),
    queryFn: () => fetchWorkbenchRecord(MODULE, effectiveResource, selectedId),
    enabled: canRead && Boolean(effectiveResource && selectedId),
  });
  const selectedDescriptor = useMemo(
    () => resourcesQuery.data?.find((item) => item.resource === effectiveResource),
    [effectiveResource, resourcesQuery.data],
  );
  const invalidateAssets = () => queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', MODULE] });

  const assetMutation = useMutation({ mutationFn: registerMaintainableAsset, onSuccess: invalidateAssets });
  const conditionMutation = useMutation({ mutationFn: recordAssetCondition, onSuccess: invalidateAssets });
  const workOrderMutation = useMutation({ mutationFn: createMaintenanceWorkOrder, onSuccess: invalidateAssets });

  if (permissions.status !== 'ready') {
    return <Container maxWidth="xl"><Alert severity="info">Loading engineering permissions…</Alert></Container>;
  }
  if (!canRead) {
    return <Container maxWidth="xl"><Alert severity="warning">No authoritative permission is available for assets workbench reads.</Alert></Container>;
  }

  const registerAsset = () => {
    const request: RegisterMaintainableAssetRequest = {
      assetNumber: clean(assetForm.assetNumber),
      assetCode: clean(assetForm.assetCode),
      assetName: clean(assetForm.assetName),
      assetTypeId: clean(assetForm.assetTypeId),
      topologyAssetTypeCode: clean(assetForm.topologyAssetTypeCode),
      topologyAssetId: clean(assetForm.topologyAssetId),
      topologyAssetCodeSnapshot: clean(assetForm.topologyAssetCodeSnapshot),
      topologyAssetNameSnapshot: clean(assetForm.topologyAssetNameSnapshot),
      criticalityId: clean(assetForm.criticalityId),
      ownerOrganizationUnitId: clean(assetForm.ownerOrganizationUnitId),
      ownerOrganizationUnitNameSnapshot: clean(assetForm.ownerOrganizationUnitNameSnapshot),
      manufacturerPartyId: clean(assetForm.manufacturerPartyId),
      manufacturerNameSnapshot: clean(assetForm.manufacturerNameSnapshot),
      modelId: clean(assetForm.modelId),
      serialIdentityId: clean(assetForm.serialIdentityId),
      installedAt: instant(assetForm.installedAt),
      commissionedAt: instant(assetForm.commissionedAt),
      createdByActorId: clean(assetForm.createdByActorId),
    };
    assetMutation.mutate(request);
  };

  const recordCondition = () => {
    const request: RecordAssetConditionRequest = {
      maintainableAssetId: clean(conditionForm.maintainableAssetId),
      conditionStatus: clean(conditionForm.conditionStatus),
      conditionTypeId: clean(conditionForm.conditionTypeId),
      sourceModule: clean(conditionForm.sourceModule),
      sourceReferenceId: clean(conditionForm.sourceReferenceId),
      summary: clean(conditionForm.summary),
      conditionScore: conditionForm.conditionScore ? Number(conditionForm.conditionScore) : undefined,
      observedAt: instant(conditionForm.observedAt),
      observedByActorId: clean(conditionForm.observedByActorId),
    };
    conditionMutation.mutate(request);
  };

  const createWorkOrder = () => {
    const request: CreateMaintenanceWorkOrderRequest = {
      workOrderNumber: clean(workOrderForm.workOrderNumber),
      maintainableAssetId: clean(workOrderForm.maintainableAssetId),
      maintenancePlanId: clean(workOrderForm.maintenancePlanId),
      sourceRecommendationId: clean(workOrderForm.sourceRecommendationId),
      workOrderTypeId: clean(workOrderForm.workOrderTypeId),
      priorityId: clean(workOrderForm.priorityId),
      title: clean(workOrderForm.title),
      description: clean(workOrderForm.description),
      assignedOrganizationUnitId: clean(workOrderForm.assignedOrganizationUnitId),
      assignedActorId: clean(workOrderForm.assignedActorId),
      plannedStartAt: instant(workOrderForm.plannedStartAt),
      plannedEndAt: instant(workOrderForm.plannedEndAt),
      workflowInstanceId: clean(workOrderForm.workflowInstanceId),
      createdByActorId: clean(workOrderForm.createdByActorId),
    };
    workOrderMutation.mutate(request);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4">Integrity &amp; Maintenance</Typography>
              <Typography color="text.secondary">HWEB-011 maintainable asset and work-order workspace.</Typography>
            </Box>
            <Button component={RouterLink} to="/engineering" variant="outlined">Integrity assessments</Button>
          </Stack>
        </Box>

        {resourcesQuery.isError && <Alert severity="error">{errorMessage(resourcesQuery.error, 'assets resources')}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl sx={{ minWidth: 280 }} size="small">
                <InputLabel id="assets-resource-label">Assets resource</InputLabel>
                <Select
                  labelId="assets-resource-label" value={effectiveResource} label="Assets resource"
                  onChange={(event) => { setResource(event.target.value); setPage(0); setSelectedId(''); }}
                >
                  {(resourcesQuery.data ?? []).map((item) => (
                    <MenuItem key={item.resource} value={item.resource}>{item.entityName || item.resource}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small" label="Search" value={query}
                onChange={(event) => { setQuery(event.target.value); setPage(0); setSelectedId(''); }}
                helperText="Uses HidraAPI workbench text search."
              />
            </Stack>
            {selectedDescriptor && <Typography variant="caption">Backend resource: {selectedDescriptor.resource} · ID field: {selectedDescriptor.idField}</Typography>}
          </Stack>
        </Paper>

        {listQuery.isError && <Alert severity="error">{errorMessage(listQuery.error, 'assets records')}</Alert>}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Backend attributes</TableCell></TableRow></TableHead>
            <TableBody>
              {(listQuery.data?.items ?? []).map((item, index) => {
                const id = item.id === undefined || item.id === null ? '' : String(item.id);
                return (
                  <TableRow key={id || index} hover selected={Boolean(id && id === selectedId)} onClick={() => id && setSelectedId(id)} sx={{ cursor: id ? 'pointer' : 'default' }}>
                    <TableCell>{id || '—'}</TableCell><TableCell>{JSON.stringify(item.attributes)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button disabled={page === 0} onClick={() => { setPage((value) => Math.max(0, value - 1)); setSelectedId(''); }}>Previous</Button>
          <Typography>Page {page + 1}</Typography>
          <Button disabled={!listQuery.data || page + 1 >= listQuery.data.totalPages} onClick={() => { setPage((value) => value + 1); setSelectedId(''); }}>Next</Button>
        </Stack>
        {selectedId && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Selected asset record</Typography>
            {detailQuery.isError ? <Alert severity="error">{errorMessage(detailQuery.error, 'asset record')}</Alert> : (
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto', m: 0 }}>{detailQuery.data ? JSON.stringify(detailQuery.data.attributes, null, 2) : 'Loading…'}</Box>
            )}
          </Paper>
        )}

        <CommandPanel
          title="Register maintainable asset" permission={registerPermission} allowed={canRegister} mutation={assetMutation}
          success="Maintainable asset registered. Assets reads were invalidated for refresh."
          form={assetForm} setForm={setAssetForm} dateFields={['installedAt', 'commissionedAt']} onSubmit={registerAsset}
        />
        <CommandPanel
          title="Record asset condition" permission={conditionPermission} allowed={canRecordCondition} mutation={conditionMutation}
          success="Asset condition recorded. Assets reads were invalidated for refresh."
          form={conditionForm} setForm={setConditionForm} dateFields={['observedAt']} onSubmit={recordCondition}
        />
        <CommandPanel
          title="Create maintenance work order" permission={workOrderPermission} allowed={canCreateWorkOrder} mutation={workOrderMutation}
          success="Maintenance work order created. Assets reads were invalidated for refresh."
          form={workOrderForm} setForm={setWorkOrderForm} dateFields={['plannedStartAt', 'plannedEndAt']} onSubmit={createWorkOrder}
        />
      </Stack>
    </Container>
  );
}

interface CommandPanelProps {
  title: string;
  permission?: string;
  allowed: boolean;
  mutation: { isPending: boolean; isError: boolean; isSuccess: boolean; error: unknown };
  success: string;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  dateFields: string[];
  onSubmit: () => void;
}

function CommandPanel({ title, permission, allowed, mutation, success, form, setForm, dateFields, onSubmit }: CommandPanelProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">{title}</Typography>
        {!permission && <Alert severity="warning">HidraAPI did not publish a route permission for this action.</Alert>}
        {permission && !allowed && <Alert severity="info">Your effective grants do not permit this action.</Alert>}
        {mutation.isError && <Alert severity="error">{errorMessage(mutation.error, title)}</Alert>}
        {mutation.isSuccess && <Alert severity="success">{success}</Alert>}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {Object.entries(form).map(([field, value]) => (
            <TextField
              key={field} size="small" label={field} type={dateFields.includes(field) ? 'datetime-local' : 'text'} value={value}
              onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
              slotProps={dateFields.includes(field) ? { inputLabel: { shrink: true } } : undefined}
            />
          ))}
        </Stack>
        <Button variant="contained" disabled={!allowed || mutation.isPending} onClick={onSubmit}>{title}</Button>
      </Stack>
    </Paper>
  );
}
