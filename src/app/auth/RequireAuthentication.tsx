import { Box, CircularProgress } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '@/app/auth/useAuth';

export function RequireAuthentication({ children }: PropsWithChildren) {
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (auth.status === 'checking') {
    return (
      <Box component="main" sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}>
        <Box role="status" aria-live="polite" sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
          <CircularProgress aria-hidden="true" size={28} />
          {t('shell.checkingAuthentication')}
        </Box>
      </Box>
    );
  }

  if (auth.status !== 'authenticated') {
    return (
      <Navigate
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
        to="/login"
      />
    );
  }

  return children;
}
