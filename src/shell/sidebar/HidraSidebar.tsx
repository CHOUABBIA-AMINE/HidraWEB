import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import EngineeringIcon from '@mui/icons-material/Engineering';
import EventIcon from '@mui/icons-material/Event';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HubIcon from '@mui/icons-material/Hub';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsightsIcon from '@mui/icons-material/Insights';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PaidIcon from '@mui/icons-material/Paid';
import PeopleIcon from '@mui/icons-material/People';
import ScienceIcon from '@mui/icons-material/Science';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Collapse, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { usePermissions } from '@/features/permissions/usePermissions';
import { useNavigationContextKey } from '@/shell/navigation/useNavigationContextKey';
import {
  authorizedNavigationSections,
  navigationSectionForPath,
  navigationSections,
  type NavigationIconKey,
  type NavigationItem,
} from '@/shell/navigation/navigationRegistry';

const expandedWidth = 272;
const collapsedWidth = 72;

function iconFor(key: NavigationIconKey): ReactElement {
  const icons: Record<NavigationIconKey, ReactElement> = {
    overview: <SpeedIcon />, network: <AccountTreeIcon />, operations: <InsightsIcon />, alarms: <NotificationsActiveIcon />,
    events: <WarningAmberIcon />, planning: <EventIcon />, engineering: <EngineeringIcon />, custody: <PaidIcon />,
    risk: <SecurityIcon />, analytics: <AnalyticsIcon />, simulation: <ScienceIcon />, reports: <AssessmentIcon />,
    tasks: <AssignmentIcon />, notifications: <NotificationsIcon />, organization: <BusinessIcon />, identity: <PeopleIcon />,
    configuration: <SettingsIcon />, audit: <FactCheckIcon />, documents: <DescriptionIcon />, integrations: <IntegrationInstructionsIcon />,
  };
  return icons[key] ?? <HubIcon />;
}

