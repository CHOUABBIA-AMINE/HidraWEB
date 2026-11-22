import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';

import { StatusPage } from '@/components/feedback/StatusPage';

/** Protected router failures are deliberately generic: no response body, URL, or record id. */
export function ShellRouteError() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 503;
  const denied = status === 401 || status === 403;
  const missing = status === 404;

  return (
    <Box component="main" id="hidra-main-content">
      <StatusPage
        code={denied ? '403' : missing ? '404' : '503'}
        title={denied ? t('status.forbidden.title') : missing ? t('status.notFound.title') : t('status.routeFailure.title')}
        description={denied
          ? t('status.forbidden.description')
          : missing ? t('status.notFound.description') : t('status.routeFailure.description')}
        actionLabel={t('status.returnOverview')}
        onAction={() => navigate('/overview', { replace: true })}
      />
    </Box>
  );
}
