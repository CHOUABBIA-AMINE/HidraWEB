import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router';

import { ContextDrawerProvider } from '@/shell/context/ContextDrawerProvider';
import { ContextualDrawer } from '@/shell/context/ContextualDrawer';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { HidraNavbar } from '@/shell/navbar/HidraNavbar';
import { HidraSidebar } from '@/shell/sidebar/HidraSidebar';

function AppShellFrame() {
  const sidebarCollapsed = useShellUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useShellUiStore((state) => state.toggleSidebar);

  return (
    <Box sx={{ bgcolor: 'grey.50', display: 'flex', minHeight: '100vh' }}>
      <HidraNavbar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <HidraSidebar collapsed={sidebarCollapsed} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <Outlet />
      </Box>
      <ContextualDrawer />
    </Box>
  );
}

export function AppShell() {
  return <ContextDrawerProvider><AppShellFrame /></ContextDrawerProvider>;
}
