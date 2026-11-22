import { Box, Link, Toolbar, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';

import { AdministrationGovernanceNotice } from '@/features/administration';
import { hidraTheme } from '@/design-system/theme/theme';
import { ContextDrawerProvider } from '@/shell/context/ContextDrawerProvider';
import { useNavigationContextKey, useProtectedWorkspaceKey } from '@/shell/navigation/useNavigationContextKey';
import { ContextualDrawer } from '@/shell/context/ContextualDrawer';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { HidraNavbar } from '@/shell/navbar/HidraNavbar';
import { HidraSidebar } from '@/shell/sidebar/HidraSidebar';

const mainContentId = 'hidra-main-content';

/**
 * Only the navigation chrome is keyed per authorized history entry.
 * Remounting it closes the mobile drawer and resets manual accordion state
 * without using effect-driven setState or unmounting active page forms.
 */
function ShellNavigation({ mobile }: { mobile: boolean }) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const sidebarCollapsed = useShellUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useShellUiStore((state) => state.toggleSidebar);
  const navigationExpanded = mobile ? mobileNavigationOpen : !sidebarCollapsed;
  const toggleNavigation = () => {
    if (mobile) setMobileNavigationOpen((open) => !open);
    else toggleSidebar();
  };

  return (
    <>
      <HidraNavbar onToggleSidebar={toggleNavigation} sidebarCollapsed={!navigationExpanded} />
      <HidraSidebar
        collapsed={!mobile && sidebarCollapsed}
        mobile={mobile}
        open={mobileNavigationOpen}
        onClose={() => setMobileNavigationOpen(false)}
      />
    </>
  );
}

function AppShellFrame() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigationKey = useNavigationContextKey();
  const workspaceKey = useProtectedWorkspaceKey();
  const mobile = useMediaQuery(hidraTheme.breakpoints.down('md'));
  const administrationRoute = location.pathname.startsWith('/administration/');

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
      <ShellNavigation key={`${navigationKey}:${mobile ? 'mobile' : 'desktop'}`} mobile={mobile} />
      {/* Keep the authoring workspace mounted across same-path query changes.
          Only a new protected path/principal/scope/grant set discards its state. */}
      <ContextDrawerProvider key={workspaceKey}>
        <Box component="main" aria-label={t('shell.workspace')} id={mainContentId} tabIndex={-1} sx={{ flexGrow: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
          <Toolbar sx={{ minHeight: '64px !important' }} />
          {administrationRoute ? <AdministrationGovernanceNotice /> : null}
          <Outlet />
        </Box>
        <ContextualDrawer />
      </ContextDrawerProvider>
    </Box>
  );
}

export function AppShell() {
  // Never key the entire shell to a history entry: authoring and tabbed pages
  // legitimately replace URL query parameters without leaving their route.
  return <AppShellFrame />;
}
