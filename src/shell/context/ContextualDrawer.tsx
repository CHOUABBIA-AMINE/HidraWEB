import CloseIcon from '@mui/icons-material/Close';
import { Box, Divider, Drawer, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useContextDrawer } from '@/shell/context/useContextDrawer';

export function ContextualDrawer() {
  const { t } = useTranslation();
  const drawer = useContextDrawer();

  return (
    <Drawer
      anchor="right"
      onClose={drawer.closeDrawer}
      open={drawer.open}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
    >
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', minHeight: 64, px: 2 }}>
        <Typography component="h2" variant="h6">{drawer.title ?? t('shell.contextDrawer')}</Typography>
        <IconButton aria-label={t('shell.closeDrawer')} onClick={drawer.closeDrawer}><CloseIcon /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ overflow: 'auto', p: 2 }}>{drawer.content}</Box>
    </Drawer>
  );
}
