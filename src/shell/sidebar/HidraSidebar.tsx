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
import { Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Tooltip } from '@mui/material';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { usePermissions } from '@/features/permissions/usePermissions';
import { navigationSections, type NavigationIconKey, type NavigationItem } from '@/shell/navigation/navigationRegistry';

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
}

export function HidraSidebar({ collapsed }: HidraSidebarProps) {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const width = collapsed ? collapsedWidth : expandedWidth;

  const visibleSections = navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => permissions.hasAnyModuleCapability(item.capabilityModules)),
    }))
    .filter((section) => section.items.length > 0);

  const renderItem = (item: NavigationItem) => {
    const label = t(item.labelKey);
    const plannedTitle = t('nav.planned', { task: item.deliveryTask });
    const button = (
      <ListItemButton
        aria-label={label}
        disabled={!item.implemented}
        onClick={item.implemented ? () => navigate(item.path) : undefined}
        selected={item.implemented && location.pathname === item.path}
        sx={{ minHeight: 46, px: collapsed ? 2.5 : 2 }}
      >
        <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>{iconFor(item.icon)}</ListItemIcon>
        {!collapsed ? <ListItemText primary={label} secondary={!item.implemented ? item.deliveryTask : undefined} /> : null}
      </ListItemButton>
    );

    return (
      <Tooltip key={item.id} placement="right" title={collapsed ? `${label} · ${item.implemented ? '' : plannedTitle}` : (!item.implemented ? plannedTitle : '')}>
        <span>{button}</span>
      </Tooltip>
    );
  };

  return (
    <Drawer
      aria-label={t('shell.sidebar')}
      variant="permanent"
      sx={{
        flexShrink: 0,
        width,
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          height: 'calc(100% - 64px)',
          overflowX: 'hidden',
          top: 64,
          transition: 'width 160ms ease',
          width,
        },
      }}
    >
      <List disablePadding sx={{ py: 1 }}>
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.id}>
            {sectionIndex > 0 ? <Divider sx={{ my: 0.75 }} /> : null}
            {!collapsed && section.labelKey ? (
              <ListSubheader component="div" sx={{ bgcolor: 'inherit', lineHeight: '32px' }}>
                {t(section.labelKey)}
              </ListSubheader>
            ) : null}
            {section.items.map(renderItem)}
          </div>
        ))}
      </List>
    </Drawer>
  );
}
