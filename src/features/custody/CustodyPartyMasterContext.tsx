import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import {
  fetchWorkbenchRecord,
  fetchWorkbenchResources,
  workbenchQueryKeys,
} from '@/features/workbench/api/workbenchApi';

const PARTY_MODULE = 'party';

function text(value: unknown): string {
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function errorMessage(error: unknown, resource: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return `HidraAPI refused access to ${resource}.`;
  return normalized.message || `${resource} could not be loaded.`;
}

export function CustodyPartyMasterContext({ partyId, canRead }: { partyId: string; canRead: boolean }) {
  const resourcesQuery = useQuery({
    queryKey: workbenchQueryKeys.resources(PARTY_MODULE),
    queryFn: () => fetchWorkbenchResources(PARTY_MODULE),
    enabled: canRead && Boolean(partyId),
  });

  const partyResource = resourcesQuery.data?.find((item) => item.javaType.endsWith('PartyJpaEntity'));

  const partyQuery = useQuery({
    queryKey: workbenchQueryKeys.detail(PARTY_MODULE, partyResource?.resource ?? '', partyId),
    queryFn: () => fetchWorkbenchRecord(PARTY_MODULE, partyResource?.resource ?? '', partyId),
    enabled: canRead && Boolean(partyId && partyResource),
    retry: (failureCount, error) => normalizeHidraApiError(error).status !== 403 && failureCount < 3,
  });

  if (!partyId) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography component="h4" variant="subtitle1">Party master context</Typography>
          <Typography color="text.secondary" variant="body2">
            Authoritative party detail for explicit custody party ID {partyId}. No party collection list/search is performed.
          </Typography>
        </Box>

        {resourcesQuery.isPending ? <CircularProgress size={20} /> : null}
        {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'party resource metadata')}</Alert> : null}
        {!resourcesQuery.isPending && !resourcesQuery.isError && !partyResource ? (
          <Alert severity="warning">HidraAPI did not publish an authoritative PartyJpaEntity workbench resource.</Alert>
        ) : null}

        {partyQuery.isPending && partyResource ? <CircularProgress size={20} /> : null}
        {partyQuery.isError ? <Alert severity="error">{errorMessage(partyQuery.error, 'party master')}</Alert> : null}
        {partyQuery.data ? (
          <Stack spacing={0.5}>
            <Typography variant="body2"><strong>Code:</strong> {text(partyQuery.data.attributes.code)}</Typography>
            <Typography variant="body2"><strong>Legal name:</strong> {text(partyQuery.data.attributes.legalName)}</Typography>
            <Typography variant="body2"><strong>Trade name:</strong> {text(partyQuery.data.attributes.tradeName)}</Typography>
            <Typography variant="body2"><strong>Short name:</strong> {text(partyQuery.data.attributes.shortName)}</Typography>
            <Typography variant="body2"><strong>Country:</strong> {text(partyQuery.data.attributes.countryCode)}</Typography>
            <Typography variant="body2"><strong>Status:</strong> {text(partyQuery.data.attributes.status)}</Typography>
            <Typography variant="body2"><strong>Primary role:</strong> {text(partyQuery.data.attributes.primaryRoleCodeSnapshot)}</Typography>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
