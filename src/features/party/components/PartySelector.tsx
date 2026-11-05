import { Alert, Box, Button, MenuItem, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchParties } from '@/features/party/api/partyApi';
import { usePermissions } from '@/features/permissions/usePermissions';

/** Only current, backend-authorized eligible Party references are offered. */
export function PartySelector({ value, onChange, roleId = '' }: { value: string; onChange: (id: string) => void; roleId?: string }) {
  const { t } = useTranslation();
  const allowed = usePermissions().can('*');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const parties = useQuery({ queryKey: ['hidra', 'party', 'eligible', roleId, search, offset], queryFn: () => searchParties(search, roleId, true, offset), enabled: allowed, retry: false });
  if (!allowed) return <Alert severity="info">{t('context.foundation.adminOnly')}</Alert>;
  return <Box sx={{ display: 'grid', gap: 1 }}>
    <TextField label={t('context.foundation.search')} value={search} onChange={e => { setSearch(e.target.value); setOffset(0); onChange(''); }} />
    {parties.error && <Alert severity="error">{t('context.foundation.loadFailed')}</Alert>}
    <TextField select label={t('context.foundation.eligibleParty')} value={value} onChange={e => onChange(e.target.value)} disabled={parties.isFetching || Boolean(parties.error)}>
      <MenuItem value="">{t('context.foundation.choose')}</MenuItem>
      {parties.data?.items?.filter(p => p.status === 'ACTIVE').map(p => <MenuItem key={p.id} value={p.id}>{p.code} · {p.legalName}</MenuItem>)}
    </TextField>
    <Box><Button disabled={offset === 0} onClick={() => { setOffset(Math.max(0, offset - 20)); onChange(''); }}>{t('context.foundation.previous')}</Button>
      <Button disabled={!parties.data || offset + 20 >= (parties.data.total ?? 0)} onClick={() => { setOffset(offset + 20); onChange(''); }}>{t('context.foundation.next')}</Button></Box>
  </Box>;
}
