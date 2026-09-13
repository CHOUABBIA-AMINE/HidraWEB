import { Alert, Box, CircularProgress, Container, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import { fetchWorkbenchRecords, fetchWorkbenchResources, workbenchQueryKeys, type WorkbenchRecord } from '@/features/workbench/api/workbenchApi';

const MODULE = 'notification';
const PAGE_SIZE = 50;
const LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';

function permissionForRoute(routes: ReturnType<typeof usePermissions>['routes']) {
  return routes.find((item) => item.route === LIST_ROUTE && item.methods.includes('GET'))?.permission;
}

function errorMessage(error: unknown) {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403 ? 'HidraAPI refused this notification evidence read.' : normalized.message || 'Notification evidence could not be loaded.';
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

export function NotificationCenterPage() {
  const permissions = usePermissions();
  const readPermission = permissionForRoute(permissions.routes);
  const canRead = Boolean(readPermission && permissions.can(readPermission));

  const resourcesQuery = useQuery({ queryKey: workbenchQueryKeys.resources(MODULE), queryFn: () => fetchWorkbenchResources(MODULE), enabled: canRead });
  const resources = useMemo(() => resourcesQuery.data ?? [], [resourcesQuery.data]);
  const requestResource = useMemo(() => resources.find((r) => r.javaType.endsWith('NotificationRequestJpaEntity')), [resources]);
  const messageResource = useMemo(() => resources.find((r) => r.javaType.endsWith('NotificationMessageJpaEntity')), [resources]);
  const deliveryAttemptResource = useMemo(() => resources.find((r) => r.javaType.endsWith('NotificationDeliveryAttemptJpaEntity')), [resources]);

  const requestQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, requestResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: requestResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(requestResource) });
  const messageQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, messageResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: messageResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(messageResource) });
  const deliveryAttemptQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, deliveryAttemptResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: deliveryAttemptResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(deliveryAttemptResource) });

  if (permissions.status !== 'ready') return <Container maxWidth="xl"><Alert severity="info">Loading notification permissions…</Alert></Container>;
  if (!readPermission) return <Container maxWidth="xl"><Alert severity="warning">Notification workbench route-permission metadata is unavailable. Evidence reads are denied by default.</Alert></Container>;
  if (!canRead) return <Container maxWidth="xl"><Alert severity="warning">Your current HidraAPI grants do not allow notification evidence reads.</Alert></Container>;

  const missing = [requestResource, messageResource, deliveryAttemptResource].filter((descriptor) => !descriptor).length;
  const firstError = [requestQuery, messageQuery, deliveryAttemptQuery].find((query) => query.isError)?.error;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}><Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">Notification center</Typography>
        <Typography color="text.secondary">HWEB-014-05 notification request, message, and delivery-attempt evidence from runtime workbench resources.</Typography>
      </Box>
      <Alert severity="info">This center is evidence-only. HidraAPI publishes no read/unread, archive, dismiss, delete, resend, retry, preference, or realtime notification-center contract, so no such behavior is exposed here.</Alert>
      {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
      {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error)}</Alert> : null}
      {firstError ? <Alert severity="error">{errorMessage(firstError)}</Alert> : null}
      {missing ? <Alert severity="warning">One or more notification evidence resources are not published by runtime workbench discovery.</Alert> : null}
      {requestResource ? <EvidenceTable title={`Requests — ${requestResource.resource}`} items={requestQuery.data?.items ?? []} /> : null}
      {messageResource ? <EvidenceTable title={`Messages — ${messageResource.resource}`} items={messageQuery.data?.items ?? []} /> : null}
      {deliveryAttemptResource ? <EvidenceTable title={`Delivery attempts — ${deliveryAttemptResource.resource}`} items={deliveryAttemptQuery.data?.items ?? []} /> : null}
    </Stack></Container>
  );
}
