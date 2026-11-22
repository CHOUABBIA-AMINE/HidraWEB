import { Alert, Box, Chip, Container, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useAuth } from '@/app/auth/useAuth';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { usePermissions } from '@/features/permissions/usePermissions';
import { WORKBENCH_PERMISSIONS } from '@/features/workbench/api/workbenchPermissions';
import { formatDisplayNumber } from '@/shared/i18n/localePresentation';
import { WorkspaceHeading } from '@/shell/workspace/WorkspaceHeading';

export function OverviewPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const permissions = usePermissions();

  const cards = [
    { label: t('overview.environment'), value: runtimeConfig.environment },
    { label: t('overview.authMode'), value: auth.mode },
    { label: t('overview.permissionRoutes'), value: formatDisplayNumber(permissions.routes.length, i18n.language) },
    { label: t('overview.backendModules'), value: formatDisplayNumber(permissions.modules.size, i18n.language) },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <WorkspaceHeading
        breadcrumbsLabel={t('shell.workspace')}
        breadcrumbs={[{ label: t('nav.overview') }]}
        eyebrow="HWEB-002 / HWEB-003"
        title={t('overview.title')}
        description={t('overview.description')}
        accessory={<Chip label={t('overview.shellReady')} />}
        actions={[{
          id: 'open-workbench',
          label: t('workbench.open'),
          permitted: permissions.status === 'ready' && permissions.can(WORKBENCH_PERMISSIONS.modulesRead),
          onClick: () => navigate('/workbench'),
        }]}
      />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, mt: 4 }}>
        {cards.map((card) => (
          <Paper key={card.label} variant="outlined" sx={{ p: 2.5 }}>
            <Typography color="text.secondary" variant="body2">{card.label}</Typography>
            <Typography sx={{ mt: 0.5 }} variant="h5">{card.value}</Typography>
          </Paper>
        ))}
      </Box>
      <Alert severity="info" sx={{ mt: 3 }}>
        {permissions.catalogOnly ? t('overview.catalogOnlyNotice') : t('overview.backendAuthorizationNotice')}
      </Alert>
      <Alert severity="warning" sx={{ mt: 2 }}>{t('overview.principalGapNotice')}</Alert>
    </Container>
  );
}
