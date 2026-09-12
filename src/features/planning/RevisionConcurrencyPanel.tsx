import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { PlanRevisionView } from '@/api/generated/planning/model';
import { usePermissions } from '@/features/permissions/usePermissions';
import { fetchPlanRevision, planningQueryKeys, updatePlanRevision } from '@/features/planning/api/planningApi';

const REVISION_UPDATE_ROUTE = '/api/v1/planning/revisions/{revisionId}';

function optional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

export function RevisionConcurrencyPanel({ revision, currentRevisionId }: {
  revision: PlanRevisionView;
  currentRevisionId?: string;
}) {
  const { routes, can } = usePermissions();
  const queryClient = useQueryClient();
  const [changeReasonCodeId, setChangeReasonCodeId] = useState(revision.changeReasonCodeId ?? '');
  const [changeReasonText, setChangeReasonText] = useState(revision.changeReasonText ?? '');
  const [success, setSuccess] = useState('');
  const [conflict, setConflict] = useState('');

  const updatePermission = useMemo(
    () => routes.find((descriptor) => descriptor.route === REVISION_UPDATE_ROUTE && descriptor.methods.includes('PATCH'))?.permission,
    [routes],
  );
  const canUpdate = Boolean(updatePermission && can(updatePermission));
  const isCurrentRevision = Boolean(revision.id && currentRevisionId && revision.id === currentRevisionId);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!revision.id || !revision.updatedAt) {
        throw new Error('The authoritative revision concurrency token is unavailable.');
      }
      return updatePlanRevision(revision.id, {
        expectedUpdatedAt: revision.updatedAt,
        changeReasonCodeId: optional(changeReasonCodeId),
        changeReasonText: optional(changeReasonText),
      });
    },
    onSuccess: async (result) => {
      setConflict('');
      setSuccess(`Revision metadata saved. New version: ${result.updatedAt ?? 'returned by HidraAPI'}.`);
      setChangeReasonCodeId(result.changeReasonCodeId ?? '');
      setChangeReasonText(result.changeReasonText ?? '');
      if (revision.id) queryClient.setQueryData(planningQueryKeys.revision(revision.id), result);
      await queryClient.invalidateQueries({ queryKey: ['hidra', 'planning', 'revisions'] });
    },
    onError: async (error) => {
      const normalized = normalizeHidraApiError(error);
      setSuccess('');
      if (normalized.status === 409 && revision.id) {
        const refreshed = await queryClient.fetchQuery({
          queryKey: planningQueryKeys.revision(revision.id),
          queryFn: () => fetchPlanRevision(revision.id ?? ''),
        });
        setChangeReasonCodeId(refreshed.changeReasonCodeId ?? '');
        setChangeReasonText(refreshed.changeReasonText ?? '');
        setConflict('HidraAPI rejected a stale revision. The revision has been refetched; review the authoritative values before submitting again.');
      }
    },
  });

  const normalizedError = mutation.error ? normalizeHidraApiError(mutation.error) : undefined;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography color="text.secondary" variant="overline">Backend-authoritative revision concurrency</Typography>
          <Typography component="h3" variant="h6">Revision metadata update</Typography>
        </Box>
        <Typography color="text.secondary" variant="body2">
          HidraAPI explicitly defines this revision&apos;s updatedAt value as the expectedUpdatedAt precondition for this PATCH only.
        </Typography>
        {!updatePermission ? (
          <Alert severity="warning">Revision update route-permission metadata is unavailable. Mutation access is denied by default.</Alert>
        ) : !canUpdate ? (
          <Alert severity="warning">Your current HidraAPI grants do not allow revision metadata updates.</Alert>
        ) : !isCurrentRevision ? (
          <Alert severity="info">This is not the operational plan&apos;s current revision, so the published metadata mutation is unavailable.</Alert>
        ) : !revision.updatedAt ? (
          <Alert severity="warning">HidraAPI did not return the required revision updatedAt token. Mutation is disabled.</Alert>
        ) : (
          <>
            <Typography variant="body2">Authoritative version: {revision.updatedAt}</Typography>
            {conflict ? <Alert severity="warning">{conflict}</Alert> : null}
            {mutation.error && normalizedError?.status !== 409 ? <Alert severity="error">{normalizedError?.message || 'Revision metadata update failed.'}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
            <TextField label="Change reason code" size="small" value={changeReasonCodeId} onChange={(event) => setChangeReasonCodeId(event.target.value)} />
            <TextField label="Change reason" multiline rows={2} size="small" value={changeReasonText} onChange={(event) => setChangeReasonText(event.target.value)} />
            <Button disabled={mutation.isPending} onClick={() => mutation.mutate()} variant="contained">
              {mutation.isPending ? 'Saving…' : 'Save revision metadata'}
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
}
