import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { AppBar, Avatar, Box, Chip, IconButton, InputAdornment, Link, ListSubheader, Menu, MenuItem, Select, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import { useId, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router';

import { useAuth } from '@/app/auth/useAuth';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { OperationalContextSelector } from '@/features/context/components/OperationalContextSelector';
import { useWebOriginConnectivity } from '@/features/connectivity/useWebOriginConnectivity';
import { usePermissions } from '@/features/permissions/usePermissions';
import { resolveHeaderShortcuts } from '@/shell/navbar/headerShortcutAccess';

interface HidraNavbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function HidraNavbar({ sidebarCollapsed, onToggleSidebar }: HidraNavbarProps) {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const permissions = usePermissions();
  const shortcuts = resolveHeaderShortcuts(permissions);
  const connectivity = useWebOriginConnectivity();
  const profileMenuId = useId();
  const profileButtonId = useId();
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const currentLanguage = (i18n.resolvedLanguage ?? i18n.language ?? 'fr').split('-')[0];

  const openProfile = (event: MouseEvent<HTMLElement>) => setProfileAnchor(event.currentTarget);
  const closeProfile = () => setProfileAnchor(null);

  return (
    <AppBar component="header" aria-label={t('shell.productHeader')} color="inherit" elevation={0} position="fixed" sx={{ borderBottom: 1, borderColor: 'divider', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ gap: { xs: 0.5, sm: 1.5 }, minHeight: '64px !important' }}>
        <Tooltip title={sidebarCollapsed ? t('shell.expandNavigation') : t('shell.collapseNavigation')}>
          <IconButton
            aria-controls="hidra-primary-navigation"
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? t('shell.expandNavigation') : t('shell.collapseNavigation')}
            edge="start"
            onClick={onToggleSidebar}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flexGrow: { xs: 1, md: 0 }, minWidth: { xs: 45, md: 220 } }}>
          <Link
            aria-label={t('shell.productHome')}
            component={RouterLink}
            sx={{ fontWeight: 800, lineHeight: 1.1 }}
            to="/overview"
            underline="hover"
            variant="h6"
          >
            Hidra
          </Link>
          <Typography color="text.secondary" noWrap sx={{ display: { xs: 'none', md: 'block' } }} variant="caption">
            Hydrocarbon Intelligence for Data, Risk, and Analytics
          </Typography>
        </Box>
        <Chip
          label={t('shell.configuredEnvironment', { environment: runtimeConfig.environment.toUpperCase() })}
          size="small"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          variant="outlined"
        />
        <OperationalContextSelector />
        <TextField
          disabled
          placeholder={t('shell.searchPlaceholder')}
          size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          sx={{ display: { xs: 'none', md: 'block' }, marginInlineStart: 'auto', width: { md: 190, xl: 280 } }}
        />
        <Tooltip title={t('shell.webConnectivity.help')}>
          <Chip
            aria-label={t('shell.webConnectivity.' + connectivity)}
            aria-live="polite"
            icon={connectivity === 'reachable' ? <WifiIcon /> : <WifiOffIcon />}
            label={t('shell.webConnectivity.' + connectivity)}
            role="status"
            size="small"
            sx={{ maxWidth: { xs: 120, sm: 'none' }, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
            variant="outlined"
          />
        </Tooltip>
        <Tooltip title={t('nav.tasks')}>
          <span>{shortcuts.tasks
            ? <IconButton aria-label={t('nav.tasks')} component={RouterLink} sx={{ display: { xs: 'none', md: 'inline-flex' } }} to="/work/tasks"><TaskAltIcon /></IconButton>
            : <IconButton aria-label={t('nav.tasks')} disabled sx={{ display: { xs: 'none', md: 'inline-flex' } }}><TaskAltIcon /></IconButton>}
          </span>
        </Tooltip>
        <Tooltip title={t('nav.notifications')}>
          <span>{shortcuts.notifications
            ? <IconButton aria-label={t('nav.notifications')} component={RouterLink} sx={{ display: { xs: 'none', md: 'inline-flex' } }} to="/work/notifications"><NotificationsNoneIcon /></IconButton>
            : <IconButton aria-label={t('nav.notifications')} disabled sx={{ display: { xs: 'none', md: 'inline-flex' } }}><NotificationsNoneIcon /></IconButton>}
          </span>
        </Tooltip>
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
          <IconButton
            aria-controls={profileAnchor ? profileMenuId : undefined}
            aria-expanded={Boolean(profileAnchor)}
            aria-haspopup="menu"
            aria-label={t('shell.profile')}
            id={profileButtonId}
            onClick={openProfile}
          >
            <Avatar sx={{ height: 32, width: 32 }}><AccountCircleIcon fontSize="small" /></Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={profileAnchor}
          onClose={closeProfile}
          open={Boolean(profileAnchor)}
          slotProps={{ list: { 'aria-labelledby': profileButtonId, id: profileMenuId } }}
        >
          <ListSubheader sx={{ lineHeight: 1.5, minWidth: 240, py: 1 }}>
            <Typography color="text.primary" sx={{ fontWeight: 600 }}>{auth.session?.principalLabel ?? t('shell.unknownPrincipal')}</Typography>
            {auth.session?.authenticationType ? (
              <Typography color="text.secondary" variant="caption">
                {t('shell.authenticationProvider', { provider: auth.session.authenticationType })}
              </Typography>
            ) : null}
          </ListSubheader>
          {auth.mode !== 'disabled' ? <MenuItem onClick={() => { closeProfile(); auth.signOut(); }}>{t('shell.signOut')}</MenuItem> : null}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
