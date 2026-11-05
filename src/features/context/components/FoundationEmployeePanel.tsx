import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { activateEmployee, fetchEmployeeLifecycle, fetchEmployeeLifecycleHistory, fetchOrganizationEmployees } from '@/features/context/api/identityOrganizationApi';
import { usePermissions } from '@/features/permissions/usePermissions';

export function FoundationEmployeePanel() {
  const { t } = useTranslation();
  const admin = usePermissions().can('*');
  const [employee, setEmployee] = useState('');
  const [search, setSearch] = useState('');
  const employees = useQuery({ queryKey: ['hidra', 'organization-admin', 'foundation-employees', search], queryFn: () => fetchOrganizationEmployees(search, 0, 100), enabled: admin, retry: false });
  if (!admin) return <Alert severity="info">{t('context.foundation.adminOnly')}</Alert>;
  return <Paper variant="outlined" sx={{ p: 2, display: 'grid', gap: 2 }}>
    <Typography variant="h6">{t('context.foundation.employeeLifecycle')}</Typography>
    {employees.error && <Alert severity="error">{t('context.foundation.loadFailed')}</Alert>}
    <TextField label={t('context.foundation.search')} value={search} onChange={e => { setSearch(e.target.value); setEmployee(''); }} />
    <TextField select label={t('context.foundation.employee')} value={employee} onChange={e => setEmployee(e.target.value)}>
      <MenuItem value="">{t('context.foundation.choose')}</MenuItem>
      {employees.data?.content?.map(row => <MenuItem key={row.id} value={row.id}>{row.displayNameLt || row.employeeNumber} · {row.status}</MenuItem>)}
    </TextField>
    {employee && <EmployeeLifecycle key={employee} id={employee} />}
  </Paper>;
}
function EmployeeLifecycle({ id }: { id: string }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const state = useQuery({ queryKey: ['hidra', 'organization-admin', 'lifecycle', id], queryFn: () => fetchEmployeeLifecycle(id), retry: false });
  const history = useQuery({ queryKey: ['hidra', 'organization-admin', 'lifecycle-history', id], queryFn: () => fetchEmployeeLifecycleHistory(id), retry: false });
  async function activate() {
    if (!state.data?.updatedAt || !reason.trim() || pending) return;
    setPending(true); setMessage('');
    try { await activateEmployee(id, { expectedUpdatedAt: state.data.updatedAt, reason: reason.trim() }); await client.invalidateQueries({ queryKey: ['hidra', 'organization-admin'] }); }
    catch { setMessage(t('context.foundation.rejected')); }
    finally { setPending(false); }
  }
  return <Box sx={{ display: 'grid', gap: 2 }}>
    {(state.error || history.error) && <Alert severity="error">{t('context.foundation.loadFailed')}</Alert>}
    <Typography>{t('context.fields.status')}: {state.data?.status}</Typography>
    <TextField required label={t('context.foundation.reason')} value={reason} onChange={e => setReason(e.target.value)} />
    <Button disabled={Boolean(message) || pending || state.isFetching || Boolean(state.error) || !state.data?.updatedAt || state.data.status !== 'REGISTERED' || !reason.trim()} onClick={() => void activate()}>{t('context.foundation.activate')}</Button>
    <Button disabled={pending} onClick={() => { setMessage(''); void client.invalidateQueries({ queryKey: ['hidra', 'organization-admin'] }); }}>{t('context.foundation.refresh')}</Button>
    {message && <Alert severity="error">{message}</Alert>}
    <Typography variant="subtitle2">{t('context.foundation.history')}</Typography>
    {history.data?.map(row => <Typography key={row.id} variant="body2">{row.occurredAt} · {row.reason}</Typography>)}
  </Box>;
}
