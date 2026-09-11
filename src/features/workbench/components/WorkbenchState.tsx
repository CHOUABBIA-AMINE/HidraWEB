import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';

export function WorkbenchLoadingState({ label }: { label: string }) {
  return (
    <Box aria-live="polite" role="status" sx={{ alignItems: 'center', display: 'flex', gap: 1.5, justifyContent: 'center', minHeight: 180 }}>
      <CircularProgress size={28} />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

export function WorkbenchEmptyState({ message }: { message: string }) {
  return (
    <Paper role="status" variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="text.secondary">{message}</Typography>
    </Paper>
  );
}

interface WorkbenchErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

export function WorkbenchErrorState({ error, onRetry }: WorkbenchErrorStateProps) {
  const { t } = useTranslation();
  const normalized = normalizeHidraApiError(error);

  let title = t('workbench.errors.generic');
  let detail = normalized.message;
  if (normalized.status === 400) {
    title = t('workbench.errors.badRequest');
    detail = t('workbench.errors.badRequestDetail');
  } else if (normalized.status === 403) {
    title = t('workbench.errors.forbidden');
    detail = t('workbench.errors.forbiddenDetail');
  } else if (normalized.status === 404) {
    title = t('workbench.errors.notFound');
    detail = t('workbench.errors.notFoundDetail');
  } else if (normalized.status && normalized.status >= 500) {
    title = t('workbench.errors.server');
    detail = t('workbench.errors.serverDetail');
  }

  return (
    <Alert
      action={onRetry ? <Button color="inherit" onClick={onRetry} size="small">{t('status.retry')}</Button> : undefined}
      severity={normalized.status === 403 ? 'warning' : 'error'}
    >
      <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      <Typography variant="body2">{detail}</Typography>
      {normalized.correlationId ? <Typography variant="caption">{t('status.correlation', { id: normalized.correlationId })}</Typography> : null}
    </Alert>
  );
}
