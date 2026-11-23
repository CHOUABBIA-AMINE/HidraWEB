import { Alert, Box, Chip, Paper, Stack, Typography } from '@mui/material';

export interface StationSynopticNode {
  id: string;
  label: string;
}
export interface StationSynopticConnection {
  id: string;
  fromId: string;
  toId: string;
}
export type StationSynopticState =
  | { kind: 'unavailable' }
  | { kind: 'ready'; revision: string; nodes: readonly StationSynopticNode[]; connections: readonly StationSynopticConnection[] };

export interface StationSynopticFrameProps {
  label: string;
  source: string;
  state: StationSynopticState;
}

/**
 * Read-only schematic presentation. Only show graph nodes/edges supplied by
 * a qualified owner reader; a Topology feature alone cannot establish them.
 * This frame does not claim an ISO/ISA-certified P&ID or hydraulic validation.
 */
export function StationSynopticFrame({ label, source, state }: StationSynopticFrameProps) {
  // Do not render a partial or invalid graph as though it were published.
  const valid = state.kind === 'ready'
    && Boolean(state.revision)
    && state.nodes.length > 0
    && new Set(state.nodes.map((node) => node.id)).size === state.nodes.length
    && state.nodes.every((node) => Boolean(node.id && node.label))
    && state.connections.every((edge) => Boolean(edge.id)
      && state.nodes.some((node) => node.id === edge.fromId)
      && state.nodes.some((node) => node.id === edge.toId));
  return (
    <Paper component="section" aria-label={label} variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography component="h4" variant="subtitle1">{label}</Typography>
        <Typography color="text.secondary" variant="caption">{source}</Typography>
        {!valid || state.kind !== 'ready' ? (
          <Alert severity="info">Published station connectivity is not available from this owner read. No equipment or connection is inferred.</Alert>
        ) : (
          <>
            <Chip label={`Owner graph revision: ${state.revision}`} size="small" variant="outlined" />
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(140px, 1fr))' } }}>
              {state.nodes.map((node) => <Paper key={node.id} variant="outlined" sx={{ p: 1 }}>
                <Typography variant="body2">{node.label}</Typography>
                <Typography color="text.secondary" variant="caption">{node.id}</Typography>
              </Paper>)}
            </Box>
            <Typography variant="body2">Owner-issued connections</Typography>
            {state.connections.map((edge) => (
              <Typography key={edge.id} variant="body2">{edge.fromId} → {edge.toId}</Typography>
            ))}
            <Typography color="text.secondary" variant="caption">Read-only schematic. Not a certified P&amp;ID or hydraulically qualified station model.</Typography>
          </>
        )}
      </Stack>
    </Paper>
  );
}
