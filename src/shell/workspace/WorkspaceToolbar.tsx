import { Box, Button } from '@mui/material';
import type { ReactNode } from 'react';

export interface WorkspaceRefreshAction {
  label: string;
  /** Must be derived by the owning workspace from its current authorization. */
  permitted: boolean;
  onRefresh: () => void;
  disabled?: boolean;
}

interface WorkspaceToolbarProps {
  label: string;
  children?: ReactNode;
  refresh?: WorkspaceRefreshAction;
}

/** Optional second-row controls belong to their owner, including refresh semantics.
 * Use a named group rather than an ARIA toolbar requiring roving focus handling.
 */
export function WorkspaceToolbar({ label, children, refresh }: WorkspaceToolbarProps) {
  if (!children && !refresh?.permitted) return null;
  return (
    <Box aria-label={label} role="group" sx={{ alignItems: { xs: 'stretch', sm: 'center' }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', minWidth: 0 }}>
      {children ? <Box sx={{ display: 'flex', flex: 1, flexWrap: 'wrap', gap: 1, minWidth: 0 }}>{children}</Box> : <Box sx={{ flex: 1 }} />}
      {refresh?.permitted ? (
        <Button disabled={refresh.disabled} onClick={refresh.onRefresh} variant="outlined">
          {refresh.label}
        </Button>
      ) : null}
    </Box>
  );
}
