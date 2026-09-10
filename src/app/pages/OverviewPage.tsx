import { Alert, Box, Chip, Container, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/app/auth/useAuth';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { usePermissions } from '@/features/permissions/usePermissions';

export function OverviewPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const permissions = usePermissions();

  const cards = [
    { label: t('overview.environment'), value: runtimeConfig.environment },
    { label: t('overview.authMode'), value: auth.mode },
    { label: t('overview.permissionRoutes'), value: String(permissions.routes.length) },
    { label: t('overview.backendModules'), value: String(permissions.modules.size) },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ alignItems: { xs: 'flex-start', md: 'center' }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="overline">HWEB-002</Typography>
          <Typography component="h1" variant="h4">{t('overview.title')}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>{t('overview.description')}</Typography>
        </Box>
        <Chip label={t('overview.shellReady')} />
      </Box>
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
