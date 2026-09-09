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
    return <Box aria-label={t('permissions.loading')} sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}><CircularProgress /></Box>;
  }

  if (permissions.status === 'error') {
    if (permissions.error?.status === 403) {
      return (
        <StatusPage
          actionLabel={t('status.returnOverview')}
          code="403"
          description={t('status.forbidden.description')}
          onAction={() => navigate('/overview')}
          title={t('status.forbidden.title')}
        />
      );
    }

    return (
      <StatusPage
        actionLabel={t('status.retry')}
        code={permissions.error?.status ? String(permissions.error.status) : '503'}
        description={t('permissions.unavailable')}
        detail={permissions.error?.correlationId ? t('status.correlation', { id: permissions.error.correlationId }) : undefined}
        onAction={() => { void permissions.reload(); }}
        title={t('permissions.failureTitle')}
      />
    );
  }

  return children;
}
