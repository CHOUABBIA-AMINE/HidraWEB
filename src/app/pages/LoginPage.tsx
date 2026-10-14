import { Alert, Box, Button, CircularProgress, Divider, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '@/app/auth/useAuth';
import { runtimeConfig, type HidraCredentialProvider } from '@/app/bootstrap/runtimeConfig';

interface LoginLocationState {
  from?: string;
}

const CREDENTIAL_PROVIDER_LABELS: Record<HidraCredentialProvider, string> = {
  LOCAL: 'Hidra Local',
  LDAP: 'LDAP',
  ACTIVE_DIRECTORY: 'Active Directory',
};

function isCredentialProvider(value: string): value is HidraCredentialProvider {
  return value === 'LOCAL' || value === 'LDAP' || value === 'ACTIVE_DIRECTORY';
}

export function LoginPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const location = useLocation();
  const state = location.state as LoginLocationState | null;
  const destination = state?.from && state.from !== '/login' ? state.from : '/overview';
  const credentialProviders = auth.mode === 'multi'
    ? auth.enabledAuthProviders.filter(isCredentialProvider)
    : auth.mode === 'basic' ? [auth.credentialProvider] : [];
  const oidcEnabled = auth.mode === 'jwt' || (auth.mode === 'multi' && auth.enabledAuthProviders.includes('OIDC'));
  const [selectedProvider, setSelectedProvider] = useState<HidraCredentialProvider>(
    credentialProviders[0] ?? auth.credentialProvider,
  );
  const effectiveProvider = credentialProviders.includes(selectedProvider)
    ? selectedProvider : credentialProviders[0];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (auth.status === 'authenticated') return <Navigate replace to={destination} />;
  if (auth.mode === 'disabled') return <Navigate replace to={destination} />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!effectiveProvider || auth.status === 'checking') return;
    try {
      await auth.authenticateCredentials(effectiveProvider, username, password);
    } catch {
      // AuthProvider owns the error state displayed below.
    }
  };

  const beginEnterpriseSignIn = async () => {
    try {
      await auth.beginOidcSignIn(destination);
    } catch {
      // AuthProvider owns the error state displayed below.
    }
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', display: 'grid', minHeight: '100vh', placeItems: 'center', p: 3 }}>
      <Paper component="main" elevation={1} sx={{ width: 'min(100%, 480px)', p: { xs: 3, md: 5 } }}>
        <Typography color="primary" sx={{ fontWeight: 700 }} variant="overline">HIDRA</Typography>
        <Typography component="h1" sx={{ mt: 1 }} variant="h4">
          {auth.mode === 'multi' ? t('auth.multi.title')
            : auth.mode === 'jwt' ? t('auth.jwt.title')
              : CREDENTIAL_PROVIDER_LABELS[auth.credentialProvider]}
        </Typography>
        {auth.mode === 'multi' ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>{t('auth.multi.description')}</Typography>
        ) : auth.mode === 'jwt' ? (
          <>
            <Typography color="text.secondary" sx={{ mt: 1 }}>{t('auth.jwt.description')}</Typography>
            <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">{t('auth.jwt.contract')}</Typography>
          </>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">{auth.credentialProvider}</Typography>
        )}

        {credentialProviders.length > 0 ? (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mt: 4 }}>
            {auth.mode === 'multi' && credentialProviders.length > 1 ? (
              <TextField
                label={t('auth.multi.provider')}
                onChange={(event) => {
                  const candidate = event.target.value;
                  if (!isCredentialProvider(candidate) || !credentialProviders.includes(candidate)) return;
                  setSelectedProvider(candidate);
                  setPassword('');
                }}
                select
                value={effectiveProvider}
              >
                {credentialProviders.map((provider) => (
                  <MenuItem key={provider} value={provider}>{CREDENTIAL_PROVIDER_LABELS[provider]}</MenuItem>
                ))}
              </TextField>
            ) : auth.mode === 'multi' ? (
              <Typography color="text.secondary" variant="body2">
                {effectiveProvider ? CREDENTIAL_PROVIDER_LABELS[effectiveProvider] : null}
              </Typography>
            ) : null}
            <TextField autoComplete="username" autoFocus label={t('auth.basic.username')} onChange={(event) => setUsername(event.target.value)} required value={username} />
            <TextField autoComplete="current-password" label={t('auth.basic.password')} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            <Button disabled={auth.status === 'checking'} type="submit" variant="contained">
              {auth.status === 'checking' ? <CircularProgress size={22} /> : t('auth.basic.submit')}
            </Button>
          </Box>
        ) : null}
        {oidcEnabled ? (
          <>
            {credentialProviders.length > 0 ? <Divider sx={{ mt: 3 }}>{t('auth.multi.or')}</Divider> : null}
            <Button
              disabled={auth.status === 'checking'}
              fullWidth
              onClick={() => void beginEnterpriseSignIn()}
              sx={{ mt: credentialProviders.length > 0 ? 2 : 4 }}
              variant={credentialProviders.length > 0 ? 'outlined' : 'contained'}
            >
              {auth.status === 'checking' ? <CircularProgress size={22} />
                : t('auth.jwt.submit', { defaultValue: 'Sign in with enterprise identity' })}
            </Button>
          </>
        ) : null}
        {auth.error ? <Alert severity="error" sx={{ mt: 2 }}>{auth.error}</Alert> : null}
        <Typography color="text.secondary" sx={{ mt: 3 }} variant="caption">
          {t('auth.basic.runtime', { environment: runtimeConfig.environment })}
        </Typography>
      </Paper>
    </Box>
  );
}
