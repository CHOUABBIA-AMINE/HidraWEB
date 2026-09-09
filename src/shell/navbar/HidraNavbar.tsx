import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { AppBar, Avatar, Box, Chip, Divider, IconButton, InputAdornment, Menu, MenuItem, Select, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/app/auth/useAuth';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { useRealtimeStatus } from '@/features/realtime/RealtimeProvider';

interface HidraNavbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function HidraNavbar({ sidebarCollapsed, onToggleSidebar }: HidraNavbarProps) {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const realtime = useRealtimeStatus();
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const currentLanguage = (i18n.resolvedLanguage ?? i18n.language ?? 'fr').split('-')[0];

  const openProfile = (event: MouseEvent<HTMLElement>) => setProfileAnchor(event.currentTarget);
  const closeProfile = () => setProfileAnchor(null);

  return (
    <AppBar color="inherit" elevation={0} position="fixed" sx={{ borderBottom: 1, borderColor: 'divider', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ gap: 1.5, minHeight: '64px !important' }}>
        <Tooltip title={sidebarCollapsed ? t('shell.expandNavigation') : t('shell.collapseNavigation')}>
          <IconButton
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? t('shell.expandNavigation') : t('shell.collapseNavigation')}
            edge="start"
            onClick={onToggleSidebar}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ minWidth: { xs: 96, md: 220 } }}>
          <Typography color="primary" fontWeight={800} lineHeight={1.1} variant="h6">Hidra</Typography>
          <Typography color="text.secondary" noWrap sx={{ display: { xs: 'none', md: 'block' } }} variant="caption">
            Hydrocarbon Intelligence for Data, Risk, and Analytics
          </Typography>
        </Box>
        <Chip label={runtimeConfig.environment.toUpperCase()} size="small" variant="outlined" />
        <Chip label={t('shell.operationalContextPlaceholder')} size="small" sx={{ display: { xs: 'none', lg: 'inline-flex' } }} variant="outlined" />
        <TextField
          disabled
          placeholder={t('shell.searchPlaceholder')}
          size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          sx={{ display: { xs: 'none', md: 'block' }, ml: 'auto', width: { md: 190, xl: 280 } }}
        />
        <Tooltip title={t('shell.realtimeUnavailable')}>
          <Chip icon={<WifiOffIcon />} label={realtime === 'not-connected' ? t('shell.realtimeOffline') : realtime} size="small" variant="outlined" />
        </Tooltip>
        <Tooltip title={t('nav.tasks')}><span><IconButton aria-label={t('nav.tasks')} disabled><TaskAltIcon /></IconButton></span></Tooltip>
        <Tooltip title={t('nav.notifications')}><span><IconButton aria-label={t('nav.notifications')} disabled><NotificationsNoneIcon /></IconButton></span></Tooltip>
        <Select
          aria-label={t('shell.language')}
          onChange={(event) => { void i18n.changeLanguage(String(event.target.value)); }}
          size="small"
          value={currentLanguage}
        >
          <MenuItem value="fr">FR</MenuItem>
          <MenuItem value="en">EN</MenuItem>
          <MenuItem value="ar">AR</MenuItem>
        </Select>
        <Tooltip title={t('shell.profile')}>
          <IconButton aria-label={t('shell.profile')} onClick={openProfile}>
            <Avatar sx={{ height: 32, width: 32 }}><AccountCircleIcon fontSize="small" /></Avatar>
          </IconButton>
        </Tooltip>
        <Menu anchorEl={profileAnchor} onClose={closeProfile} open={Boolean(profileAnchor)}>
          <Box sx={{ minWidth: 240, px: 2, py: 1 }}>
            <Typography fontWeight={600}>{auth.session?.principalLabel ?? t('shell.unknownPrincipal')}</Typography>
            <Typography color="text.secondary" variant="caption">{t('shell.authMode', { mode: auth.mode })}</Typography>
          </Box>
          <Divider />
          <MenuItem disabled>{t('shell.profileUnavailable')}</MenuItem>
          {auth.mode !== 'disabled' ? <MenuItem onClick={() => { closeProfile(); auth.signOut(); }}>{t('shell.signOut')}</MenuItem> : null}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
