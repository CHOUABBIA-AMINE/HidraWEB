import { MenuItem, Select } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/app/auth/useAuth';
import { fetchResponsibilitiesByEmployee } from '@/features/context/api/identityOrganizationApi';
import { activeOperationalScopes } from '@/features/context/model/operationalContextModel';
import { useShellUiStore } from '@/shell/model/useShellUiStore';

export function OperationalContextSelector() {
  const { t } = useTranslation();
  const auth = useAuth();
  const employeeId = auth.session?.principal?.employeeReferenceId;
  const selected = useShellUiStore((state) => state.operationalContext);
  const setSelected = useShellUiStore((state) => state.setOperationalContext);

  const responsibilitiesQuery = useQuery({
    queryKey: ['hidra', 'organization', 'responsibilities', 'employee', employeeId],
    queryFn: () => fetchResponsibilitiesByEmployee(employeeId!),
    enabled: Boolean(employeeId),
    staleTime: 60_000,
  });

  const scopes = useMemo(
    () => activeOperationalScopes(responsibilitiesQuery.data ?? []),
    [responsibilitiesQuery.data],
  );

  useEffect(() => {
    if (!employeeId || scopes.length === 0) {
      if (selected) setSelected(undefined);
      return;
    }
    if (selected && scopes.some((scope) => scope.id === selected.scopeId)) return;
    const scope = scopes[0];
    if (!scope.id) return;
    setSelected({
      scopeId: scope.id,
      type: scope.type,
      targetId: scope.targetId,
      code: scope.code,
      name: scope.name,
    });
  }, [employeeId, scopes, selected, setSelected]);

  if (!employeeId || scopes.length === 0) {
    return null;
  }

  return (
    <Select
      aria-label={t('shell.operationalContextPlaceholder')}
      onChange={(event) => {
        const scopeId = Number(event.target.value);
        const scope = scopes.find((candidate) => candidate.id === scopeId);
        if (!scope?.id) return;
        setSelected({
          scopeId: scope.id,
          type: scope.type,
          targetId: scope.targetId,
          code: scope.code,
          name: scope.name,
        });
      }}
      size="small"
      sx={{ display: { xs: 'none', lg: 'inline-flex' }, minWidth: 180 }}
      value={selected?.scopeId ?? scopes[0]?.id ?? ''}
    >
      {scopes.map((scope) => (
        <MenuItem key={scope.id} value={scope.id}>
          {scope.name ?? scope.code ?? `${scope.type ?? 'SCOPE'} · ${scope.targetId ?? scope.id}`}
        </MenuItem>
      ))}
    </Select>
  );
}
