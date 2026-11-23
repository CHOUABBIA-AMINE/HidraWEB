import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export type AuthorizedActionPanelState<Action> =
  | { kind: 'ready'; actions: readonly Action[] }
  | { kind: 'loading' | 'denied' | 'failed'; message: string };

export interface AuthorizedActionPanelProps<Action> {
  label: string;
  state: AuthorizedActionPanelState<Action>;
  selectedId: string;
  emptyMessage: string;
  pending: boolean;
  getId: (action: Action) => string | undefined;
  isPermitted: (action: Action) => boolean;
  actionLabel: (action: Action) => string;
  renderSummary: (action: Action) => ReactNode;
  renderSelected: (action: Action) => ReactNode;
  onSelect: (action: Action) => void;
}

/** Owner data and permitted actions must be re-admitted for each current rendering. */
export function AuthorizedActionPanel<Action>({
  label, state, selectedId, emptyMessage, pending, getId,
  isPermitted, actionLabel, renderSummary, renderSelected, onSelect,
}: AuthorizedActionPanelProps<Action>) {
  return (
    <Box component="section" aria-label={label}>
      <Typography component="h3" variant="subtitle1">{label}</Typography>
      {state.kind !== 'ready' ? (
        <Alert severity={state.kind === 'failed' ? 'error' : 'warning'} sx={{ mt: 1 }}>
          {state.message}
        </Alert>
      ) : state.actions.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 1 }}>{emptyMessage}</Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 1 }}>
          {state.actions.map((action, index) => {
            const id = getId(action);
            const permitted = Boolean(id) && isPermitted(action);
            return (
              <Paper key={id ?? String(index)} variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  {renderSummary(action)}
                  {permitted ? <Button disabled={pending} size="small"
                    onClick={() => onSelect(action)} variant={selectedId === id ? 'contained' : 'outlined'}>
                    {actionLabel(action)}
                  </Button> : null}
                  {permitted && id === selectedId ? renderSelected(action) : null}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
