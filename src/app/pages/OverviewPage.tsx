import { Alert, Box, Chip, Container, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';

export function OverviewPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography component="h1" variant="h3">
              HidraWeb
            </Typography>
            <Chip label="HWEB-001" size="small" />
          </Stack>
          <Typography variant="h5">{t('bootstrap.title')}</Typography>
          <Typography color="text.secondary">{t('bootstrap.description')}</Typography>
          <Alert severity="info">{t('bootstrap.integrationNotice')}</Alert>
          <Typography variant="body2" color="text.secondary">
            API: {runtimeConfig.apiBaseUrl} · Auth mode: {runtimeConfig.authMode}
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
