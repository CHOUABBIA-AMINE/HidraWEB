import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/app/auth/useAuth';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  workbenchQueryKeys,
} from '@/features/workbench/api/workbenchApi';
import { WORKBENCH_PERMISSIONS } from '@/features/workbench/api/workbenchPermissions';
import { WorkbenchDataGrid } from '@/features/workbench/components/WorkbenchDataGrid';
import { WorkbenchDetailPanel } from '@/features/workbench/components/WorkbenchDetailPanel';
import { WorkbenchErrorState, WorkbenchLoadingState } from '@/features/workbench/components/WorkbenchState';
import { useContextDrawer } from '@/shell/context/useContextDrawer';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { authorizedRegisterState } from '@/shell/register/authorizedRegisterState';

interface FixedResourceWorkspaceProps {
  module: 'identity' | 'organization';
  resource: string;
  title: string;
  description?: string;
}

const DEFAULT_SIZE = 50;

export function FixedResourceWorkspace({ module, resource, title, description }: FixedResourceWorkspaceProps) {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const auth = useAuth();
  const scope = useShellUiStore(state => state.operationalContext);
  const principalId = auth.status === 'authenticated' ? auth.session?.principal?.userId : undefined;
  const ownerKey = JSON.stringify([principalId ?? null, scope?.companyPartyId ?? null,
    scope?.scopeId ?? null, scope?.principalId ?? null, [...permissions.permissions].sort()]);
  const resourcesAllowed = permissions.status === 'ready' && Boolean(principalId)
    && permissions.can(WORKBENCH_PERMISSIONS.resourcesRead);
  const drawer = useContextDrawer();
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_SIZE);

  const resourcesQuery = useQuery({
    queryKey: ['owner-workbench', ownerKey, ...workbenchQueryKeys.resources(module)],
    queryFn: () => fetchWorkbenchResources(module),
    enabled: resourcesAllowed, retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: true,
  });
  // A stale resource descriptor is not a permission or a usable owner contract.
  const descriptor = resourcesAllowed && resourcesQuery.isSuccess && !resourcesQuery.isFetching
    ? resourcesQuery.data?.find(item => item.module === module && item.resource === resource)
    : undefined;
  const recordsEnabled = Boolean(descriptor && permissions.can(WORKBENCH_PERMISSIONS.listRead));
  const recordsQuery = useQuery({
    queryKey: ['owner-workbench', ownerKey, ...workbenchQueryKeys.list(module, resource, page, size, query)],
    queryFn: () => fetchWorkbenchRecords({ module, resource, page, size, query }),
    enabled: recordsEnabled, retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: true,
  });
  const registerState = authorizedRegisterState(recordsEnabled, recordsQuery, { page, size }, {
    loading: t('context.loadingRecords'),
    empty: t('context.emptyRecords'),
    denied: t('context.workbenchCapabilityUnavailable'),
    failed: t('workbench.errors.generic'),
  });

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography component="h2" variant="h6">{title}</Typography>
        {description ? <Typography color="text.secondary" variant="body2">{description}</Typography> : null}
      </Box>

      {!resourcesAllowed ? (
        <Alert severity="warning">{t('context.workbenchCapabilityUnavailable')}</Alert>
      ) : null}
      {resourcesAllowed && (resourcesQuery.isPending || resourcesQuery.isFetching)
        ? <WorkbenchLoadingState label={t('context.loadingResourceContract')} /> : null}
      {resourcesAllowed && resourcesQuery.error ? (
        <WorkbenchErrorState error={resourcesQuery.error} onRetry={() => { void resourcesQuery.refetch(); }} />
      ) : null}
      {resourcesAllowed && resourcesQuery.isSuccess && !resourcesQuery.isFetching && !descriptor ? (
        <Alert severity="warning">{t('context.resourceUnavailable', { module, resource })}</Alert>
      ) : null}

      {descriptor ? (
        <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
            <TextField
              fullWidth
              label={t('context.search')}
              onChange={(event) => setQueryInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  drawer.closeDrawer();
                  setPage(0);
                  setQuery(queryInput.trim());
                }
              }}
              size="small"
              value={queryInput}
            />
            <Button
              onClick={() => { drawer.closeDrawer(); setPage(0); setQuery(queryInput.trim()); }}
              variant="outlined"
            >
              {t('context.search')}
            </Button>
          </Box>
        </Paper>
      ) : null}

      {descriptor ? (
        <WorkbenchDataGrid
          descriptor={descriptor}
          state={registerState}
          detailEnabled={permissions.can(WORKBENCH_PERMISSIONS.detailRead) && registerState.kind === 'ready'}
          onInspect={(record) => {
            if (!recordsEnabled || registerState.kind !== 'ready'
              || !permissions.can(WORKBENCH_PERMISSIONS.detailRead)
              || !recordsQuery.isSuccess || recordsQuery.isFetching
              || record.module !== module || record.resource !== resource
              || record.id === null || record.id === undefined) return;
            const id = String(record.id);
            drawer.openDrawer({
              title: `${record.resource} · ${id}`,
              content: <WorkbenchDetailPanel key={`${module}/${resource}/${id}`} id={id} module={module} resource={resource} />,
            });
          }}
          onPageChange={(nextPage) => { drawer.closeDrawer(); setPage(nextPage); }}
          onPageSizeChange={(nextSize) => { drawer.closeDrawer(); setSize(nextSize); setPage(0); }}
        />
      ) : null}
    </Box>
  );
}