interface HidraSidebarProps {
  collapsed: boolean;
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

const groupIcons: Record<string, NavigationIconKey> = {
  operations: 'operations',
  engineering: 'engineering',
  intelligence: 'analytics',
  work: 'tasks',
  administration: 'identity',
};

export function HidraSidebar({ collapsed, mobile = false, open = false, onClose }: HidraSidebarProps) {
  const { t, i18n } = useTranslation();
  const permissions = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationKey = useNavigationContextKey();
  const width = collapsed ? collapsedWidth : expandedWidth;

  // A group exists only if it contains an authorized destination. Never expose
  // inaccessible child counts or inherited capabilities through the sidebar.
  const visibleSections = authorizedNavigationSections(navigationSections, permissions.modules);
  const activeSection = navigationSectionForPath(visibleSections, location.pathname);
  // Manual expansion applies only to the current authorized history entry.
  // Back/Forward, scope switching and grant changes re-derive active ancestors.
  const [requestedGroup, setRequestedGroup] = useState<{ key: string; id: string } | null>(null);
  const [requestedSubmenu, setRequestedSubmenu] = useState<{ key: string; open: boolean } | null>(null);
  const visibleGroupIds = new Set(visibleSections.filter((section) => section.id !== 'root').map((section) => section.id));
  const defaultGroup = activeSection !== 'root' && activeSection && visibleGroupIds.has(activeSection)
    ? activeSection
    : visibleGroupIds.has('operations') ? 'operations' : visibleSections.find((section) => section.id !== 'root')?.id;
  // Empty string deliberately means "all closed"; at most one group can open.
  const manualGroup = requestedGroup?.key === navigationKey ? requestedGroup.id : null;
  const expandedGroup = manualGroup === '' ? undefined
    : manualGroup !== null && visibleGroupIds.has(manualGroup) ? manualGroup : defaultGroup;

  const goTo = (item: NavigationItem) => {
    if (!item.implemented) return;
    // The next history entry selects its authorized ancestor automatically.
    if (mobile) onClose?.();
    void navigate(item.path);
  };

  const renderDestination = (item: NavigationItem, sectionId: string, descendant = false) => {
    const label = t(item.labelKey);
    const selected = item.implemented && location.pathname === item.path;
    const plannedTitle = t('nav.planned', { task: item.deliveryTask });
    const children = item.children ?? [];
    const hasSubmenu = children.length > 0;
    const routeInSubmenu = children.some((child) => child.implemented && child.path === location.pathname);
    const submenuOpen = requestedSubmenu?.key === navigationKey ? requestedSubmenu.open : routeInSubmenu;

    const destination = (
      <ListItemButton
        aria-current={selected ? 'page' : undefined}
        aria-label={label}
        disabled={!item.implemented}
        onClick={item.implemented ? () => goTo(item) : undefined}
        selected={selected}
        sx={{
          minHeight: 46,
          minWidth: 0,
          px: descendant ? 2 : collapsed ? 2.5 : 2,
          ...(descendant ? { paddingInlineStart: 6 } : {}),
        }}
      >
        {!descendant ? (
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
            {iconFor(item.icon)}
          </ListItemIcon>
        ) : null}
        {descendant || !collapsed ? (
          <ListItemText primary={label} secondary={!item.implemented ? item.deliveryTask : undefined} />
        ) : null}
      </ListItemButton>
    );

    return (
      <Box key={item.id}>
        <Box sx={{ alignItems: 'center', display: 'flex' }}>
          <Tooltip
            placement={i18n.dir() === 'rtl' ? 'left' : 'right'}
            title={collapsed ? `${label} · ${item.implemented ? '' : plannedTitle}` : (!item.implemented ? plannedTitle : '')}
          >
            <Box sx={{ display: 'flex', flexGrow: 1, minWidth: 0 }}>{destination}</Box>
          </Tooltip>
          {hasSubmenu && !collapsed ? (
            <IconButton
              aria-controls={`hidra-nav-submenu-${item.id}`}
              aria-expanded={submenuOpen}
              aria-label={t(submenuOpen ? 'nav.collapseSubmenu' : 'nav.expandSubmenu', { name: label })}
              onClick={() => setRequestedSubmenu({ key: navigationKey, open: !submenuOpen })}
              size="small"
              sx={{ flexShrink: 0, minHeight: 44, minWidth: 44 }}
            >
              {submenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          ) : null}
        </Box>
        {hasSubmenu && !collapsed ? (
          <Collapse in={submenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding id={`hidra-nav-submenu-${item.id}`}>
              {children.map((child) => renderDestination(child, sectionId, true))}
            </List>
          </Collapse>
        ) : null}
      </Box>
    );
  };

  return (
    <Drawer
      anchor={i18n.dir() === 'rtl' ? 'right' : 'left'}
      aria-label={t('shell.sidebar')}
      onClose={mobile ? onClose : undefined}
      open={mobile ? open : true}
      variant={mobile ? 'temporary' : 'permanent'}
      sx={{
        ...(!mobile ? { flexShrink: 0, width } : {}),
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          height: 'calc(100% - 64px)',
          overflowX: 'hidden',
          top: 64,
          transition: 'width 160ms ease',
          width: mobile ? 'min(88vw, 320px)' : width,
        },
        ...(mobile ? { '& .MuiModal-backdrop': { top: 64 } } : {}),
      }}
    >
      <List id="hidra-primary-navigation" aria-label={t('shell.sidebar')} component="nav" disablePadding sx={{ py: 1 }}>
        {visibleSections.map((section, index) => {
          if (section.id === 'root' || !section.labelKey) {
            return (
              <Box key={section.id}>
                {section.items.map((item) => renderDestination(item, section.id))}
              </Box>
            );
          }

          const groupOpen = expandedGroup === section.id;
          const label = t(section.labelKey);
          return (
            <Box key={section.id}>
              {index > 0 ? <Divider sx={{ my: 0.75 }} /> : null}
              <ListItemButton
                aria-controls={`hidra-nav-group-${section.id}`}
                aria-expanded={groupOpen}
                aria-label={label}
                onClick={() => {
                  setRequestedGroup({ key: navigationKey, id: groupOpen ? '' : section.id });
                  setRequestedSubmenu(null);
                }}
                selected={groupOpen}
                sx={{ minHeight: 48, px: collapsed ? 2.5 : 2 }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
                  {iconFor(groupIcons[section.id] ?? 'overview')}
                </ListItemIcon>
                {!collapsed ? <ListItemText primary={label} slotProps={{ primary: { sx: { fontWeight: 700 }, variant: 'caption' } }} /> : null}
                {!collapsed ? (groupOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />) : null}
              </ListItemButton>
              <Collapse in={groupOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding id={`hidra-nav-group-${section.id}`}>
                  {section.items.map((item) => renderDestination(item, section.id))}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
}
