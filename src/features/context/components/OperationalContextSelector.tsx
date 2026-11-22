import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type { PrincipalView } from '@/api/generated/identity-organization/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { useAuth } from '@/app/auth/useAuth';
import { fetchCurrentRegionalAccess, fetchResponsibilitiesByEmployee } from '@/features/context/api/identityOrganizationApi';
import { effectiveRegionalScopes, isPositiveRegionalAccess, supportsRegionalAccess } from '@/features/context/model/operationalContextModel';
import { fetchEffectivePermissions } from '@/features/permissions/api/permissionApi';
import { useShellUiStore } from '@/shell/model/useShellUiStore';

const ROOT = ['hidra'] as const;

/** Preserve active global auth/catalog state; drop everything scoped to the old context. */
function isUnscopedKey(key: readonly unknown[], employeeId: string): boolean {
  const id = JSON.stringify(key);
  return [
    ['hidra', 'identity', 'me', 'permissions'],
    ['hidra', 'security', 'permissions', 'catalog'],
    ['hidra', 'security', 'permissions', 'routes'],
    ['hidra', 'organization', 'responsibilities', 'employee', employeeId],
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
  const [scopeId, setScopeId] = useState('');
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const responsibilityKey = ['hidra', 'organization', 'responsibilities', 'employee', employeeId] as const;

  // Cancel any outstanding rebind if the selector unmounts or the session changes.
  useEffect(() => () => { epoch.current++; }, [auth.status, principalId, employeeId]);

  const responsibilities = useQuery({
    queryKey: responsibilityKey,
    queryFn: () => fetchResponsibilitiesByEmployee(employeeId!),
    enabled: auth.status === 'authenticated' && Boolean(employeeId),
    retry: false, staleTime: 0, refetchOnWindowFocus: true, refetchInterval: 30_000,
  });
  const scopes = useMemo(
    () => responsibilities.isError ? [] : effectiveRegionalScopes(responsibilities.data ?? []),
    [responsibilities.data, responsibilities.isError],
  );
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
    const lostResponsibility = responsibilities.isError || (responsibilities.isSuccess &&
      !scopes.some((scope) => scope.id === selected.scopeId && scope.type === selected.type &&
        scope.targetId === selected.targetId));
    const lostAccess = regional.isError || (regional.isSuccess &&
      !isPositiveRegionalAccess(regional.data, selected.companyPartyId, selected));
    if (!changedActor && !lostResponsibility && !lostAccess) return;
    epoch.current++;
    setSelected(undefined);
    navigate('/overview', { replace: true });
    void client.cancelQueries({ queryKey: ROOT }).then(() => {
      client.removeQueries({ queryKey: ROOT, predicate: (query) => !isUnscopedKey(query.queryKey, employeeId ?? '') });
      client.getMutationCache().clear();
    });
  }, [auth.status, client, employeeId, navigate, principalId, regional.data, regional.isError,
    regional.isSuccess, responsibilities.isError, responsibilities.isSuccess, scopes, selected, setSelected]);

  const apply = async () => {
    if (!employeeId || !principalId || auth.status !== 'authenticated') return;
    const scope = scopes.find((candidate) => String(candidate.id) === scopeId);
    const companyPartyId = company.trim();
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
      client.removeQueries({ queryKey: ROOT, predicate: (query) => !isUnscopedKey(query.queryKey, employeeId) });
      client.getMutationCache().clear();
      const [principal, grants, assignments, decision] = await Promise.all([
        hidraHttpClient<PrincipalView>({ method: 'GET', url: '/api/v1/identity/me' }),
        fetchEffectivePermissions(),
        fetchResponsibilitiesByEmployee(employeeId),
        fetchCurrentRegionalAccess(scope.type, scope.targetId, companyPartyId),
      ]);
      if (generation !== epoch.current) return;
      const current = effectiveRegionalScopes(assignments).some((s) =>
        s.id === scope.id && s.type === scope.type && s.targetId === scope.targetId);
      if (principal.userId !== principalId || principal.employeeReferenceId !== employeeId ||
          (!grants.includes('identity:me:read') && !grants.includes('*')) ||
          !current || !isPositiveRegionalAccess(decision, companyPartyId, scope)) {
        throw new Error('Not authorized');
      }
      client.setQueryData(['hidra', 'identity', 'me', 'permissions'], grants);
      client.setQueryData(responsibilityKey, assignments);
      setSelected({
        principalId, companyPartyId, scopeId: scope.id, type: scope.type,
        targetId: scope.targetId, code: scope.code, name: scope.name,
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
        setScopeId(selected ? String(selected.scopeId) : '');
        setFailed(false);
        setOpen(true);
      }} size="small" sx={{ display: { xs: 'none', lg: 'inline-flex' }, maxWidth: 240 }} variant="outlined">
        {selected?.name ?? selected?.code ?? t('shell.operationalContextPlaceholder')}
      </Button>
      <Dialog open={open} fullWidth maxWidth="sm" onClose={() => { if (!pending) setOpen(false); }}>
        <DialogTitle>{t('shell.operationalContextTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">{t('shell.operationalContextHelp')}</Typography>
            <TextField label={t('shell.operationalCompany')} value={company} required size="small"
              slotProps={{ htmlInput: { maxLength: 80 } }}
              onChange={(event) => { setCompany(event.target.value); setFailed(false); }} />
            <TextField label={t('shell.operationalResource')} select size="small" value={scopeId}
              onChange={(event) => { setScopeId(event.target.value); setFailed(false); }}>
              <MenuItem value="">{t('shell.operationalContextPlaceholder')}</MenuItem>
              {scopes.map((scope) => (
                <MenuItem key={scope.id} value={String(scope.id)}>
                  {scope.name ?? scope.code ?? scope.type + ' · ' + scope.targetId}
                </MenuItem>
              ))}
            </TextField>
            {responsibilities.isError || (responsibilities.isSuccess && scopes.length === 0) || failed ?
              <Alert severity="warning">{t('shell.operationalContextUnavailable')}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={pending} onClick={() => setOpen(false)}>{t('shell.contextCancel')}</Button>
          <Button disabled={pending || responsibilities.isFetching || scopes.length === 0 ||
            !scopeId || !company.trim()} onClick={() => { void apply(); }} variant="contained">
            {t('shell.contextApply')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
