import CloseIcon from '@mui/icons-material/Close';
import { Box, Divider, Drawer, IconButton, Typography } from '@mui/material';
import { useId, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ContextInspectorProps {
  open: boolean;
  title?: string;
  children?: ReactNode;
  onClose: () => void;
}

/**
 * Read-only inspector frame. Owning views are responsible for verifying a
 * currently authorized selection and loading their exact owner detail.
 * MUI's temporary modal drawer traps focus and restores it to the invoker
 * on keyboard Escape, backdrop dismissal or close-button action.
 */
export function ContextInspector({ open, title, children, onClose }: ContextInspectorProps) {
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Drawer
      anchor={i18n.dir() === 'rtl' ? 'left' : 'right'}
      onClose={onClose}
      open={open}
      variant="temporary"
      slotProps={{
        // MUI's modal focus trap initially focuses the drawer container.
        // Once its slide transition has entered, move focus to the explicit
        // Close action without disabling focus containment or restoration.
        transition: {
          onEntered: () => closeButtonRef.current?.focus(),
        },
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          sx: {
            height: 'calc(100% - 64px)',
            top: 64,
            width: { xs: '100%', sm: 420 },
            maxWidth: '100%',
          },
        },
      }}
    >
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', minHeight: 64, gap: 1, px: 2 }}>
        <Typography component="h2" id={titleId} sx={{ minWidth: 0, overflowWrap: 'anywhere' }} variant="h6">
          {title ?? t('shell.contextDrawer')}
        </Typography>
        <IconButton aria-label={t('shell.closeDrawer')} onClick={onClose} ref={closeButtonRef}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
        {open ? children : null}
      </Box>
    </Drawer>
  );
}
