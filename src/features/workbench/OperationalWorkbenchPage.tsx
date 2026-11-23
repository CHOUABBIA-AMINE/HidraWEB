import { Alert, Box, Chip, Container, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/app/auth/useAuth';
import { useMemo, useState } from 'react';
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
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { authorizedRegisterState } from '@/shell/register/authorizedRegisterState';

const DEFAULT_SIZE = 50;
const emptyAdvanced: AdvancedSearchDraft = { filterField: '', filterValue: '', sortBy: '', sortDirection: 'asc' };

export function OperationalWorkbenchPage() {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const auth = useAuth();
  const scope = useShellUiStore(state => state.operationalContext);
  const principalId = auth.status === 'authenticated' ? auth.session?.principal?.userId : undefined;
  // In-memory request identity, not an authorization token or backend query parameter.
  const viewerKey = JSON.stringify([principalId ?? null, scope?.companyPartyId ?? null,
    scope?.scopeId ?? null, scope?.principalId ?? null, [...permissions.permissions].sort()]);
  const canModules = permissions.status === 'ready' && Boolean(principalId)
    && permissions.can(WORKBENCH_PERMISSIONS.modulesRead);
  const canResources = canModules && permissions.can(WORKBENCH_PERMISSIONS.resourcesRead);
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
    queryKey: ['owner-workbench', viewerKey, ...workbenchQueryKeys.modules],
    queryFn: fetchWorkbenchModules,
    enabled: canModules, retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: true,
  });

  const admittedModules = canModules && modulesQuery.isSuccess && !modulesQuery.isFetching
    ? modulesQuery.data ?? [] : [];
  const effectiveModule = selectedModule && admittedModules.includes(selectedModule)
    ? selectedModule
    : admittedModules[0] ?? '';

  const resourcesQuery = useQuery({
    queryKey: ['owner-workbench', viewerKey, ...workbenchQueryKeys.resources(effectiveModule)],
    queryFn: () => fetchWorkbenchResources(effectiveModule),
    enabled: canResources && Boolean(effectiveModule),
    retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: true,
  });

  const admittedResources = canResources && resourcesQuery.isSuccess && !resourcesQuery.isFetching
    ? resourcesQuery.data ?? [] : [];
  const effectiveResource = selectedResource && admittedResources.some(item => item.resource === selectedResource)
    ? selectedResource : admittedResources[0]?.resource ?? '';
  const descriptor = admittedResources.find(item => item.resource === effectiveResource);
  const effectiveAdvancedRequest = advancedRequest ? { ...advancedRequest, page, size } : null;
  const recordsEnabled = Boolean(
    canResources && descriptor
    && effectiveModule && effectiveResource
    && permissions.can(effectiveAdvancedRequest ? WORKBENCH_PERMISSIONS.search : WORKBENCH_PERMISSIONS.listRead),
  );

  const recordsQuery = useQuery({
    queryKey: ['owner-workbench', viewerKey, ...(effectiveAdvancedRequest
      ? workbenchQueryKeys.search(effectiveModule, effectiveResource, effectiveAdvancedRequest)
      : workbenchQueryKeys.list(effectiveModule, effectiveResource, page, size, committedQuery))],
    queryFn: () => effectiveAdvancedRequest
      ? searchWorkbenchRecords(effectiveModule, effectiveResource, effectiveAdvancedRequest)
      : fetchWorkbenchRecords({ module: effectiveModule, resource: effectiveResource, page, size, query: committedQuery }),
    enabled: recordsEnabled,
    retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: true,
  });

  const fieldCandidates = useMemo(() => {
    if (!descriptor) return [];
    // Only backend-published searchable fields; never derive allowed filters from row data.
    return [...new Set([descriptor.idField, ...descriptor.searchableFields])].sort();
  }, [descriptor]);
  const registerState = authorizedRegisterState(recordsEnabled, recordsQuery, { page, size }, {
    loading: t('workbench.loadingRecords'),
    empty: t('workbench.emptyRecords'),
    denied: t('workbench.capabilityUnavailable'),
    failed: t('workbench.errors.generic'),
  });

  const selectModule = (module: string) => {
    drawer.closeDrawer();
    setSelectedModule(module);
    setSelectedResource('');
    setPage(0);
    setCommittedQuery('');
    setQueryInput('');
    setAdvanced(emptyAdvanced);
    setAdvancedRequest(null);
  };

  const selectResource = (resource: string) => {
    drawer.closeDrawer();
    setSelectedResource(resource);
    setPage(0);
    setCommittedQuery('');
    setQueryInput('');
    setAdvanced(emptyAdvanced);
    setAdvancedRequest(null);
  };

  const basicSearch = () => {
    drawer.closeDrawer();
    setPage(0);
    setCommittedQuery(queryInput.trim());
    setAdvancedRequest(null);
  };

  const applyAdvanced = () => {
    if (!descriptor || !permissions.can(WORKBENCH_PERMISSIONS.search) ||
      (advanced.filterField && !fieldCandidates.includes(advanced.filterField)) ||
      (advanced.sortBy && !fieldCandidates.includes(advanced.sortBy))) return;
    drawer.closeDrawer();
    const filters = advanced.filterField && advanced.filterValue.trim()
      ? { [advanced.filterField]: advanced.filterValue.trim() }
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
    drawer.closeDrawer();
    setPage(0);
    setQueryInput('');
    setCommittedQuery('');
    setAdvanced(emptyAdvanced);
    setAdvancedRequest(null);
  };

  if (!canModules) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning">{t('workbench.capabilityUnavailable')}</Alert>
      </Container>
    );
  }

  if (modulesQuery.isPending || modulesQuery.isFetching) {
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
        {!canResources ? <Alert severity="warning">{t('workbench.capabilityUnavailable')}</Alert> : null}
        {canResources && (resourcesQuery.isPending || resourcesQuery.isFetching) ? <WorkbenchLoadingState label={t('workbench.loadingResources')} /> : null}
        {canResources && resourcesQuery.error ? <WorkbenchErrorState error={resourcesQuery.error} onRetry={() => { void resourcesQuery.refetch(); }} /> : null}
        {canResources && resourcesQuery.isSuccess && !resourcesQuery.isFetching && admittedResources.length === 0 ? <WorkbenchEmptyState message={t('workbench.emptyResources')} /> : null}
        {admittedResources.length > 0 ? (
          <WorkbenchToolbar
            advanced={advanced}
            fieldCandidates={fieldCandidates}
            modules={admittedModules}
            onAdvancedChange={setAdvanced}
            onAdvancedSearch={applyAdvanced}
            onBasicSearch={basicSearch}
            onModuleChange={selectModule}
            onQueryChange={setQueryInput}
            onReset={resetSearch}
            onResourceChange={selectResource}
            query={queryInput}
            resources={admittedResources}
            searchEnabled={canResources && permissions.can(WORKBENCH_PERMISSIONS.search)}
            selectedModule={effectiveModule}
            selectedResource={effectiveResource}
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
        {descriptor ? (
          <WorkbenchDataGrid
            descriptor={descriptor}
            state={registerState}
            detailEnabled={permissions.can(WORKBENCH_PERMISSIONS.detailRead) && recordsEnabled &&
              registerState.kind === 'ready'}
            onInspect={(record) => {
              if (!recordsEnabled || !permissions.can(WORKBENCH_PERMISSIONS.detailRead)
                || recordsQuery.isFetching || !recordsQuery.isSuccess
                || record.module !== effectiveModule || record.resource !== effectiveResource
                || record.id === null || record.id === undefined) return;
              const id = String(record.id);
              drawer.openDrawer({
                title: `${record.resource} · ${id}`,
                content: <WorkbenchDetailPanel key={`${record.module}/${record.resource}/${id}`} id={id} module={record.module} resource={record.resource} />,
              });
            }}
            onPageChange={(nextPage) => { drawer.closeDrawer(); setPage(nextPage); }}
            onPageSizeChange={(nextSize) => { drawer.closeDrawer(); setSize(nextSize); setPage(0); }}
          />
        ) : null}
      </Box>

      <Typography color="text.secondary" sx={{ display: 'block', mt: 2 }} variant="caption">
        {t('workbench.generatedContract')}
      </Typography>
    </Container>
  );
}
