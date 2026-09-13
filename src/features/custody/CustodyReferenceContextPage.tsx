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
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
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
const WORKBENCH_LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';
const WORKBENCH_DETAIL_ROUTE = '/api/v1/workbench/{module}/{resource}/{id}';

type RouteMethod = 'GET';
type WorkbenchResource = Awaited<ReturnType<typeof fetchWorkbenchResources>>[number];

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

function errorMessage(error: unknown, resource: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return `HidraAPI refused access to ${resource}.`;
  return normalized.message || `${resource} could not be loaded.`;
}

function useRecords(resource: WorkbenchResource | undefined, canRead: boolean) {
  return useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, resource?.resource ?? '', 0, PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({
      module: MODULE,
      resource: resource?.resource ?? '',
      page: 0,
      size: PAGE_SIZE,
    }),
    enabled: canRead && Boolean(resource),
  });
}

function DetailPanel({
  title,
  resource,
  selectedId,
  canRead,
  onClose,
}: {
  title: string;
  resource: WorkbenchResource | undefined;
  selectedId: string;
  canRead: boolean;
  onClose: () => void;
}) {
  const detailQuery = useQuery({
    queryKey: workbenchQueryKeys.detail(MODULE, resource?.resource ?? '', selectedId),
    queryFn: () => fetchWorkbenchRecord(MODULE, resource?.resource ?? '', selectedId),
    enabled: canRead && Boolean(resource && selectedId),
  });

  if (!selectedId) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography component="h3" variant="h6">{title}</Typography>
        {detailQuery.isPending ? <CircularProgress size={20} /> : null}
        {detailQuery.isError ? <Alert severity="error">{errorMessage(detailQuery.error, title)}</Alert> : null}
        {detailQuery.data ? (
          <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto', m: 0 }}>
            {JSON.stringify(detailQuery.data.attributes, null, 2)}
          </Box>
        ) : null}
        <Button onClick={onClose} size="small">Close detail</Button>
      </Stack>
    </Paper>
  );
}

