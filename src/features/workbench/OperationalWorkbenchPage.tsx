import { Alert, Box, Chip, Container, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { OperationalSearchRequest } from '@/api/generated/workbench/model';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchModules,
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  searchWorkbenchRecords,
  workbenchQueryKeys,
} from '@/features/workbench/api/workbenchApi';
import { WORKBENCH_PERMISSIONS } from '@/features/workbench/api/workbenchPermissions';
import { WorkbenchDataGrid } from '@/features/workbench/components/WorkbenchDataGrid';
import { WorkbenchDetailPanel } from '@/features/workbench/components/WorkbenchDetailPanel';
import { WorkbenchEmptyState, WorkbenchErrorState, WorkbenchLoadingState } from '@/features/workbench/components/WorkbenchState';
import { WorkbenchToolbar, type AdvancedSearchDraft } from '@/features/workbench/components/WorkbenchToolbar';
import { useContextDrawer } from '@/shell/context/useContextDrawer';

const DEFAULT_SIZE = 50;
const emptyAdvanced: AdvancedSearchDraft = { filterField: '', filterValue: '', sortBy: '', sortDirection: 'asc' };

export function OperationalWorkbenchPage() {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const drawer = useContextDrawer();
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [advanced, setAdvanced] = useState<AdvancedSearchDraft>(emptyAdvanced);
  const [advancedRequest, setAdvancedRequest] = useState<OperationalSearchRequest | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_SIZE);

  const modulesQuery = useQuery({
    queryKey: workbenchQueryKeys.modules,
    queryFn: fetchWorkbenchModules,
  });

  useEffect(() => {
    if (!selectedModule && modulesQuery.data?.length) {
      setSelectedModule(modulesQuery.data[0]);
    }
  }, [modulesQuery.data, selectedModule]);

  const resourcesQuery = useQuery({
    queryKey: workbenchQueryKeys.resources(selectedModule),
    queryFn: () => fetchWorkbenchResources(selectedModule),
    enabled: Boolean(selectedModule),
  });

  useEffect(() => {
    if (selectedModule && resourcesQuery.data?.length && !resourcesQuery.data.some((item) => item.resource === selectedResource)) {
      setSelectedResource(resourcesQuery.data[0].resource);
    }
  }, [resourcesQuery.data, selectedModule, selectedResource]);

  const descriptor = resourcesQuery.data?.find((item) => item.resource === selectedResource);
  const effectiveAdvancedRequest = advancedRequest
    ? { ...advancedRequest, page, size }
    : null;

  const recordsQuery = useQuery({
    queryKey: effectiveAdvancedRequest
      ? workbenchQueryKeys.search(selectedModule, selectedResource, effectiveAdvancedRequest)
      : workbenchQueryKeys.list(selectedModule, selectedResource, page, size, committedQuery),
    queryFn: () => effectiveAdvancedRequest
      ? searchWorkbenchRecords(selectedModule, selectedResource, effectiveAdvancedRequest)
      : fetchWorkbenchRecords({ module: selectedModule, resource: selectedResource, page, size, query: committedQuery }),
    enabled: Boolean(selectedModule && selectedResource),
  });

  const fieldCandidates = useMemo(() => {
    const fields = new Set<string>();
    if (descriptor) {
      fields.add(descriptor.idField);
      descriptor.searchableFields.forEach((field) => fields.add(field));
    }
    recordsQuery.data?.items.forEach((item) => Object.keys(item.attributes ?? {}).forEach((field) => fields.add(field)));
    return Array.from(fields).sort();
  }, [descriptor, recordsQuery.data]);

  const selectModule = (module: string) => {
    setSelectedModule(module);
    setSelectedResource('');
    setPage(0);
    setCommittedQuery('');
    setQueryInput('');
    setAdvanced(emptyAdvanced);
    setAdvancedRequest(null);
  };

  const selectResource = (resource: string) => {
    setSelectedResource(resource);
    setPage(0);
    setCommittedQuery('');
    setQueryInput('');
    setAdvanced(emptyAdvanced);
    setAdvancedRequest(null);
  };

  const basicSearch = () => {
    setPage(0);
    setCommittedQuery(queryInput.trim());
    setAdvancedRequest(null);
  };

  const applyAdvanced = () => {
    const filters = advanced.filterField && advanced.filterValue
      ? { [advanced.filterField]: advanced.filterValue }
      : {};
    setPage(0);
    setCommittedQuery(queryInput.trim());
    setAdvancedRequest({
      query: queryInput.trim() || undefined,
      filters,
      page: 0,
      size,
      sortBy: advanced.sortBy || undefined,
      sortDirection: advanced.sortBy ? advanced.sortDirection : undefined,
    });
  };

  const resetSearch = () => {
    setPage(0);
    setQueryInput('');
    setCommittedQuery('');
    setAdvanced(emptyAdvanced);
    setAdvancedRequest(null);
  };

  if (!permissions.can(WORKBENCH_PERMISSIONS.modulesRead)) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning">{t('workbench.capabilityUnavailable')}</Alert>
      </Container>
    );
  }

  if (modulesQuery.isLoading) {
    return <WorkbenchLoadingState label={t('workbench.loadingModules')} />;
  }
  if (modulesQuery.error) {
    return <Container maxWidth="xl" sx={{ py: 4 }}><WorkbenchErrorState error={modulesQuery.error} onRetry={() => { void modulesQuery.refetch(); }} /></Container>;
  }
  if (!modulesQuery.data?.length) {
    return <Container maxWidth="xl" sx={{ py: 4 }}><WorkbenchEmptyState message={t('workbench.emptyModules')} /></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ alignItems: { xs: 'flex-start', md: 'center' }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="overline">HWEB-003</Typography>
          <Typography component="h1" variant="h4">{t('workbench.title')}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>{t('workbench.subtitle')}</Typography>
        </Box>
        <Chip label="SECONDARY UX" variant="outlined" />
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>{t('workbench.secondaryNotice')}</Alert>

      <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
        {resourcesQuery.isLoading ? <WorkbenchLoadingState label={t('workbench.loadingResources')} /> : null}
        {resourcesQuery.error ? <WorkbenchErrorState error={resourcesQuery.error} onRetry={() => { void resourcesQuery.refetch(); }} /> : null}
        {resourcesQuery.data && resourcesQuery.data.length === 0 ? <WorkbenchEmptyState message={t('workbench.emptyResources')} /> : null}
        {resourcesQuery.data?.length ? (
          <WorkbenchToolbar
            advanced={advanced}
            fieldCandidates={fieldCandidates}
            modules={modulesQuery.data}
            onAdvancedChange={setAdvanced}
            onAdvancedSearch={applyAdvanced}
            onBasicSearch={basicSearch}
            onModuleChange={selectModule}
            onQueryChange={setQueryInput}
            onReset={resetSearch}
            onResourceChange={selectResource}
            query={queryInput}
            resources={resourcesQuery.data}
            searchEnabled={permissions.can(WORKBENCH_PERMISSIONS.search)}
            selectedModule={selectedModule}
            selectedResource={selectedResource}
          />
        ) : null}
      </Paper>

      {descriptor ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Chip label={`${t('workbench.entityName')}: ${descriptor.entityName}`} size="small" />
          <Chip label={`${t('workbench.tableName')}: ${descriptor.tableName}`} size="small" />
          <Chip label={`${t('workbench.searchableFields')}: ${descriptor.searchableFields.join(', ') || '—'}`} size="small" />
        </Box>
      ) : null}

      <Box sx={{ mt: 2 }}>
        {recordsQuery.isLoading && selectedResource ? <WorkbenchLoadingState label={t('workbench.loadingRecords')} /> : null}
        {recordsQuery.error ? <WorkbenchErrorState error={recordsQuery.error} onRetry={() => { void recordsQuery.refetch(); }} /> : null}
        {recordsQuery.data && recordsQuery.data.items.length === 0 ? <WorkbenchEmptyState message={t('workbench.emptyRecords')} /> : null}
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

      <Typography color="text.secondary" sx={{ display: 'block', mt: 2 }} variant="caption">
        {t('workbench.generatedContract')}
      </Typography>
    </Container>
  );
}
