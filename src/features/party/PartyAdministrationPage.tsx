import { Alert, Box, Button, Container, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PartyAdministrationView } from '@/api/generated/party/model';
import { assignPartyRole, editParty, fetchParty, fetchPartyHistory, fetchPartyRoles, fetchPartyTypes, registerParty, searchParties, transitionParty } from '@/features/party/api/partyApi';
import { PartySelector } from '@/features/party/components/PartySelector';
import { usePermissions } from '@/features/permissions/usePermissions';

export function PartyAdministrationPage() {
  const { t, i18n } = useTranslation();
  const admin = usePermissions().can('*');
  const client = useQueryClient();
  const language = i18n.language.split('-')[0];
  const [q, setQ] = useState(''); const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(''); const [eligible, setEligible] = useState('');
  const [form, setForm] = useState({ code: '', legalName: '', partyTypeId: '', countryCode: '', primaryRoleCodeSnapshot: '' });
  const [pending, setPending] = useState(false); const [message, setMessage] = useState('');
  const rows = useQuery({ queryKey: ['hidra', 'party', 'search', q, offset], queryFn: () => searchParties(q, '', false, offset), enabled: admin, retry: false });
  const types = useQuery({ queryKey: ['hidra', 'party', 'types', language], queryFn: () => fetchPartyTypes(language), enabled: admin, retry: false });
  const roles = useQuery({ queryKey: ['hidra', 'party', 'roles', language], queryFn: () => fetchPartyRoles(language), enabled: admin, retry: false });
  async function create() {
    if (pending) return;
    setPending(true); setMessage('');
    try { const row = await registerParty({ ...form, countryCode: form.countryCode || undefined, primaryRoleCodeSnapshot: form.primaryRoleCodeSnapshot || undefined }); setSelected(row.id ?? ''); await client.invalidateQueries({ queryKey: ['hidra', 'party'] }); }
    catch { setMessage(t('context.foundation.rejected')); }
    finally { setPending(false); }
  }
  if (!admin) return <Container sx={{ py: 3 }}><Alert severity="warning">{t('context.foundation.adminOnly')}</Alert></Container>;
  return <Container maxWidth="xl" sx={{ py: 3 }}>
    <Typography variant="h4" component="h1">{t('context.foundation.partyTitle')}</Typography>
    <Box sx={{ display: 'grid', gap: 2, mt: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
      <Paper variant="outlined" sx={{ p: 2, display: 'grid', gap: 2 }}>
        <Typography variant="h6">{t('context.foundation.registerParty')}</Typography>
        <TextField required label={t('context.fields.code')} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
        <TextField required label={t('context.foundation.legalName')} value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })} />
        <TextField select required label={t('context.foundation.partyType')} value={form.partyTypeId} onChange={e => setForm({ ...form, partyTypeId: e.target.value })}>
          <MenuItem value="">{t('context.foundation.choose')}</MenuItem>
          {types.data?.map(row => <MenuItem key={row.id} value={row.id}>{row.label || row.code}</MenuItem>)}
        </TextField>
        <TextField required label={t('context.foundation.country')} value={form.countryCode} onChange={e => setForm({ ...form, countryCode: e.target.value.toUpperCase() })} />
        <TextField select label={t('context.foundation.partyRole')} value={form.primaryRoleCodeSnapshot} onChange={e => setForm({ ...form, primaryRoleCodeSnapshot: e.target.value })}>
          <MenuItem value="">{t('context.foundation.choose')}</MenuItem>
          {roles.data?.map(row => <MenuItem key={row.id} value={row.code}>{row.label || row.code}</MenuItem>)}
        </TextField>
        <Button variant="contained" disabled={pending || !form.code.trim() || !form.legalName.trim() || !form.partyTypeId || !form.countryCode.trim() || form.countryCode.length > 3 || Boolean(types.error)} onClick={() => void create()}>{t('context.foundation.registerParty')}</Button>
        {message && <Alert severity="error">{message}</Alert>}
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, display: 'grid', gap: 2 }}>
        <Typography variant="h6">{t('context.foundation.partyRecords')}</Typography>
        <TextField label={t('context.foundation.search')} value={q} onChange={e => { setQ(e.target.value); setOffset(0); }} />
        {(rows.error || types.error || roles.error) && <Alert severity="error">{t('context.foundation.loadFailed')}</Alert>}
        {rows.isFetching && <Typography>{t('context.foundation.loading')}</Typography>}
        {rows.data?.items?.map(row => <Button key={row.id} variant={selected === row.id ? 'contained' : 'text'} onClick={() => setSelected(row.id ?? '')}>{row.code} · {row.legalName} · {row.status}</Button>)}
        {rows.data?.items?.length === 0 && <Typography>{t('context.foundation.empty')}</Typography>}
        <Box><Button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 20))}>{t('context.foundation.previous')}</Button>
          <Button disabled={!rows.data || offset + 20 >= (rows.data.total ?? 0)} onClick={() => setOffset(offset + 20)}>{t('context.foundation.next')}</Button></Box>
        <Typography variant="subtitle2">{t('context.foundation.eligibleParty')}</Typography>
        <PartySelector value={eligible} onChange={setEligible} />
      </Paper>
    </Box>
    {selected && <PartyDetail key={selected} id={selected} />}
  </Container>;
}

