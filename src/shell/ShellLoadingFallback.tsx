import { Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** The protected shell is lazy: show a named status, never an empty viewport. */
export function ShellLoadingFallback() {
  const { t } = useTranslation();

  return (
    <Box component="main" aria-busy="true" sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}>
      <Box role="status" aria-live="polite" sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
        <CircularProgress aria-hidden="true" size={28} />
        {t('shell.loadingWorkspace')}
      </Box>
    </Box>
  );
}
