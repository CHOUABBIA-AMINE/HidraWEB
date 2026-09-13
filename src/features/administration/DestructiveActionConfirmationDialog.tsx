import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

interface DestructiveActionConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmationPhrase: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  auditReference?: string;
}

export function DestructiveActionConfirmationDialog({
  open,
  title,
  description,
  confirmationPhrase,
  confirmLabel,
  onCancel,
  onConfirm,
  auditReference,
}: DestructiveActionConfirmationDialogProps) {
  const [confirmation, setConfirmation] = useState('');
  const confirmed = confirmation === confirmationPhrase;

  const resetAndCancel = () => {
    setConfirmation('');
    onCancel();
  };

  const confirm = () => {
    if (!confirmed) return;
    setConfirmation('');
    onConfirm();
  };

  return (
    <Dialog open={open} onClose={resetAndCancel} maxWidth="sm" fullWidth transitionDuration={0}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="warning">This action is destructive and requires explicit confirmation.</Alert>
          <DialogContentText>{description}</DialogContentText>
          <Typography variant="body2">
            Type <strong>{confirmationPhrase}</strong> to continue.
          </Typography>
          <TextField
            autoComplete="off"
            fullWidth
            label="Confirmation phrase"
            onChange={(event) => setConfirmation(event.target.value)}
            value={confirmation}
          />
          {auditReference ? (
            <Typography data-testid="audit-reference" variant="body2">
              Audit reference: {auditReference}
            </Typography>
          ) : (
            <Typography color="text.secondary" variant="body2">
              No backend audit reference was supplied for this action.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndCancel}>Cancel</Button>
        <Button color="error" disabled={!confirmed} onClick={confirm} variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