function PartyDetail({ id }: { id: string }) {
  const { t, i18n } = useTranslation(); const client = useQueryClient();
  const [reason, setReason] = useState(''); const [role, setRole] = useState('');
  const [pending, setPending] = useState(false); const [message, setMessage] = useState('');
  const [edited, setEdited] = useState<Pick<PartyAdministrationView, 'legalName' | 'tradeName' | 'shortName'> | null>(null);
  const [historyOffset, setHistoryOffset] = useState(0);
  const record = useQuery({ queryKey: ['hidra', 'party', 'detail', id], queryFn: () => fetchParty(id), retry: false });
  const history = useQuery({ queryKey: ['hidra', 'party', 'history', id, historyOffset], queryFn: () => fetchPartyHistory(id, historyOffset), retry: false });
  const roles = useQuery({ queryKey: ['hidra', 'party', 'roles', i18n.language.split('-')[0]], queryFn: () => fetchPartyRoles(i18n.language.split('-')[0]), retry: false });
  const refresh = async () => { await client.invalidateQueries({ queryKey: ['hidra', 'party'] }); };
  async function run(action: () => Promise<unknown>) {
    if (pending || !reason.trim()) return;
    setPending(true); setMessage('');
    try { await action(); setEdited(null); await refresh(); }
    catch { setMessage(t('context.foundation.rejected')); }
    finally { setPending(false); }
  }
  const row = record.data; const value = edited ?? row;
  const ready = !message && !pending && !record.isFetching && !record.error && Boolean(row?.updatedAt) && Boolean(reason.trim());
  return <Paper variant="outlined" sx={{ p: 2, mt: 2, display: 'grid', gap: 2 }}>
    <Typography variant="h6">{row?.code} · {row?.status}</Typography>
    {(record.error || history.error || roles.error) && <Alert severity="error">{t('context.foundation.loadFailed')}</Alert>}
    <TextField label={t('context.foundation.legalName')} value={value?.legalName ?? ''} onChange={e => setEdited({ ...value, legalName: e.target.value })} />
    <TextField label={t('context.foundation.tradeName')} value={value?.tradeName ?? ''} onChange={e => setEdited({ ...value, tradeName: e.target.value })} />
    <TextField label={t('context.foundation.shortName')} value={value?.shortName ?? ''} onChange={e => setEdited({ ...value, shortName: e.target.value })} />
    <TextField required label={t('context.foundation.reason')} value={reason} onChange={e => setReason(e.target.value)} />
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      <Button disabled={!ready || !value?.legalName?.trim()} onClick={() => void run(() => editParty(id, { expectedUpdatedAt: row!.updatedAt!, legalName: value!.legalName!, tradeName: value?.tradeName, shortName: value?.shortName, reason: reason.trim() }))}>{t('context.foundation.save')}</Button>
      <Button disabled={!ready || row?.status !== 'DRAFT'} onClick={() => void run(() => transitionParty(id, true, { expectedUpdatedAt: row!.updatedAt!, reason: reason.trim() }))}>{t('context.foundation.activate')}</Button>
      <Button disabled={!ready || row?.status !== 'ACTIVE'} onClick={() => void run(() => transitionParty(id, false, { expectedUpdatedAt: row!.updatedAt!, reason: reason.trim() }))}>{t('context.foundation.deactivate')}</Button>
      <Button disabled={pending} onClick={() => { setMessage(''); setEdited(null); void refresh(); }}>{t('context.foundation.refresh')}</Button>
    </Box>
    <TextField select label={t('context.foundation.partyRole')} value={role} onChange={e => setRole(e.target.value)}>
      <MenuItem value="">{t('context.foundation.choose')}</MenuItem>
      {roles.data?.map(choice => <MenuItem key={choice.id} value={choice.id}>{choice.label || choice.code}</MenuItem>)}
    </TextField>
    <Button disabled={!ready || !role || Boolean(roles.error)} onClick={() => void run(() => assignPartyRole({ partyId: id, roleId: role, qualificationRequired: roles.data?.find(c => c.id === role)?.qualificationRequired }))}>{t('context.foundation.assignRole')}</Button>
    {message && <Alert severity="error">{message}</Alert>}
    <Typography variant="subtitle2">{t('context.foundation.history')}</Typography>
    {history.data?.map(event => <Typography key={event.id} variant="body2">{event.at} · {event.oldStatus} → {event.newStatus} · {event.reason}</Typography>)}
    <Box><Button disabled={historyOffset === 0} onClick={() => setHistoryOffset(Math.max(0, historyOffset - 20))}>{t('context.foundation.previous')}</Button><Button disabled={(history.data?.length ?? 0) < 20} onClick={() => setHistoryOffset(historyOffset + 20)}>{t('context.foundation.next')}</Button></Box>
  </Paper>;
}
