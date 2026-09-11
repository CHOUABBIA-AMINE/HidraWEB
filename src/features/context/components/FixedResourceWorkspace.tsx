import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
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
import { WorkbenchEmptyState, WorkbenchErrorState, WorkbenchLoadingState } from '@/features/workbench/components/WorkbenchState';
import { useContextDrawer } from '@/shell/context/useContextDrawer';

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
  const drawer = useContextDrawer();
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_SIZE);

  const resourcesQuery = useQuery({
    queryKey: workbenchQueryKeys.resources(module),
    queryFn: () => fetchWorkbenchResources(module),
    enabled: permissions.can(WORKBENCH_PERMISSIONS.resourcesRead),
  });
  const descriptor = resourcesQuery.data?.find((item) => item.resource === resource);
  const recordsEnabled = Boolean(descriptor && permissions.can(WORKBENCH_PERMISSIONS.listRead));
  const recordsQuery = useQuery({
    queryKey: workbenchQueryKeys.list(module, resource, page, size, query),
    queryFn: () => fetchWorkbenchRecords({ module, resource, page, size, query }),
    enabled: recordsEnabled,
  });

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography component="h2" variant="h6">{title}</Typography>
        {description ? <Typography color="text.secondary" variant="body2">{description}</Typography> : null}
      </Box>

      {!permissions.can(WORKBENCH_PERMISSIONS.resourcesRead) ? (
        <Alert severity="warning">{t('context.workbenchCapabilityUnavailable')}</Alert>
      ) : null}
      {resourcesQuery.isLoading ? <WorkbenchLoadingState label={t('context.loadingResourceContract')} /> : null}
      {resourcesQuery.error ? (
        <WorkbenchErrorState error={resourcesQuery.error} onRetry={() => { void resourcesQuery.refetch(); }} />
      ) : null}
      {resourcesQuery.data && !descriptor ? (
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
                  setPage(0);
                  setQuery(queryInput.trim());
                }
              }}
              size="small"
              value={queryInput}
            />
            <Button
              onClick={() => { setPage(0); setQuery(queryInput.trim()); }}
              variant="outlined"
            >
              {t('context.search')}
            </Button>
          </Box>
        </Paper>
      ) : null}

      {descriptor && !permissions.can(WORKBENCH_PERMISSIONS.listRead) ? (
        <Alert severity="warning">{t('context.workbenchCapabilityUnavailable')}</Alert>
      ) : null}
      {recordsQuery.isLoading ? <WorkbenchLoadingState label={t('context.loadingRecords')} /> : null}
      {recordsQuery.error ? (
        <WorkbenchErrorState error={recordsQuery.error} onRetry={() => { void recordsQuery.refetch(); }} />
      ) : null}
      {recordsQuery.data && recordsQuery.data.items.length === 0 ? (
        <WorkbenchEmptyState message={t('context.emptyRecords')} />
      ) : null}
      {descriptor && recordsQuery.data && recordsQuery.data.items.length > 0 ? (
        <WorkbenchDataGrid
          descriptor={descriptor}
          detailEnabled={permissions.can(WORKBENCH_PERMISSIONS.detailRead)}
          onInspect={(record) => {
            if (record.id === null || record.id === undefined) return;
            const id = String(record.id);
            drawer.openDrawer({
              title: `${record.resource} · ${id}`,
              content: <WorkbenchDetailPanel id={id} module={record.module} resource={record.resource} />,
            });
          }}
          onPageChange={setPage}
          onPageSizeChange={(nextSize) => { setSize(nextSize); setPage(0); }}
          page={recordsQuery.data}
        />
      ) : null}
    </Box>
  );
}
