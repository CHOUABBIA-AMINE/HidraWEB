import { Box, Breadcrumbs, Button, Link, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

export interface WorkspaceBreadcrumb {
  label: string;
  /** The owning page must supply a known, authorized destination. */
  to?: string;
}

export interface WorkspaceHeadingAction {
  id: string;
  label: string;
  /** An explicit current owner permission decision, never inferred by the frame. */
  permitted: boolean;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
}

export interface WorkspaceOwnerStatus {
  /** Current state read from the owning module, not a locally inferred state. */
  label: string;
  source: string;
}

export interface WorkspaceHeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbsLabel: string;
  breadcrumbs: readonly WorkspaceBreadcrumb[];
  ownerStatus?: WorkspaceOwnerStatus;
  actions?: readonly WorkspaceHeadingAction[];
  accessory?: ReactNode;
}

/** Presentation only: no API calls, privilege inference or business transitions. */
export function WorkspaceHeading({
  title, description, eyebrow, breadcrumbsLabel, breadcrumbs, ownerStatus, actions, accessory,
}: WorkspaceHeadingProps) {
  const visibleActions = actions?.filter((action) => action.permitted) ?? [];
  const supportedStatus = Boolean(ownerStatus?.label.trim() && ownerStatus.source.trim());
  return (
    <Box component="header" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, minWidth: 0 }}>
      <Box sx={{ minWidth: 0 }}>
        {breadcrumbs.length > 0 ? (
          <Breadcrumbs aria-label={breadcrumbsLabel} sx={{ mb: 0.5 }}>
            {breadcrumbs.map((crumb, index) => crumb.to ? (
              <Link component={RouterLink} key={`${index}:${crumb.label}`} to={crumb.to} underline="hover">
                {crumb.label}
              </Link>
            ) : (
              <Typography color="text.secondary" key={`${index}:${crumb.label}`} variant="body2">
                {crumb.label}
              </Typography>
            ))}
          </Breadcrumbs>
        ) : null}
        {eyebrow ? <Typography color="text.secondary" variant="overline">{eyebrow}</Typography> : null}
        <Typography component="h1" sx={{ overflowWrap: 'anywhere' }} variant="h4">{title}</Typography>
        {description ? <Typography color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography> : null}
        {supportedStatus && ownerStatus ? (
          <Box role="status" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Typography component="span" variant="body2">{ownerStatus.label}</Typography>
            <Typography color="text.secondary" component="span" variant="caption">{ownerStatus.source}</Typography>
          </Box>
        ) : null}
      </Box>
      {accessory || visibleActions.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }} useFlexGap>
          {accessory}
          {visibleActions.map((action) => (
            <Button disabled={action.disabled} key={action.id} onClick={action.onClick} variant={action.variant ?? 'outlined'}>
              {action.label}
            </Button>
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}
