import { Alert, Box, Container, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IdentityAccessCommandPanel } from '@/features/context/components/IdentityAccessCommandPanel';
import { IdentityAccessWorkspace } from '@/features/context/components/IdentityAccessWorkspace';
import { IdentityCommandPanel } from '@/features/context/components/IdentityCommandPanel';

type IdentityResource = 'users' | 'roles' | 'permissions';

export function IdentityAdministrationPage() {
  const { t } = useTranslation();
  const [resource, setResource] = useState<IdentityResource>('users');

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography color="text.secondary" variant="overline">HWEB-004</Typography>
      <Typography component="h1" variant="h4">{t('context.identity.title')}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>{t('context.identity.subtitle')}</Typography>

      <Alert severity="info" sx={{ mt: 2 }}>{t('context.identity.contractNotice')}</Alert>

      <Box sx={{ mt: 2 }}><IdentityCommandPanel /></Box>
      <Box sx={{ mt: 2 }}><IdentityAccessCommandPanel /></Box>

      <Box sx={{ mt: 3 }}>
        <Tabs
          aria-label={t('context.identity.workspaceTabs')}
          onChange={(_, value: IdentityResource) => setResource(value)}
          value={resource}
          variant="scrollable"
        >
          <Tab label={t('context.identity.users')} value="users" />
          <Tab label={t('context.identity.roles')} value="roles" />
          <Tab label={t('context.identity.permissions')} value="permissions" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        <IdentityAccessWorkspace resource={resource} />
      </Box>
    </Container>
  );
}
