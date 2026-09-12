import {
  Alert,
  Box,
  Button,
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
import { useMemo, useState, type ReactNode } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { createIntegrityAssessment } from '@/features/integrity/api/integrityApi';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchRecord,
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  workbenchQueryKeys,
} from '@/features/workbench/api/workbenchApi';

const MODULE = 'integrity';
const PAGE_SIZE = 25;
const WORKBENCH_LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';
const WORKBENCH_DETAIL_ROUTE = '/api/v1/workbench/{module}/{resource}/{id}';
const CREATE_ASSESSMENT_ROUTE = '/api/v1/integrity/assessments';

type RouteMethod = 'GET' | 'POST';

export interface EngineeringIntegrityPageProps {
  renderSelectedContext?: (attributes?: Record<string, unknown>) => ReactNode;
}

function permissionForRoute(
  routes: ReturnType<typeof usePermissions>['routes'],
  route: string,
  method: RouteMethod,
): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes(method))?.permission;
}

function errorMessage(error: unknown, resource: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return `HidraAPI refused access to ${resource}.`;
  return normalized.message || `${resource} could not be loaded.`;
}

function clean(value: string): string | undefined {
  const normalized = value.trim();
  return normalized || undefined;
}

export function EngineeringIntegrityPage({ renderSelectedContext }: EngineeringIntegrityPageProps = {}) {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [resource, setResource] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    programId: '', assessmentNumber: '', title: '', description: '', assessmentTypeId: '',
    methodologyId: '', assessmentDate: '', assessedByActorId: '', workflowInstanceId: '',
  });

  const listPermission = permissionForRoute(permissions.routes, WORKBENCH_LIST_ROUTE, 'GET');
  const detailPermission = permissionForRoute(permissions.routes, WORKBENCH_DETAIL_ROUTE, 'GET');
  const createPermission = permissionForRoute(permissions.routes, CREATE_ASSESSMENT_ROUTE, 'POST');
  const canRead = Boolean(listPermission && detailPermission && permissions.can(listPermission) && permissions.can(detailPermission));
  const canCreateAssessment = Boolean(createPermission && permissions.can(createPermission));

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

  const assessmentMutation = useMutation({
    mutationFn: createIntegrityAssessment,
    onSuccess: async () => {
      setForm({
        programId: '', assessmentNumber: '', title: '', description: '', assessmentTypeId: '',
        methodologyId: '', assessmentDate: '', assessedByActorId: '', workflowInstanceId: '',
      });
      await queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', MODULE] });
    },
  });

  const selectedDescriptor = useMemo(
    () => resourcesQuery.data?.find((item) => item.resource === effectiveResource),
    [effectiveResource, resourcesQuery.data],
  );

  if (permissions.status !== 'ready') {
    return <Container maxWidth="xl"><Alert severity="info">Loading engineering permissions…</Alert></Container>;
  }

  if (!canRead) {
    return <Container maxWidth="xl"><Alert severity="warning">No authoritative permission is available for integrity workbench reads.</Alert></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">Integrity &amp; Maintenance</Typography>
          <Typography color="text.secondary">
            HWEB-011 integrity assessment workspace. Resources and records are discovered from HidraAPI at runtime.
          </Typography>
        </Box>

        {resourcesQuery.isError && <Alert severity="error">{errorMessage(resourcesQuery.error, 'integrity resources')}</Alert>}

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl sx={{ minWidth: 280 }} size="small">
                <InputLabel id="integrity-resource-label">Integrity resource</InputLabel>
                <Select
                  labelId="integrity-resource-label"
                  value={effectiveResource}
                  label="Integrity resource"
                  onChange={(event) => {
                    setResource(event.target.value);
                    setPage(0);
                    setSelectedId('');
                  }}
                >
                  {(resourcesQuery.data ?? []).map((item) => (
                    <MenuItem key={item.resource} value={item.resource}>{item.entityName || item.resource}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Search"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setPage(0); setSelectedId(''); }}
                helperText="Uses HidraAPI workbench text search."
              />
            </Stack>
            {selectedDescriptor && (
              <Typography variant="caption" color="text.secondary">
                Backend resource: {selectedDescriptor.resource} · ID field: {selectedDescriptor.idField}
              </Typography>
            )}
          </Stack>
        </Paper>

        {listQuery.isError && <Alert severity="error">{errorMessage(listQuery.error, 'integrity records')}</Alert>}

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Backend attributes</TableCell></TableRow></TableHead>
            <TableBody>
              {(listQuery.data?.items ?? []).map((item, index) => {
                const id = item.id === undefined || item.id === null ? '' : String(item.id);
                return (
                  <TableRow
                    hover
                    key={id || index}
                    selected={Boolean(id && id === selectedId)}
                    onClick={() => id && setSelectedId(id)}
                    sx={{ cursor: id ? 'pointer' : 'default' }}
                  >
                    <TableCell>{id || '—'}</TableCell>
                    <TableCell>{JSON.stringify(item.attributes)}</TableCell>
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
          <>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Selected record</Typography>
              {detailQuery.isError ? (
                <Alert severity="error">{errorMessage(detailQuery.error, 'integrity record')}</Alert>
              ) : (
                <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto', m: 0 }}>
                  {detailQuery.data ? JSON.stringify(detailQuery.data.attributes, null, 2) : 'Loading…'}
                </Box>
              )}
            </Paper>
            {renderSelectedContext?.(detailQuery.data?.attributes)}
          </>
        )}

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Create integrity assessment</Typography>
            {!createPermission && <Alert severity="warning">HidraAPI did not publish a route permission for assessment creation.</Alert>}
            {createPermission && !canCreateAssessment && <Alert severity="info">Your effective grants do not permit assessment creation.</Alert>}
            {assessmentMutation.isError && <Alert severity="error">{errorMessage(assessmentMutation.error, 'integrity assessment')}</Alert>}
            {assessmentMutation.isSuccess && <Alert severity="success">Assessment created. Integrity reads were invalidated for refresh.</Alert>}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {Object.entries(form).map(([field, value]) => (
                <TextField
                  key={field}
                  size="small"
                  label={field}
                  type={field === 'assessmentDate' ? 'datetime-local' : 'text'}
                  value={value}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                  slotProps={field === 'assessmentDate' ? { inputLabel: { shrink: true } } : undefined}
                />
              ))}
            </Stack>
            <Button
              variant="contained"
              disabled={!canCreateAssessment || assessmentMutation.isPending}
              onClick={() => assessmentMutation.mutate({
                programId: clean(form.programId),
                assessmentNumber: clean(form.assessmentNumber),
                title: clean(form.title),
                description: clean(form.description),
                assessmentTypeId: clean(form.assessmentTypeId),
                methodologyId: clean(form.methodologyId),
                assessmentDate: form.assessmentDate ? new Date(form.assessmentDate).toISOString() : undefined,
                assessedByActorId: clean(form.assessedByActorId),
                workflowInstanceId: clean(form.workflowInstanceId),
              })}
            >
              Create assessment
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
