import { Alert, Box, Button, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/app/auth/useAuth';
import { fetchCurrentOperationalScopes, fetchCurrentRegionalAccess } from '@/features/context/api/identityOrganizationApi';
import { authorizedRegionalScopes, isPositiveRegionalAccess } from '@/features/context/model/operationalContextModel';
import {
  fetchScopedHseCases, fetchScopedHseCase, fetchScopedHseCapas, fetchScopedHseCapa, fetchScopedHseHistory, hseQueryKeys,
} from '@/features/incident/api/hseApi';
import { usePermissions } from '@/features/permissions/usePermissions';
import { useShellUiStore } from '@/shell/model/useShellUiStore';

const BASE = '/api/v1/hse/companies/{companyId}/facilities/{facilityId}/cases';
const SIZE = 25;
const queryPolicy = { retry: false, refetchOnMount: 'always', gcTime: 0 } as const;

function fresh<T>(query: { isSuccess: boolean; isFetchedAfterMount: boolean; isFetching: boolean; data?: T }): T | undefined {
  return query.isSuccess && query.isFetchedAfterMount && !query.isFetching ? query.data : undefined;
}

function pageValid<T extends { id?: string }>(result: { items?: T[]; total?: number; page?: number; size?: number } | undefined, page: number, predicate: (row: T) => boolean): boolean {
  return Boolean(result && Array.isArray(result.items) && result.items.every(predicate) && new Set(result.items.map(row => row.id)).size === result.items.length &&
    typeof result.total === 'number' && Number.isSafeInteger(result.total) && result.total >= result.items.length &&
    result.page === page && result.size === SIZE && result.items.length === Math.min(SIZE, Math.max(0, result.total - page * SIZE)));
}

function Fields({ value, fields }: { value: object; fields: readonly string[] }) {
  const { t } = useTranslation();
  const record = value as Record<string, unknown>;
  return <Stack spacing={0.5}>{fields.map(field => <Typography key={field}>{t('uxr29.fields.' + field)}: {typeof record[field] === 'string' || typeof record[field] === 'number' ? String(record[field]) : '—'}</Typography>)}</Stack>;
}

function Pager({ page, total, next, previous }: { page: number; total?: number; next: () => void; previous: () => void }) {
  const { t } = useTranslation();
  return <Stack direction="row" spacing={1} alignItems="center">
    <Button disabled={page === 0 || total === undefined} onClick={previous}>{t('uxr29.previous')}</Button>
    <Typography>{t('uxr29.page', { page: page + 1 })}</Typography>
    <Button disabled={total === undefined || total <= (page + 1) * SIZE} onClick={next}>{t('uxr29.next')}</Button>
  </Stack>;
}

/** Never translates a different resource kind into a facility. All protected
 * reads remain owner-scoped and are enabled only by a fresh regional receipt. */
export function ScopedHseWorkspace() {
  const auth = useAuth();
  const context = useShellUiStore(s => s.operationalContext);
  const permissions = usePermissions();
  const identity = JSON.stringify([auth.status, auth.session?.sessionId, auth.session?.principal?.userId, context,
    permissions.status, [...permissions.permissions].sort(), permissions.routes.map(r => [r.route, r.methods, r.permission])]);
  return <ScopedHseContent key={identity} identity={identity} />;
}

function ScopedHseContent({ identity }: { identity: string }) {
  const { t } = useTranslation();
  const auth = useAuth();
  const permissions = usePermissions();
  const context = useShellUiStore(s => s.operationalContext);
  const [epoch, setEpoch] = useState(0);
  const [caseEpoch, setCaseEpoch] = useState(0);
  const [capaEpoch, setCapaEpoch] = useState(0);
  const [casePage, setCasePage] = useState(0);
  const [capaPage, setCapaPage] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const [caseFilter, setCaseFilter] = useState('');
  const [appliedCaseFilter, setAppliedCaseFilter] = useState('');
  const [capaFilter, setCapaFilter] = useState('');
  const [appliedCapaFilter, setAppliedCapaFilter] = useState('');
  const [caseId, setCaseId] = useState('');
  const [capaId, setCapaId] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  const principal = auth.session?.principal?.userId;
  const facility = context?.type === 'FACILITY' && context.principalId === principal &&
    auth.status === 'authenticated' && principal && context.companyPartyId && context.targetId
    ? { companyId: context.companyPartyId, facilityId: context.targetId } : undefined;
  const scope = facility ?? { companyId: '', facilityId: '' };
  const allowed = (route: string) => {
    const code = permissions.routes.find(r => r.route === route && r.methods.includes('GET'))?.permission;
    return Boolean(code && permissions.can(code));
  };
  const readCases = allowed(BASE);
  const readRegional = allowed('/api/v1/identity/me/regional-access/scopes') && allowed('/api/v1/identity/me/regional-access/{resourceKind}/{resourceId}');
  const readCase = allowed(BASE + '/{caseId}');
  const readCapas = allowed(BASE + '/{caseId}/capas');
  const readCapa = allowed(BASE + '/{caseId}/capas/{capaId}');
  const readHistory = allowed(BASE + '/{caseId}/history');
  const regional = useQuery({
    queryKey: ['hidra', 'hse', 'uxr29-context', identity, epoch],
    queryFn: async () => {
      const [scopes, decision] = await Promise.all([
        fetchCurrentOperationalScopes(scope.companyId),
        fetchCurrentRegionalAccess('FACILITY', scope.facilityId, scope.companyId),
      ]);
      return authorizedRegionalScopes(scopes).some(s => s.id === context?.scopeId && s.type === 'FACILITY' && s.targetId === scope.facilityId)
        && isPositiveRegionalAccess(decision, scope.companyId, { type: 'FACILITY', targetId: scope.facilityId });
    },
    enabled: Boolean(facility && readCases && readRegional), ...queryPolicy,
  });
  const authorized = Boolean(facility && fresh(regional) === true);
  const caseParams = { page: casePage, size: SIZE, ...(appliedCaseFilter ? { caseNumber: appliedCaseFilter } : {}) };
  const cases = useQuery({
    queryKey: [...hseQueryKeys.scopedCases(scope, caseParams), identity, epoch],
    queryFn: ({ signal }) => fetchScopedHseCases(scope, caseParams, signal),
    enabled: authorized && readCases, ...queryPolicy,
  });
  const caseList = !unavailable && authorized && readCases ? fresh(cases) : undefined;
  const caseListValid = pageValid(caseList, casePage, row => Boolean(row.id && row.companyId === scope.companyId && row.facilityId === scope.facilityId));
  const listed = caseListValid ? caseList?.items ?? [] : [];
  const selected = readCase && listed.some(row => row.id === caseId);
  const detail = useQuery({
    queryKey: [...hseQueryKeys.scopedCase(scope, caseId), identity, epoch, caseEpoch],
    queryFn: ({ signal }) => fetchScopedHseCase(scope, caseId, signal),
    enabled: authorized && selected && Boolean(caseId), ...queryPolicy,
  });
  const currentCase = selected ? fresh(detail) : undefined;
  const validCase = Boolean(currentCase && currentCase.id === caseId && currentCase.companyId === scope.companyId && currentCase.facilityId === scope.facilityId);
  const capaParams = { page: capaPage, size: SIZE, ...(appliedCapaFilter ? { actionNumber: appliedCapaFilter } : {}) };
  const capas = useQuery({
    queryKey: [...hseQueryKeys.scopedCapas(scope, caseId, capaParams), identity, epoch, caseEpoch],
    queryFn: ({ signal }) => fetchScopedHseCapas(scope, caseId, capaParams, signal),
    enabled: authorized && validCase && readCapas, ...queryPolicy,
  });
  const capaList = validCase && readCapas ? fresh(capas) : undefined;
  const capaListValid = pageValid(capaList, capaPage, row => Boolean(row.id && row.caseId === caseId));
  const listedCapas = capaListValid ? capaList?.items ?? [] : [];
  const selectedCapa = readCapa && listedCapas.some(row => row.id === capaId);
  const capa = useQuery({
    queryKey: [...hseQueryKeys.scopedCapa(scope, caseId, capaId), identity, epoch, caseEpoch, capaEpoch],
    queryFn: ({ signal }) => fetchScopedHseCapa(scope, caseId, capaId, signal),
    enabled: authorized && validCase && selectedCapa && Boolean(capaId), ...queryPolicy,
  });
  const currentCapa = selectedCapa ? fresh(capa) : undefined;
  const validCapa = Boolean(currentCapa && currentCapa.id === capaId && currentCapa.caseId === caseId);
  const historyParams = { page: historyPage, size: SIZE };
  const history = useQuery({
    queryKey: [...hseQueryKeys.scopedHistory(scope, caseId, historyParams), identity, epoch, caseEpoch],
    queryFn: ({ signal }) => fetchScopedHseHistory(scope, caseId, historyParams, signal),
    enabled: authorized && validCase && readHistory, ...queryPolicy,
  });
  const events = validCase && readHistory ? fresh(history) : undefined;
  const historyValid = pageValid(events, historyPage, row => Boolean(row.id && row.caseId === caseId));

  const failedCase = Boolean(caseId && (regional.isError || fresh(regional) === false || cases.isError ||
    (caseList && (!caseListValid || !selected)) || detail.isError || (currentCase && !validCase) || capas.isError ||
    (capaList && !capaListValid) || history.isError || (events && !historyValid)));
  const failedCapa = Boolean(capaId && (capa.isError || (currentCapa && !validCapa) || (capaList && !selectedCapa)));
  if (failedCase) {
    setCaseId(''); setCapaId(''); setUnavailable(true);
  } else if (failedCapa) {
    setCaseId(''); setCapaId(''); setUnavailable(true);
  }

  function retireCase() {
    setCaseId(''); setCapaId(''); setCapaPage(0); setHistoryPage(0); setCapaFilter(''); setAppliedCapaFilter('');
  }
  function refresh() {
    retireCase(); setUnavailable(false); setEpoch(e => e + 1);
  }
  function openCase(id: string) {
    retireCase(); setUnavailable(false); setCaseEpoch(e => e + 1); setCaseId(id);
  }

  if (!facility || !readCases || !readRegional) return <Alert severity="warning">{t('uxr29.facilityRequired')}</Alert>;
  return <Stack spacing={2}>
    <Typography component="h2" variant="h6">{t('uxr29.scopedHse')}</Typography>
    <Button onClick={refresh}>{t('uxr29.refresh')}</Button>
    {regional.isFetching || cases.isFetching ? <CircularProgress size={24} /> : null}
    {unavailable || regional.isError || fresh(regional) === false || cases.isError || (caseList && !caseListValid) ? <Alert severity="warning">{t('ownerFeedback.denied')}</Alert> : null}
    {authorized ? <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField label={t('uxr29.caseNumber')} size="small" value={caseFilter} onChange={e => setCaseFilter(e.target.value)} />
          <Button onClick={() => { retireCase(); setCasePage(0); setAppliedCaseFilter(caseFilter.trim()); setUnavailable(false); setEpoch(e => e + 1); }}>{t('uxr29.filter')}</Button>
        </Box>
        {caseListValid ? <Typography>{t('uxr29.loaded', { count: listed.length, total: caseList?.total })}</Typography> : null}
        <TableContainer><Table size="small"><TableHead><TableRow><TableCell>{t('uxr29.caseNumber')}</TableCell><TableCell>{t('uxr29.fields.id')}</TableCell><TableCell>{t('uxr29.fields.title')}</TableCell><TableCell>{t('uxr29.fields.status')}</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>{listed.map(row => <TableRow key={row.id}><TableCell>{row.caseNumber}</TableCell><TableCell>{row.id}</TableCell><TableCell>{row.title}</TableCell><TableCell>{row.status}</TableCell><TableCell><Button disabled={!readCase || !row.id} onClick={() => openCase(row.id!)}>{t('uxr29.openCase')}</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
        <Pager page={casePage} total={caseListValid ? caseList?.total : undefined} previous={() => { retireCase(); setCasePage(p => p - 1); }} next={() => { retireCase(); setCasePage(p => p + 1); }} />
      </Stack>
    </Paper> : null}
    {validCase && currentCase && !failedCase ? <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={2}>
      <Typography component="h3" variant="h6">{t('uxr29.caseDetail')}</Typography>
      <Button onClick={retireCase}>{t('uxr29.close')}</Button>
      <Fields value={currentCase} fields={['id', 'caseNumber', 'status', 'companyId', 'facilityId', 'incidentId', 'closureId', 'createdAt', 'createdBy']} />
      {readCapas ? <>
        <Typography component="h4" variant="subtitle1">{t('uxr29.capas')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}><TextField label={t('uxr29.actionNumber')} size="small" value={capaFilter} onChange={e => setCapaFilter(e.target.value)} />
          <Button onClick={() => { setCapaId(''); setCapaPage(0); setAppliedCapaFilter(capaFilter.trim()); }}>{t('uxr29.filter')}</Button></Box>
        {capaListValid ? <Typography>{t('uxr29.loaded', { count: listedCapas.length, total: capaList?.total })}</Typography> : null}
        <TableContainer><Table size="small"><TableHead><TableRow><TableCell>{t('uxr29.actionNumber')}</TableCell><TableCell>{t('uxr29.fields.id')}</TableCell><TableCell>{t('uxr29.fields.status')}</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>{listedCapas.map(row => <TableRow key={row.id}><TableCell>{row.actionNumber}</TableCell><TableCell>{row.id}</TableCell><TableCell>{row.status}</TableCell><TableCell><Button disabled={!readCapa || !row.id} onClick={() => { setUnavailable(false); setCapaEpoch(e => e + 1); setCapaId(row.id!); }}>{t('uxr29.openCapa')}</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
        <Pager page={capaPage} total={capaListValid ? capaList?.total : undefined} previous={() => { setCapaId(''); setCapaPage(p => p - 1); }} next={() => { setCapaId(''); setCapaPage(p => p + 1); }} />
      </> : <Alert severity="info">{t('ownerFeedback.denied')}</Alert>}
      {validCapa && currentCapa && !failedCapa ? <><Typography component="h4">{t('uxr29.capaDetail')}</Typography><Fields value={currentCapa} fields={['id', 'actionNumber', 'status', 'caseId', 'ownerId', 'proposerId', 'verifierId', 'evidenceId', 'version']} /></> : null}
      {readHistory ? <>
        <Typography component="h4" variant="subtitle1">{t('uxr29.history')}</Typography>
        {historyValid ? <Typography>{t('uxr29.loaded', { count: events?.items?.length ?? 0, total: events?.total })}</Typography> : null}
        {historyValid ? events?.items?.map(event => <Paper key={event.id} variant="outlined" sx={{ p: 1 }}><Fields value={event} fields={['id', 'operation', 'beforeState', 'afterState', 'actorId', 'at', 'reason', 'referenceId', 'capaId', 'version']} /></Paper>) : null}
        <Pager page={historyPage} total={historyValid ? events?.total : undefined} previous={() => setHistoryPage(p => p - 1)} next={() => setHistoryPage(p => p + 1)} />
      </> : <Alert severity="info">{t('ownerFeedback.denied')}</Alert>}
    </Stack></Paper> : null}
  </Stack>;
}
