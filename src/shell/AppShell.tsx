import { Box, Link, Toolbar } from '@mui/material';
import { Outlet, useLocation } from 'react-router';

import { AdministrationGovernanceNotice } from '@/features/administration';
import { ContextDrawerProvider } from '@/shell/context/ContextDrawerProvider';
import { ContextualDrawer } from '@/shell/context/ContextualDrawer';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { HidraNavbar } from '@/shell/navbar/HidraNavbar';
import { HidraSidebar } from '@/shell/sidebar/HidraSidebar';

const mainContentId = 'hidra-main-content';

function AppShellFrame() {
  const location = useLocation();
  const sidebarCollapsed = useShellUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useShellUiStore((state) => state.toggleSidebar);
  const administrationRoute = location.pathname.startsWith('/administration/');

  const focusMainContent = () => {
    document.getElementById(mainContentId)?.focus();
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', display: 'flex', minHeight: '100vh' }}>
      <Link
        href={`#${mainContentId}`}
        lang="en"
        onClick={focusMainContent}
        sx={{
          bgcolor: 'background.paper',
          left: 8,
          p: 1.5,
          position: 'fixed',
          top: 8,
          transform: 'translateY(-160%)',
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          '&:focus-visible': { transform: 'translateY(0)' },
        }}
      >
        Skip to main content
      </Link>
      <HidraNavbar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <HidraSidebar collapsed={sidebarCollapsed} />
      <Box component="main" id={mainContentId} tabIndex={-1} sx={{ flexGrow: 1, minWidth: 0 }}>
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
