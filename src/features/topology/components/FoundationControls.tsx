import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/features/permissions/usePermissions';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { TopologyFoundationItem } from '@/api/generated/topology/model';

export function ChoiceField({ label, value, items, onChange, disabled = false }: {
  label: string; value: string; items: TopologyFoundationItem[];
  onChange: (value: string) => void; disabled?: boolean;
}) {
  const { t } = useTranslation();
  return <TextField select size="small" label={label} value={value} disabled={disabled} onChange={e => onChange(e.target.value)}>
    <MenuItem value="">{t('topology.editor.choose')}</MenuItem>
    {items.filter(x => x.id).map(x => <MenuItem key={x.id} value={x.id}>{x.code ?? x.id} · {x.name ?? x.kind ?? ''}</MenuItem>)}
  </TextField>;
}
export function Failure({ error }: { error: unknown }) {
  const { t } = useTranslation();
  if (!error) return null;
  const e = normalizeHidraApiError(error);
  return <Alert severity="error">{t(e.status === 401 || e.status === 403 ? 'topology.editor.denied' : 'topology.editor.failed')}{e.correlationId ? ` · ${e.correlationId}` : ''}</Alert>;
}
/** No automatic mutation retry. After any failure require an explicit reload/review. */
export function useOwnerCommand<T>(onSuccess: (result: T) => void) {
  return useMutation({ mutationFn: (command: () => Promise<T>) => command(), onSuccess, retry: false });
}
export function CommandState({ pending, error, reset }: { pending: boolean; error: unknown; reset: () => void }) {
  const { t } = useTranslation();
  return <Stack spacing={1} aria-busy={pending}><Failure error={error} />{error ? <Button onClick={reset}>{t('topology.editor.review')}</Button> : null}</Stack>;
}

export function useTopologyAction() {
  const permissions = usePermissions();
  return (code: string) => permissions.can('*') || permissions.can(code);
}
