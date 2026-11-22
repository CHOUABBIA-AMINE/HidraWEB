import { Alert, Box, Button, CircularProgress, Paper, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

/** Layout only. HidraAPI and the owning workspace still decide if data is visible. */
export type WorkspaceCanvasVariant =
  | 'map' | 'synoptic' | 'summary' | 'register' | 'trend-detail' | 'editor';

export type WorkspaceCanvasState =
  | { kind: 'ready' }
  | { kind: 'loading'; message: string }
  | { kind: 'empty'; message: string }
  | { kind: 'unavailable'; message: string }
  | { kind: 'degraded'; message: string; retry?: {
      label: string;
      permitted: boolean;
      onRetry: () => void;
    } };

interface WorkspaceCanvasProps {
  label: string;
  variant: WorkspaceCanvasVariant;
  state: WorkspaceCanvasState;
  title?: string;
  children?: ReactNode;
  /** Only shown on a ready trend/detail canvas. Never infer a record relationship. */
  aside?: ReactNode;
  asideLabel?: string;
}

/** No data requests, persistence, permission interpretation or fallback values.
 * Non-ready states never render retained protected children or side panels.
 */
export function WorkspaceCanvas({
  label, variant, state, title, children, aside, asideLabel,
}: WorkspaceCanvasProps) {
  const isSummary = variant === 'summary';
  const isVisual = variant === 'map' || variant === 'synoptic';
  const isDetail = variant === 'trend-detail' && aside !== undefined;

  const readyContent = isDetail ? (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(280px, 1fr)' }, minWidth: 0 }}>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
      <Box component="aside" aria-label={asideLabel} sx={{ minWidth: 0 }}>{aside}</Box>
    </Box>
  ) : (
    <Box sx={{
      display: 'grid',
      gap: isSummary ? 2 : 0,
      gridTemplateColumns: isSummary
        ? { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }
        : 'minmax(0, 1fr)',
      maxWidth: variant === 'editor' ? '960px' : undefined,
      minHeight: isVisual ? { xs: 260, md: 320 } : undefined,
      minWidth: 0,
      width: '100%',
    }}>
      {children}
    </Box>
  );

  const stateContent = state.kind === 'loading' ? (
    <Stack alignItems="center" role="status" aria-live="polite" spacing={1.5} sx={{ py: 3 }}>
      <CircularProgress size={24} />
      <Typography color="text.secondary" variant="body2">{state.message}</Typography>
      <Skeleton aria-hidden="true" variant="rounded" height={28} width="100%" />
      <Skeleton aria-hidden="true" variant="rounded" height={28} width="80%" />
    </Stack>
  ) : state.kind === 'ready' ? readyContent : (
    <Alert
      role={state.kind === 'empty' ? 'status' : 'alert'}
      severity={state.kind === 'empty' ? 'info' : 'warning'}
      action={state.kind === 'degraded' && state.retry?.permitted
        ? <Button color="inherit" size="small" onClick={state.retry.onRetry}>{state.retry.label}</Button>
        : undefined}
    >
      {state.message}
    </Alert>
  );

  return (
    <Box component="section" role="region" aria-label={label} data-canvas-variant={variant} sx={{ minWidth: 0, width: '100%' }}>
      {title ? <Typography component="h2" sx={{ mb: 1 }} variant="h6">{title}</Typography> : null}
      {state.kind === 'ready' && isSummary ? readyContent : (
        <Paper variant="outlined" sx={{
          minWidth: 0,
          overflow: isVisual ? 'hidden' : undefined,
          p: variant === 'map' ? 1 : 2,
        }}>
          {stateContent}
        </Paper>
      )}
    </Box>
  );
}
