import { Alert, Box, Container, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FixedResourceWorkspace } from '@/features/context/components/FixedResourceWorkspace';
import { OrganizationCommandPanel } from '@/features/context/components/OrganizationCommandPanel';

const RESOURCES = ['organization-units', 'employees', 'employee-assignments'] as const;
type OrganizationResource = (typeof RESOURCES)[number];

export function OrganizationAdministrationPage() {
  const { t } = useTranslation();
  const [resource, setResource] = useState<OrganizationResource>('organization-units');

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography color="text.secondary" variant="overline">HWEB-004</Typography>
      <Typography component="h1" variant="h4">{t('context.organization.title')}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>{t('context.organization.subtitle')}</Typography>

      <Alert severity="info" sx={{ mt: 2 }}>{t('context.organization.contractNotice')}</Alert>

      <Box sx={{ mt: 2 }}><OrganizationCommandPanel /></Box>

      <Box sx={{ mt: 3 }}>
        <Tabs
          aria-label={t('context.organization.workspaceTabs')}
          onChange={(_, value: OrganizationResource) => setResource(value)}
          value={resource}
          variant="scrollable"
        >
          <Tab label={t('context.organization.units')} value="organization-units" />
          <Tab label={t('context.organization.employees')} value="employees" />
          <Tab label={t('context.organization.assignments')} value="employee-assignments" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {resource === 'organization-units' ? <FixedResourceWorkspace module="organization" resource="organization-units" title={t('context.organization.units')} description={t('context.organization.unitsDescription')} /> : null}
        {resource === 'employees' ? <FixedResourceWorkspace module="organization" resource="employees" title={t('context.organization.employees')} description={t('context.organization.employeesDescription')} /> : null}
        {resource === 'employee-assignments' ? <FixedResourceWorkspace module="organization" resource="employee-assignments" title={t('context.organization.assignments')} description={t('context.organization.assignmentsDescription')} /> : null}
      </Box>
    </Container>
  );
}
