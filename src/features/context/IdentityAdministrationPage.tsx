import { Alert, Box, Container, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IdentityCommandPanel } from '@/features/context/components/IdentityCommandPanel';
import { FixedResourceWorkspace } from '@/features/context/components/FixedResourceWorkspace';

const RESOURCES = ['users', 'roles', 'permissions'] as const;
type IdentityResource = (typeof RESOURCES)[number];

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
        {resource === 'users' ? <FixedResourceWorkspace module="identity" resource="users" title={t('context.identity.users')} description={t('context.identity.usersDescription')} /> : null}
        {resource === 'roles' ? <FixedResourceWorkspace module="identity" resource="roles" title={t('context.identity.roles')} description={t('context.identity.readOnlyDescription')} /> : null}
        {resource === 'permissions' ? <FixedResourceWorkspace module="identity" resource="permissions" title={t('context.identity.permissions')} description={t('context.identity.readOnlyDescription')} /> : null}
      </Box>
    </Container>
  );
}
