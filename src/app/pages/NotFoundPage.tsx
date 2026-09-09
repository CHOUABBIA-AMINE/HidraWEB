import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { StatusPage } from '@/components/feedback/StatusPage';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <StatusPage
      actionLabel={t('status.returnOverview')}
      code="404"
      description={t('status.notFound.description')}
      onAction={() => navigate('/overview')}
      title={t('status.notFound.title')}
    />
  );
}
