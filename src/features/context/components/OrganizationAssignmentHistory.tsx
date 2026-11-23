import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchOrganizationAssignmentHistory } from '@/features/context/api/identityOrganizationApi';
import { usePermissions } from '@/features/permissions/usePermissions';
import { useShellUiStore } from '@/shell/model/useShellUiStore';

/**
 * Private appointment history: exact company coordinate is required by the
 * pinned backend endpoint, and permission metadata must publish this GET.
 */
export function OrganizationAssignmentHistory({ assignmentId }: { assignmentId: string }) {
  const permissions = usePermissions();
  const companyPartyId = useShellUiStore((state) => state.operationalContext?.companyPartyId ?? '');
  const route = permissions.routes.find((r) =>
    r.route === '/api/v1/organization/assignments/{id}/history' && r.methods.includes('GET'));
  const admitted = permissions.status === 'ready'
    && Boolean(route?.permission && permissions.can(route.permission));
  const allowed = admitted && Boolean(companyPartyId && assignmentId);
  const history = useQuery({
    queryKey: ['hidra', 'organization-admin', 'assignment-history', companyPartyId, assignmentId],
    queryFn: () => fetchOrganizationAssignmentHistory(assignmentId, companyPartyId),
    enabled: allowed,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
  return (
    <Paper component="section" aria-label="Assignment history" variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography component="h3" variant="subtitle1">Assignment history</Typography>
        {!admitted ? <Alert severity="warning">Private appointment history is unavailable or not authorized.</Alert>
          : !companyPartyId ? <Alert severity="info">Select a verified operational company context to read private appointment history.</Alert>
          : history.isError ? <Alert severity="error">Unable to read private appointment history.</Alert>
          : history.isFetching || !history.isSuccess ? <Typography role="status">Loading assignment history…</Typography>
          : history.data.entries?.length ? (
            <>
              {history.data.entries.map((event, index) => (
                <Typography key={event.eventId ?? index} variant="body2">
                  {event.kind ?? '—'} · {event.sampledAt ?? '—'} · {event.after?.status ?? event.before?.status ?? '—'}
                </Typography>
              ))}
              {history.data.hasNext ? <Alert severity="info">More history exists on HidraAPI. This view displays the first 20 events only.</Alert> : null}
            </>
          ) : <Typography>No assignment history returned.</Typography>}
        {allowed ? <Button size="small" disabled={history.isFetching}
          onClick={() => { void history.refetch(); }}>Refresh history</Button> : null}
      </Stack>
    </Paper>
  );
}
