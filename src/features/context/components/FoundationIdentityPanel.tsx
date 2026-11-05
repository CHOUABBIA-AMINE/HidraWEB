import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchIdentityUsers, fetchIdentityOperationCapabilities, fetchIdentityLifecycle,
  fetchCredentialState, setLocalCredential, transitionIdentityUser, revokeIdentityGrant,
} from '@/features/context/api/identityOrganizationApi';
import { usePermissions } from '@/features/permissions/usePermissions';

export function FoundationIdentityPanel() {
  const { t } = useTranslation();
  const admin = usePermissions().can('*');
  const [user, setUser] = useState('');
  const [search, setSearch] = useState('');
  const capabilities = useQuery({ queryKey: ['hidra', 'foundation', 'identity-capabilities'], queryFn: fetchIdentityOperationCapabilities, enabled: admin, retry: false });
  const allowed = admin && Boolean(capabilities.data?.includes('MANAGE_USERS'));
  const users = useQuery({ queryKey: ['hidra', 'identity-admin', 'foundation-users', search], queryFn: () => fetchIdentityUsers(search, 0, 100), enabled: allowed, retry: false });
  if (!allowed) return <Alert severity="info">{t('context.foundation.adminOnly')}</Alert>;
  return <Paper variant="outlined" sx={{ p: 2, display: 'grid', gap: 2 }}>
    <Typography variant="h6">{t('context.foundation.userLifecycle')}</Typography>
    {(capabilities.error || users.error) && <Alert severity="error">{t('context.foundation.loadFailed')}</Alert>}
    <TextField label={t('context.foundation.search')} value={search} onChange={e => { setSearch(e.target.value); setUser(''); }} />
    <TextField select label={t('context.foundation.user')} value={user} onChange={e => setUser(e.target.value)}>
      <MenuItem value="">{t('context.foundation.choose')}</MenuItem>
      {users.data?.content?.map(row => <MenuItem key={row.id} value={row.id}>{row.displayName || row.username} · {row.status}</MenuItem>)}
    </TextField>
    {user && <IdentityLifecycle key={user} id={user} />}
  </Paper>;
}

function IdentityLifecycle({ id }: { id: string }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [grantId, setGrantId] = useState('');
  const [kind, setKind] = useState<'user-role' | 'user-permission' | 'role-permission'>('user-role');
  const state = useQuery({ queryKey: ['hidra', 'identity-admin', 'lifecycle', id], queryFn: () => fetchIdentityLifecycle(id), retry: false });
  const credential = useQuery({ queryKey: ['hidra', 'identity-admin', 'credential-state', id], queryFn: () => fetchCredentialState(id), retry: false });
  const refresh = async () => { setBlocked(false); await client.invalidateQueries({ queryKey: ['hidra', 'identity-admin'] }); };
  async function run(action: () => Promise<unknown>) {
    if (pending || !reason.trim()) return;
    setPending(true); setMessage('');
    try { await action(); setFailed(false); setMessage(t('context.foundation.saved')); await refresh(); }
    catch { setBlocked(true); setFailed(true); setMessage(t('context.foundation.rejected')); }
    finally { setPending(false); }
  }
  function saveCredential() {
    if (password.length < 12 || password.length > 128 || credential.data?.securityVersion === undefined) return;
    const input = password;
    setPassword(''); // Never retain a password in a React Query mutation or query key.
    void run(() => setLocalCredential(id, { password: input, expectedSecurityVersion: credential.data!.securityVersion, reason: reason.trim() }));
  }
  const ready = !blocked && !pending && reason.trim().length > 0 && !state.isFetching && !state.error;
  return <Box sx={{ display: 'grid', gap: 2 }}>
    {state.error || credential.error ? <Alert severity="error">{t('context.foundation.loadFailed')}</Alert> : null}
    {state.data && <Typography>{t('context.fields.status')}: {state.data.status}</Typography>}
    <TextField required label={t('context.foundation.reason')} value={reason} onChange={e => setReason(e.target.value)} disabled={pending} />
    <TextField label={t('context.foundation.password')} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} disabled={pending} />
    <Button disabled={!ready || credential.isFetching || Boolean(credential.error) || credential.data?.securityVersion === undefined || password.length < 12 || password.length > 128} onClick={saveCredential}>{t('context.foundation.setCredential')}</Button>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button disabled={!ready || !state.data?.updatedAt || state.data.status !== 'REGISTERED' || Boolean(credential.error) || (credential.data?.securityVersion ?? 0) < 1} onClick={() => void run(() => transitionIdentityUser(id, true, { expectedUpdatedAt: state.data!.updatedAt!, reason: reason.trim() }))}>{t('context.foundation.activate')}</Button>
      <Button disabled={!ready || !state.data?.updatedAt || state.data.status !== 'ACTIVE'} onClick={() => void run(() => transitionIdentityUser(id, false, { expectedUpdatedAt: state.data!.updatedAt!, reason: reason.trim() }))}>{t('context.foundation.deactivate')}</Button>
      <Button disabled={pending} onClick={() => void refresh()}>{t('context.foundation.refresh')}</Button>
    </Box>
    <Typography variant="subtitle2">{t('context.foundation.revokeGrant')}</Typography>
    <TextField select label={t('context.foundation.grantKind')} value={kind} onChange={e => setKind(e.target.value as typeof kind)}>
      {(['user-role', 'user-permission', 'role-permission'] as const).map(k => <MenuItem key={k} value={k}>{t(`context.foundation.${k}`)}</MenuItem>)}
    </TextField>
    <TextField label={t('context.foundation.grantId')} value={grantId} onChange={e => setGrantId(e.target.value)} />
    <Button disabled={!ready || !grantId.trim()} onClick={() => void run(() => revokeIdentityGrant(kind, grantId.trim(), { reason: reason.trim() }))}>{t('context.foundation.revokeGrant')}</Button>
    {message && <Alert severity={failed ? 'error' : 'success'}>{message}</Alert>}
  </Box>;
}
