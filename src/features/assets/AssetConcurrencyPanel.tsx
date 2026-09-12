import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { updateMaintainableAsset } from '@/features/assets/api/assetsApi';
import { usePermissions } from '@/features/permissions/usePermissions';
import { fetchWorkbenchRecord, workbenchQueryKeys } from '@/features/workbench/api/workbenchApi';

const MODULE = 'assets';
const UPDATE_ASSET_ROUTE = '/api/v1/assets/maintainable-assets/{assetId}';

function stringAttribute(attributes: Record<string, unknown> | undefined, field: string): string {
  const value = attributes?.[field];
  return typeof value === 'string' ? value : '';
}

interface AssetDraft {
  assetId: string;
  assetName: string;
  token: string;
}

export function AssetConcurrencyPanel({
  assetId,
  resource,
  attributes,
}: {
  assetId: string;
  resource: string;
  attributes?: Record<string, unknown>;
}) {
  const { routes, can } = usePermissions();
  const queryClient = useQueryClient();
  const authoritativeName = stringAttribute(attributes, 'assetName');
  const authoritativeUpdatedAt = stringAttribute(attributes, 'updatedAt');
  const [draft, setDraft] = useState<AssetDraft>({ assetId, assetName: authoritativeName, token: authoritativeUpdatedAt });
  const [success, setSuccess] = useState('');
  const [conflict, setConflict] = useState('');
  const activeDraft = draft.assetId === assetId
    ? draft
    : { assetId, assetName: authoritativeName, token: authoritativeUpdatedAt };

  const updatePermission = useMemo(
    () => routes.find((descriptor) => descriptor.route === UPDATE_ASSET_ROUTE && descriptor.methods.includes('PATCH'))?.permission,
    [routes],
  );
  const canUpdate = Boolean(updatePermission && can(updatePermission));

  const mutation = useMutation({
    mutationFn: async () => {
      const normalizedName = activeDraft.assetName.trim();
      if (!activeDraft.token) throw new Error('The authoritative maintainable-asset updatedAt token is unavailable.');
      if (!normalizedName) throw new Error('Asset name is required by the published update contract.');
      return updateMaintainableAsset(assetId, { expectedUpdatedAt: activeDraft.token, assetName: normalizedName });
    },
    onSuccess: async (result) => {
      const nextName = result.assetName ?? activeDraft.assetName.trim();
      const nextToken = result.updatedAt ?? activeDraft.token;
      setConflict('');
      setSuccess(`Maintainable asset saved. New version: ${result.updatedAt ?? 'returned by HidraAPI'}.`);
      setDraft({ assetId, assetName: nextName, token: nextToken });
      await queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', MODULE] });
    },
    onError: async (error) => {
      const normalized = normalizeHidraApiError(error);
      setSuccess('');
      if (normalized.status === 409) {
        const refreshed = await queryClient.fetchQuery({
          queryKey: workbenchQueryKeys.detail(MODULE, resource, assetId),
          queryFn: () => fetchWorkbenchRecord(MODULE, resource, assetId),
        });
        const refreshedName = stringAttribute(refreshed.attributes, 'assetName');
        const refreshedToken = stringAttribute(refreshed.attributes, 'updatedAt');
        setDraft({ assetId, assetName: refreshedName, token: refreshedToken });
        setConflict('HidraAPI rejected a stale maintainable asset. The authoritative asset has been refetched; review the current name before submitting again.');
      }
    },
  });

  const normalizedError = mutation.error ? normalizeHidraApiError(mutation.error) : undefined;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography color="text.secondary" variant="overline">Backend-authoritative asset concurrency</Typography>
        <Typography component="h3" variant="h6">Maintainable asset name update</Typography>
        <Typography color="text.secondary" variant="body2">
          HidraAPI explicitly defines this maintainable asset&apos;s updatedAt value as the expectedUpdatedAt precondition for this PATCH only.
        </Typography>
        {!updatePermission ? (
          <Alert severity="warning">Maintainable-asset update route-permission metadata is unavailable. Mutation access is denied by default.</Alert>
        ) : !canUpdate ? (
          <Alert severity="warning">Your current HidraAPI grants do not allow maintainable-asset updates.</Alert>
        ) : !activeDraft.token ? (
          <Alert severity="warning">HidraAPI did not return the required maintainable-asset updatedAt token. Mutation is disabled.</Alert>
        ) : (
          <>
            <Typography variant="body2">Authoritative version: {activeDraft.token}</Typography>
            {conflict ? <Alert severity="warning">{conflict}</Alert> : null}
            {mutation.error && normalizedError?.status !== 409 ? (
              <Alert severity="error">{normalizedError?.message || 'Maintainable asset update failed.'}</Alert>
            ) : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
            <TextField
              label="Asset name"
              size="small"
              value={activeDraft.assetName}
              onChange={(event) => setDraft({ assetId, assetName: event.target.value, token: activeDraft.token })}
            />
            <Button disabled={mutation.isPending || !activeDraft.assetName.trim()} onClick={() => mutation.mutate()} variant="contained">
              {mutation.isPending ? 'Saving…' : 'Save asset name'}
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
}
