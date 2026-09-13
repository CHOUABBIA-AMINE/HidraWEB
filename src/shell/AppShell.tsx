import { Box, Toolbar } from '@mui/material';
import { Outlet, useLocation } from 'react-router';

import { AdministrationGovernanceNotice } from '@/features/administration';
import { ContextDrawerProvider } from '@/shell/context/ContextDrawerProvider';
import { ContextualDrawer } from '@/shell/context/ContextualDrawer';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { HidraNavbar } from '@/shell/navbar/HidraNavbar';
import { HidraSidebar } from '@/shell/sidebar/HidraSidebar';

function AppShellFrame() {
  const location = useLocation();
  const sidebarCollapsed = useShellUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useShellUiStore((state) => state.toggleSidebar);
  const administrationRoute = location.pathname.startsWith('/administration/');

  return (
    <Box sx={{ bgcolor: 'grey.50', display: 'flex', minHeight: '100vh' }}>
      <HidraNavbar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <HidraSidebar collapsed={sidebarCollapsed} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
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