export function CustodyReferenceContextPage() {
  const permissions = usePermissions();
  const [selectedTransferPointId, setSelectedTransferPointId] = useState('');
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('');
  const [selectedAgreementPartyId, setSelectedAgreementPartyId] = useState('');

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

  const transferPointResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyTransferPointJpaEntity'));
  const measurementResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyMeasurementSnapshotJpaEntity'));
  const agreementPartyResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('CustodyAgreementPartyJpaEntity'));

  const transferPointsQuery = useRecords(transferPointResource, canRead);
  const measurementsQuery = useRecords(measurementResource, canRead);
  const agreementPartiesQuery = useRecords(agreementPartyResource, canRead);

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
          <Typography component="h1" variant="h4">Custody reference context</Typography>
          <Typography color="text.secondary">
            HWEB-012 reference composition using custody-owned snapshots and explicit neutral identifiers only.
          </Typography>
        </Box>

        <Alert severity="info">
          Topology, telemetry, and party remain authoritative in their own modules. This view does not scan foreign collections, recompute custody acceptance, or mutate foreign-owned data.
        </Alert>

        {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'custody resources')}</Alert> : null}
        {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography component="h2" variant="h6">Topology references from custody transfer points</Typography>
              <Typography color="text.secondary" variant="body2">
                Explicit topology identifiers and custody snapshots only; no topology collection scan.
              </Typography>
            </Box>
            {!resourcesQuery.isPending && !transferPointResource ? <Alert severity="warning">HidraAPI did not publish a custody transfer-point workbench resource.</Alert> : null}
            {transferPointsQuery.isError ? <Alert severity="error">{errorMessage(transferPointsQuery.error, 'custody transfer points')}</Alert> : null}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Custody point</TableCell>
                    <TableCell>Topology type</TableCell>
                    <TableCell>Topology asset ID</TableCell>
                    <TableCell>Asset snapshot</TableCell>
                    <TableCell>Measurement location</TableCell>
                    <TableCell align="right">Detail</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(transferPointsQuery.data?.items ?? []).map((item, index) => {
                    const id = recordId(item);
                    return (
                      <TableRow key={id || index}>
                        <TableCell>{text(item.attributes.code ?? id)}</TableCell>
                        <TableCell>{text(item.attributes.topologyAssetTypeCode)}</TableCell>
                        <TableCell>{text(item.attributes.topologyAssetId)}</TableCell>
                        <TableCell>{text(item.attributes.topologyAssetNameSnapshot ?? item.attributes.topologyAssetCodeSnapshot)}</TableCell>
                        <TableCell>{text(item.attributes.measurementLocationId)}</TableCell>
                        <TableCell align="right"><Button disabled={!id} size="small" onClick={() => setSelectedTransferPointId(id)}>Open</Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>

        <DetailPanel
          title="transfer-point detail"
          resource={transferPointResource}
          selectedId={selectedTransferPointId}
          canRead={canRead}
          onClose={() => setSelectedTransferPointId('')}
        />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography component="h2" variant="h6">Telemetry references from custody measurement snapshots</Typography>
              <Typography color="text.secondary" variant="body2">
                Custody displays accepted snapshot evidence; telemetry remains owner of raw/trusted reading truth.
              </Typography>
            </Box>
            {!resourcesQuery.isPending && !measurementResource ? <Alert severity="warning">HidraAPI did not publish a custody measurement-snapshot workbench resource.</Alert> : null}
            {measurementsQuery.isError ? <Alert severity="error">{errorMessage(measurementsQuery.error, 'custody measurement snapshots')}</Alert> : null}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reading reference</TableCell>
                    <TableCell>Point reference</TableCell>
                    <TableCell>Observed</TableCell>
                    <TableCell>Standard</TableCell>
                    <TableCell>Measured at</TableCell>
                    <TableCell>Accepted</TableCell>
                    <TableCell>Quality snapshot</TableCell>
                    <TableCell align="right">Detail</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(measurementsQuery.data?.items ?? []).map((item, index) => {
                    const id = recordId(item);
                    return (
                      <TableRow key={id || index}>
                        <TableCell>{text(item.attributes.telemetryReadingReferenceId)}</TableCell>
                        <TableCell>{text(item.attributes.telemetryPointReferenceId)}</TableCell>
                        <TableCell>{text(item.attributes.observedValue)} {text(item.attributes.observedUnitId)}</TableCell>
                        <TableCell>{text(item.attributes.standardValue)} {text(item.attributes.standardUnitId)}</TableCell>
                        <TableCell>{text(item.attributes.measuredAt)}</TableCell>
                        <TableCell><Chip size="small" variant="outlined" label={text(item.attributes.acceptedForCustody)} /></TableCell>
                        <TableCell>{text(item.attributes.qualityFlagSnapshot)}</TableCell>
                        <TableCell align="right"><Button disabled={!id} size="small" onClick={() => setSelectedMeasurementId(id)}>Open</Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>

        <DetailPanel
          title="measurement-snapshot detail"
          resource={measurementResource}
          selectedId={selectedMeasurementId}
          canRead={canRead}
          onClose={() => setSelectedMeasurementId('')}
        />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography component="h2" variant="h6">Party references from custody agreement parties</Typography>
              <Typography color="text.secondary" variant="body2">
                Neutral party ID plus custody-owned code/name/role snapshots. Party master-data enrichment remains outside HWEB-012-05.
              </Typography>
            </Box>
            {!resourcesQuery.isPending && !agreementPartyResource ? <Alert severity="warning">HidraAPI did not publish a custody agreement-party workbench resource.</Alert> : null}
            {agreementPartiesQuery.isError ? <Alert severity="error">{errorMessage(agreementPartiesQuery.error, 'custody agreement parties')}</Alert> : null}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Agreement</TableCell>
                    <TableCell>Party ID</TableCell>
                    <TableCell>Code snapshot</TableCell>
                    <TableCell>Name snapshot</TableCell>
                    <TableCell>Role snapshot</TableCell>
                    <TableCell>Ownership share %</TableCell>
                    <TableCell align="right">Detail</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(agreementPartiesQuery.data?.items ?? []).map((item, index) => {
                    const id = recordId(item);
                    return (
                      <TableRow key={id || index}>
                        <TableCell>{text(item.attributes.agreementId)}</TableCell>
                        <TableCell>{text(item.attributes.partyId)}</TableCell>
                        <TableCell>{text(item.attributes.partyCodeSnapshot)}</TableCell>
                        <TableCell>{text(item.attributes.partyNameSnapshot)}</TableCell>
                        <TableCell>{text(item.attributes.partyRoleCodeSnapshot)}</TableCell>
                        <TableCell>{text(item.attributes.ownershipSharePercent)}</TableCell>
                        <TableCell align="right"><Button disabled={!id} size="small" onClick={() => setSelectedAgreementPartyId(id)}>Open</Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>

        <DetailPanel
          title="agreement-party detail"
          resource={agreementPartyResource}
          selectedId={selectedAgreementPartyId}
          canRead={canRead}
          onClose={() => setSelectedAgreementPartyId('')}
        />
      </Stack>
    </Container>
  );
}
