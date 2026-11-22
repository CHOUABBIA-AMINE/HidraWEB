import { Box, Link, Toolbar, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';

import { AdministrationGovernanceNotice } from '@/features/administration';
import { hidraTheme } from '@/design-system/theme/theme';
import { ContextDrawerProvider } from '@/shell/context/ContextDrawerProvider';
import { ContextualDrawer } from '@/shell/context/ContextualDrawer';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { HidraNavbar } from '@/shell/navbar/HidraNavbar';
import { HidraSidebar } from '@/shell/sidebar/HidraSidebar';

const mainContentId = 'hidra-main-content';

function AppShellFrame() {
  const { t } = useTranslation();
  const location = useLocation();
  const mobile = useMediaQuery(hidraTheme.breakpoints.down('md'));
  // Record the route entry on which the mobile drawer was opened.
  // A route change closes it by derivation; no effect-driven setState is needed.
  const [mobileNavigationRoute, setMobileNavigationRoute] = useState<string | null>(null);
  const mobileNavigationOpen = mobileNavigationRoute === location.key;
  const sidebarCollapsed = useShellUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useShellUiStore((state) => state.toggleSidebar);
  const administrationRoute = location.pathname.startsWith('/administration/');

  const navigationExpanded = mobile ? mobileNavigationOpen : !sidebarCollapsed;
  const toggleNavigation = () => {
    if (mobile) setMobileNavigationRoute((key) => key === location.key ? null : location.key);
    else toggleSidebar();
  };

  const focusMainContent = () => {
    document.getElementById(mainContentId)?.focus();
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', display: 'flex', minHeight: '100vh' }}>
      <Link
        href={`#${mainContentId}`}
        onClick={focusMainContent}
        sx={{
          bgcolor: 'background.paper',
          insetInlineStart: 8,
          p: 1.5,
          position: 'fixed',
          top: 8,
          transform: 'translateY(-160%)',
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          '&:focus-visible': { transform: 'translateY(0)' },
        }}
      >
        {t('shell.skipToMain')}
      </Link>
      <HidraNavbar onToggleSidebar={toggleNavigation} sidebarCollapsed={!navigationExpanded} />
      <HidraSidebar
        collapsed={!mobile && sidebarCollapsed}
        mobile={mobile}
        open={mobileNavigationOpen}
        onClose={() => setMobileNavigationRoute(null)}
      />
      <Box component="main" id={mainContentId} tabIndex={-1} sx={{ flexGrow: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
        <Toolbar sx={{ minHeight: '64px !important' }} />
        {administrationRoute ? <AdministrationGovernanceNotice /> : null}
        <Outlet />
      </Box>
      <ContextualDrawer />
    </Box>
  );
}

export function AppShell() {
  return <ContextDrawerProvider><AppShellFrame /></ContextDrawerProvider>;
}
