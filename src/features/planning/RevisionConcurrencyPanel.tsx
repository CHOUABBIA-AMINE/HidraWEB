import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { PlanRevisionView } from '@/api/generated/planning/model';
import { usePermissions } from '@/features/permissions/usePermissions';
import { fetchPlanRevision, updatePlanRevision } from '@/features/planning/api/planningApi';

const REVISION_UPDATE_ROUTE = '/api/v1/planning/revisions/{revisionId}';

function optional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

export function RevisionConcurrencyPanel({ revision, currentRevisionId, revisionKeys = [], onUnavailable }: {
  revision: PlanRevisionView;
  currentRevisionId?: string;
  revisionKeys?: readonly (readonly unknown[])[];
  onUnavailable?: () => void;
}) {
  const { routes, can } = usePermissions();
  const queryClient = useQueryClient();
  const [changeReasonCodeId, setChangeReasonCodeId] = useState(revision.changeReasonCodeId ?? '');
  const [changeReasonText, setChangeReasonText] = useState(revision.changeReasonText ?? '');
  const [success, setSuccess] = useState('');
  const [conflict, setConflict] = useState('');
  const [retired, setRetired] = useState(false);
  const [snapshot, setSnapshot] = useState(revision);
  const [lastRevision, setLastRevision] = useState(revision);
  const lock = useRef(false);
  const active = useRef(false);
  const reads = useRef<AbortController | undefined>(undefined);
  useEffect(() => { active.current = true; return () => { active.current = false; reads.current?.abort(); }; }, []);

  const updatePermission = useMemo(
    () => routes.find((descriptor) => descriptor.route === REVISION_UPDATE_ROUTE && descriptor.methods.includes('PATCH'))?.permission,
    [routes],
  );
  const canUpdate = Boolean(updatePermission && can(updatePermission));
  const isCurrentRevision = Boolean(revision.id && currentRevisionId && revision.id === currentRevisionId);

  if (revision !== lastRevision) {
    setLastRevision(revision);
    if (revision.updatedAt !== snapshot.updatedAt) {
      setSnapshot(revision);
      setChangeReasonCodeId(revision.changeReasonCodeId ?? '');
      setChangeReasonText(revision.changeReasonText ?? '');
      setRetired(false); setSuccess(''); setConflict('');
    }
  }
  const mutation = useMutation({
    retry: false,
    mutationFn: async () => {
      if (!canUpdate || !isCurrentRevision || retired || !snapshot.id || snapshot.status !== 'DRAFT' || !snapshot.updatedAt) {
        throw new Error('The authoritative revision concurrency token is unavailable.');
      }
      const controller = new AbortController(); reads.current = controller;
      if (!active.current) throw new Error('Selection retired');
      const result = await updatePlanRevision(snapshot.id, {
        expectedUpdatedAt: snapshot.updatedAt,
        changeReasonCodeId: optional(changeReasonCodeId),
        changeReasonText: optional(changeReasonText),
      });
      if (!active.current) throw new Error('Selection retired');
      const persisted = await fetchPlanRevision(snapshot.id, controller.signal);
      if (persisted.id !== snapshot.id || persisted.updatedAt !== result.updatedAt || !persisted.updatedAt || persisted.changeReasonText !== result.changeReasonText || persisted.changeReasonCodeId !== result.changeReasonCodeId) throw new Error('Readback unavailable');
      return persisted;
    },
    onSuccess: result => {
      if (!active.current) return;
      setRetired(true); setConflict('');
      setSnapshot(result);
      setSuccess(`Revision metadata saved. New version: ${result.updatedAt}.`);
      setChangeReasonCodeId(result.changeReasonCodeId ?? '');
      setChangeReasonText(result.changeReasonText ?? '');
      for (const key of revisionKeys) queryClient.setQueryData(key, result);
    },
    onError: async error => {
      if (!active.current) return;
      setSuccess(''); setRetired(true); setChangeReasonCodeId(''); setChangeReasonText('');
      const normalized = normalizeHidraApiError(error);
      if (normalized.status === 409) {
        setConflict('HidraAPI rejected a stale revision. The revision has been refetched; review the authoritative values before submitting again.');
        try {
          const refreshed = await fetchPlanRevision(snapshot.id ?? '', reads.current?.signal);
          if (refreshed.id !== revision.id || !refreshed.updatedAt) throw new Error('Unavailable');
          if (!active.current) return;
          setSnapshot(refreshed); setChangeReasonCodeId(refreshed.changeReasonCodeId ?? '');
          setChangeReasonText(refreshed.changeReasonText ?? '');
          for (const key of revisionKeys) queryClient.setQueryData(key, refreshed);
          setRetired(false);
        } catch {
          setConflict(''); setRetired(true);
          if (active.current) onUnavailable?.();
        }
      } else onUnavailable?.();
    },
    onSettled: () => { lock.current = false; },
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
        ) : snapshot.status !== 'DRAFT' ? (
          <Alert severity="info">Only the current DRAFT revision permits metadata updates.</Alert>
        ) : !snapshot.updatedAt ? (
          <Alert severity="warning">HidraAPI did not return the required revision updatedAt token. Mutation is disabled.</Alert>
        ) : (
          <>
            <Typography variant="body2">Authoritative version: {snapshot.updatedAt}</Typography>
            {conflict ? <Alert severity="warning">{conflict}</Alert> : null}
            {mutation.error && normalizedError?.status !== 409 ? <Alert severity="error">Revision metadata update or readback unavailable. Refresh before another action.</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
            <TextField label="Change reason code" size="small" value={changeReasonCodeId} onChange={(event) => setChangeReasonCodeId(event.target.value)} />
            <TextField label="Change reason" multiline rows={2} size="small" value={changeReasonText} onChange={(event) => setChangeReasonText(event.target.value)} />
            <Button disabled={mutation.isPending || retired} onClick={() => { if (lock.current) return; lock.current = true; mutation.mutate(); }} variant="contained">
              {mutation.isPending ? 'Saving…' : 'Save revision metadata'}
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
}
