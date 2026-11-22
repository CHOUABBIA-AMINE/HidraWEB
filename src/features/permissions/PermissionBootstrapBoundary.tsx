import { Box, CircularProgress } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { StatusPage } from '@/components/feedback/StatusPage';
import { usePermissions } from '@/features/permissions/usePermissions';

export function PermissionBootstrapBoundary({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const navigate = useNavigate();

  if (permissions.status === 'idle' || permissions.status === 'loading') {
    return (
      <Box component="main" sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}>
        <Box role="status" aria-live="polite" sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
          <CircularProgress aria-hidden="true" size={28} />
          {t('permissions.loading')}
        </Box>
      </Box>
    );
  }

  if (permissions.status === 'error') {
    if (permissions.error?.status === 403) {
      return (
        <Box component="main" id="hidra-main-content">
          <StatusPage
          actionLabel={t('status.returnOverview')}
          code="403"
          description={t('status.forbidden.description')}
          onAction={() => navigate('/overview')}
          title={t('status.forbidden.title')}
          />
        </Box>
      );
    }

    return (
      <Box component="main" id="hidra-main-content">
        <StatusPage
        actionLabel={t('status.retry')}
        code={permissions.error?.status ? String(permissions.error.status) : '503'}
        description={t('permissions.unavailable')}
        detail={permissions.error?.correlationId ? t('status.correlation', { id: permissions.error.correlationId }) : undefined}
        onAction={() => { void permissions.reload(); }}
        title={t('permissions.failureTitle')}
        />
      </Box>
    );
  }

  return children;
}
