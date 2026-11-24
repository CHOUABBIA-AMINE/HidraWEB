import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type { PrincipalView } from '@/api/generated/identity-organization/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { useAuth } from '@/app/auth/useAuth';
import { fetchCurrentRegionalAccess, fetchCurrentOperationalScopes } from '@/features/context/api/identityOrganizationApi';
import { authorizedRegionalScopes, isPositiveRegionalAccess, supportsRegionalAccess } from '@/features/context/model/operationalContextModel';
import { fetchEffectivePermissions } from '@/features/permissions/api/permissionApi';
import { useShellUiStore } from '@/shell/model/useShellUiStore';

const ROOT = ['hidra'] as const;

/** Preserve active global auth/catalog state; drop everything scoped to the old context. */
function isUnscopedKey(key: readonly unknown[]): boolean {
  const id = JSON.stringify(key);
  return [
    ['hidra', 'identity', 'me', 'permissions'],
    ['hidra', 'security', 'permissions', 'catalog'],
    ['hidra', 'security', 'permissions', 'routes'],
  ].some((value) => JSON.stringify(value) === id);
}

export function OperationalContextSelector() {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const principalId = auth.session?.principal?.userId;
  const employeeId = auth.session?.principal?.employeeReferenceId;
  const selected = useShellUiStore((s) => s.operationalContext);
  const setSelected = useShellUiStore((s) => s.setOperationalContext);
  const epoch = useRef(0);
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [discoveredCompany, setDiscoveredCompany] = useState('');
  const [scopeId, setScopeId] = useState('');
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const companyPartyId = company.trim();
  const discoveryKey = ['hidra', 'identity', 'regional-scopes', principalId, companyPartyId] as const;
  const companyValid = companyPartyId.length > 0 && companyPartyId.length <= 80;
  const discoveryEnabled = auth.status === 'authenticated' && Boolean(principalId && employeeId) &&
    open && companyValid && discoveredCompany === companyPartyId;

  // Cancel any outstanding rebind if the selector unmounts or the session changes.
  useEffect(() => () => { epoch.current++; }, [auth.status, principalId, employeeId]);

  const discovery = useQuery({
    queryKey: discoveryKey,
    queryFn: () => fetchCurrentOperationalScopes(companyPartyId),
    enabled: discoveryEnabled,
    retry: false, staleTime: 0, refetchOnWindowFocus: true, refetchInterval: 30_000,
  });
  const scopes = useMemo(
    () => !discoveryEnabled || discovery.isError ? [] : authorizedRegionalScopes(discovery.data),
    [discovery.data, discovery.isError, discoveryEnabled],
  );
  // Independently keep the applied company/registry binding current even while
  // the selector is closed or the operator is editing a different company.
  const appliedDiscovery = useQuery({
    queryKey: ['hidra', 'identity', 'regional-scopes', principalId, selected?.companyPartyId],
    queryFn: () => fetchCurrentOperationalScopes(selected!.companyPartyId),
    enabled: auth.status === 'authenticated' && Boolean(employeeId && selected?.companyPartyId) &&
      selected?.principalId === principalId,
    retry: false, staleTime: 0, refetchOnWindowFocus: true, refetchInterval: 30_000,
  });
  const regional = useQuery({
    queryKey: ['hidra', 'identity', 'regional-access', principalId, selected?.companyPartyId, selected?.type, selected?.targetId],
    queryFn: () => fetchCurrentRegionalAccess(selected!.type!, selected!.targetId!, selected!.companyPartyId),
    enabled: auth.status === 'authenticated' && selected?.principalId === principalId &&
      Boolean(selected?.companyPartyId && supportsRegionalAccess(selected)),
    retry: false, staleTime: 0, refetchOnWindowFocus: true, refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!selected) return;
    const changedActor = auth.status !== 'authenticated' || !principalId ||
      !employeeId || selected.principalId !== principalId;
    const lostResponsibility = appliedDiscovery.isError || (appliedDiscovery.isSuccess &&
      !authorizedRegionalScopes(appliedDiscovery.data).some((scope) =>
        scope.id === selected.scopeId && scope.type === selected.type && scope.targetId === selected.targetId));
    const lostAccess = regional.isError || (regional.isSuccess &&
      !isPositiveRegionalAccess(regional.data, selected.companyPartyId, selected));
    if (!changedActor && !lostResponsibility && !lostAccess) return;
    epoch.current++;
    setSelected(undefined);
    navigate('/overview', { replace: true });
    void client.cancelQueries({ queryKey: ROOT }).then(() => {
      client.removeQueries({ queryKey: ROOT, predicate: (query) => !isUnscopedKey(query.queryKey) });
      client.getMutationCache().clear();
    });
  }, [auth.status, client, employeeId, navigate, principalId, regional.data, regional.isError,
    regional.isSuccess, appliedDiscovery.data, appliedDiscovery.isError, appliedDiscovery.isSuccess, selected, setSelected]);

  const apply = async () => {
    if (!employeeId || !principalId || auth.status !== 'authenticated' || !discoveryEnabled || discovery.isFetching) return;
    const scope = scopes.find((candidate) => String(candidate.id) === scopeId);
    if (!scope?.id || !scope.type || !scope.targetId || !companyPartyId ||
        companyPartyId.length > 80 || !supportsRegionalAccess(scope) ||
        client.getMutationCache().getAll().some((m) => m.state.status === 'pending')) {
      setFailed(true);
      return;
    }
    const generation = ++epoch.current;
    setPending(true);
    setFailed(false);
    // Do not change the keyed navigation context yet: it would unmount this
    // component and orphan the in-flight verification. Clear owner caches first.
    try {
      await client.cancelQueries({ queryKey: ROOT });
      client.removeQueries({ queryKey: ROOT, predicate: (query) => !isUnscopedKey(query.queryKey) });
      client.getMutationCache().clear();
      const [principal, grants, currentScopes, decision] = await Promise.all([
        hidraHttpClient<PrincipalView>({ method: 'GET', url: '/api/v1/identity/me' }),
        fetchEffectivePermissions(),
        fetchCurrentOperationalScopes(companyPartyId),
        fetchCurrentRegionalAccess(scope.type, scope.targetId, companyPartyId),
      ]);
      if (generation !== epoch.current) return;
      const current = authorizedRegionalScopes(currentScopes).some((s) =>
        s.id === scope.id && s.type === scope.type && s.targetId === scope.targetId);
      if (principal.userId !== principalId || principal.employeeReferenceId !== employeeId ||
          (!grants.includes('identity:me:read') && !grants.includes('*')) ||
          !current || !isPositiveRegionalAccess(decision, companyPartyId, scope)) {
        throw new Error('Not authorized');
      }
      client.setQueryData(['hidra', 'identity', 'me', 'permissions'], grants);
      client.setQueryData(discoveryKey, currentScopes);
      setSelected({
        principalId, companyPartyId, scopeId: scope.id, type: scope.type,
        targetId: scope.targetId,
      });
      navigate('/overview', { replace: true });
      setOpen(false);
    } catch {
      if (generation === epoch.current) {
        // A failed rebind leaves no effective context or old protected route.
        setSelected(undefined);
        navigate('/overview', { replace: true });
        setFailed(true);
      }
    } finally {
      if (generation === epoch.current) setPending(false);
    }
  };

  if (auth.status !== 'authenticated' || !principalId || !employeeId) return null;
  return (
    <>
      <Button aria-label={t('shell.operationalContextPlaceholder')} onClick={() => {
        setCompany(selected?.companyPartyId ?? '');
        setDiscoveredCompany(selected?.companyPartyId ?? '');
        setScopeId(selected ? String(selected.scopeId) : '');
        setFailed(false);
        setOpen(true);
      }} size="small" sx={{ display: { xs: 'none', lg: 'inline-flex' }, maxWidth: 240 }} variant="outlined">
        {selected ? selected.name ?? selected.code ?? `${selected.type} · ${selected.targetId}` : t('shell.operationalContextPlaceholder')}
      </Button>
      <Dialog open={open} fullWidth maxWidth="sm" onClose={() => { if (!pending) setOpen(false); }}>
        <DialogTitle>{t('shell.operationalContextTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">{t('shell.operationalContextHelp')}</Typography>
            <TextField label={t('shell.operationalCompany')} value={company} required size="small"
              slotProps={{ htmlInput: { maxLength: 80 } }}
              disabled={pending}
              onChange={(event) => { setCompany(event.target.value); setDiscoveredCompany(''); setScopeId(''); setFailed(false); }} />
            <Button disabled={pending || !companyValid || (discoveryEnabled && discovery.isFetching)} onClick={() => {
              setScopeId(''); setFailed(false);
              if (discoveredCompany === companyPartyId) void discovery.refetch();
              else setDiscoveredCompany(companyPartyId);
            }} variant="outlined">{t('shell.operationalDiscover')}</Button>
            <TextField label={t('shell.operationalResource')} select size="small" value={scopes.some((scope) => String(scope.id) === scopeId) ? scopeId : ''}
              disabled={pending || !discoveryEnabled || discovery.isFetching || scopes.length === 0}
              onChange={(event) => { setScopeId(event.target.value); setFailed(false); }}>
              <MenuItem value="">{t('shell.operationalContextPlaceholder')}</MenuItem>
              {scopes.map((scope) => (
                <MenuItem key={scope.id} value={String(scope.id)}>
                  {scope.type + ' · ' + scope.targetId}
                </MenuItem>
              ))}
            </TextField>
            {(discoveryEnabled && (discovery.isError || (discovery.isSuccess && scopes.length === 0))) || failed ?
              <Alert severity="warning">{t('shell.operationalContextUnavailable')}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={pending} onClick={() => setOpen(false)}>{t('shell.contextCancel')}</Button>
          <Button disabled={pending || !discoveryEnabled || discovery.isFetching ||
            !scopes.some((scope) => String(scope.id) === scopeId)} onClick={() => { void apply(); }} variant="contained">
            {t('shell.contextApply')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
