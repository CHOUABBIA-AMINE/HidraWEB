import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchRecord,
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  workbenchQueryKeys,
  type WorkbenchRecord,
  type WorkbenchResourceDescriptor,
} from '@/features/workbench/api/workbenchApi';

const MODULE = 'risk';
const PAGE_SIZE = 25;
const WORKBENCH_LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';
const WORKBENCH_DETAIL_ROUTE = '/api/v1/workbench/{module}/{resource}/{id}';

type RouteMethod = 'GET';

type ViewDefinition = {
  label: string;
  javaTypeSuffix: string;
  columns: Array<{ key: string; label: string }>;
};

const VIEWS: ViewDefinition[] = [
  {
    label: 'Risk registers',
    javaTypeSuffix: 'RiskRegisterJpaEntity',
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'nameFr', label: 'Name' },
      { key: 'registerTypeId', label: 'Register type' },
      { key: 'scopeType', label: 'Scope type' },
      { key: 'scopeId', label: 'Scope ID' },
      { key: 'status', label: 'Status' },
    ],
  },
  {
    label: 'Risk assessments',
    javaTypeSuffix: 'RiskAssessmentJpaEntity',
    columns: [
      { key: 'assessmentNumber', label: 'Assessment' },
      { key: 'title', label: 'Title' },
      { key: 'riskRegisterId', label: 'Register ID' },
      { key: 'inherentScore', label: 'Inherent score' },
      { key: 'residualScore', label: 'Residual score' },
      { key: 'status', label: 'Status' },
    ],
  },
];

function permissionForRoute(
  routes: ReturnType<typeof usePermissions>['routes'],
  route: string,
  method: RouteMethod,
): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes(method))?.permission;
}

function text(value: unknown): string {
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function recordId(record: WorkbenchRecord): string {
  return record.id === undefined || record.id === null ? '' : String(record.id);
}

function errorMessage(error: unknown, label: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return `HidraAPI refused access to ${label}.`;
  return normalized.message || `${label} could not be loaded.`;
}

function RiskResourceView({
  definition,
  resource,
  canRead,
}: {
  definition: ViewDefinition;
  resource: WorkbenchResourceDescriptor | undefined;
  canRead: boolean;
}) {
  const [selectedId, setSelectedId] = useState('');
  const listQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, resource?.resource ?? '', 0, PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: resource?.resource ?? '', page: 0, size: PAGE_SIZE }),
    enabled: canRead && Boolean(resource),
  });
  const detailQuery = useQuery({
    queryKey: workbenchQueryKeys.detail(MODULE, resource?.resource ?? '', selectedId),
    queryFn: () => fetchWorkbenchRecord(MODULE, resource?.resource ?? '', selectedId),
    enabled: canRead && Boolean(resource && selectedId),
  });

  if (!resource) {
    return <Alert severity="warning">HidraAPI did not publish the expected runtime resource for {definition.label.toLowerCase()}.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Typography color="text.secondary" variant="body2">
        Runtime resource: {resource.resource}. Status values are displayed as backend evidence only; no lifecycle action is inferred from them.
      </Typography>
      {listQuery.isPending ? <CircularProgress size={24} /> : null}
      {listQuery.isError ? <Alert severity="error">{errorMessage(listQuery.error, definition.label)}</Alert> : null}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {definition.columns.map((column) => <TableCell key={column.key}>{column.label}</TableCell>)}
              <TableCell align="right">Detail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(listQuery.data?.items ?? []).map((item, index) => {
              const id = recordId(item);
              return (
                <TableRow key={id || index}>
                  {definition.columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.key === 'status'
                        ? <Chip size="small" variant="outlined" label={text(item.attributes[column.key])} />
                        : text(item.attributes[column.key])}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <Button disabled={!id} size="small" onClick={() => setSelectedId(id)}>Open</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedId ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography component="h3" variant="h6">Risk detail</Typography>
            {detailQuery.isPending ? <CircularProgress size={20} /> : null}
            {detailQuery.isError ? <Alert severity="error">{errorMessage(detailQuery.error, 'risk detail')}</Alert> : null}
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
  );
}

export function RiskWorkspacePage() {
  const permissions = usePermissions();
  const [tab, setTab] = useState(0);

  const listPermission = permissionForRoute(permissions.routes, WORKBENCH_LIST_ROUTE, 'GET');
  const detailPermission = permissionForRoute(permissions.routes, WORKBENCH_DETAIL_ROUTE, 'GET');
  const canRead = Boolean(
    listPermission
      && detailPermission
      && permissions.can(listPermission)
      && permissions.can(detailPermission),
  );

  const resourcesQuery = useQuery({
    queryKey: workbenchQueryKeys.resources(MODULE),
    queryFn: () => fetchWorkbenchResources(MODULE),
    enabled: canRead,
  });

  const resourcesByView = useMemo(
    () => VIEWS.map((view) => resourcesQuery.data?.find((item) => item.javaType.endsWith(view.javaTypeSuffix))),
    [resourcesQuery.data],
  );

  if (permissions.status !== 'ready') {
    return <Container maxWidth="xl"><Alert severity="info">Loading risk permissions…</Alert></Container>;
  }

  if (!listPermission || !detailPermission) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning">Risk workbench route-permission metadata is unavailable. Access is denied by default.</Alert>
      </Container>
    );
  }

  if (!canRead) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning">Your current HidraAPI grants do not allow risk workbench reads.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4">Risk intelligence</Typography>
          <Typography color="text.secondary">
            HWEB-013 risk views backed by runtime workbench discovery. HidraAPI remains authoritative for risk data, authorization, and lifecycle semantics.
          </Typography>
        </Box>

        <Alert severity="info">
          This task exposes read-only risk views. The accepted generated risk mutation contract is present for deterministic typing, but HWEB-013-02 does not invent approve, activate, retire, cancel, or other lifecycle actions from status values.
        </Alert>

        {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
        {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'risk resources')}</Alert> : null}

        <Paper variant="outlined">
          <Tabs aria-label="Risk views" value={tab} onChange={(_, value: number) => setTab(value)}>
            {VIEWS.map((view) => <Tab key={view.label} label={view.label} />)}
          </Tabs>
        </Paper>

        <RiskResourceView definition={VIEWS[tab]} resource={resourcesByView[tab]} canRead={canRead} />
      </Stack>
    </Container>
  );
}
