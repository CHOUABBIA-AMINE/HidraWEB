import { Alert, Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '@/app/auth/useAuth';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { StatusPage } from '@/components/feedback/StatusPage';

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const location = useLocation();
  const state = location.state as LoginLocationState | null;
  const destination = state?.from && state.from !== '/login' ? state.from : '/overview';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (auth.status === 'authenticated') {
    return <Navigate replace to={destination} />;
  }

  if (auth.mode === 'jwt') {
    return (
      <StatusPage
        code="401"
        description={t('auth.jwt.description')}
        detail={t('auth.jwt.contract')}
        title={t('auth.jwt.title')}
      />
    );
  }

  if (auth.mode === 'disabled') {
    return <Navigate replace to={destination} />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await auth.authenticateBasic(username, password);
    } catch {
      // AuthProvider owns the normalized error state displayed below.
    }
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', display: 'grid', minHeight: '100vh', placeItems: 'center', p: 3 }}>
      <Paper component="main" elevation={1} sx={{ width: 'min(100%, 440px)', p: { xs: 3, md: 5 } }}>
        <Typography color="primary" fontWeight={700} variant="overline">HIDRA</Typography>
        <Typography component="h1" sx={{ mt: 1 }} variant="h4">{t('auth.basic.title')}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>{t('auth.basic.description')}</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mt: 4 }}>
          <TextField
            autoComplete="username"
            autoFocus
            label={t('auth.basic.username')}
            onChange={(event) => setUsername(event.target.value)}
            required
            value={username}
          />
          <TextField
            autoComplete="current-password"
            label={t('auth.basic.password')}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          {auth.error ? <Alert severity="error">{auth.error}</Alert> : null}
          <Button disabled={auth.status === 'checking'} type="submit" variant="contained">
            {auth.status === 'checking' ? <CircularProgress size={22} /> : t('auth.basic.submit')}
          </Button>
        </Box>
        <Typography color="text.secondary" sx={{ mt: 3 }} variant="caption">
          {t('auth.basic.runtime', { environment: runtimeConfig.environment })}
        </Typography>
      </Paper>
    </Box>
  );
}
