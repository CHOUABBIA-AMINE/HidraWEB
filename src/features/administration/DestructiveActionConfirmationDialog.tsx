import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useId, useState } from 'react';

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
  const titleId = useId();
  const descriptionId = useId();
  const confirmationInstructionId = useId();
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
    <Dialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      fullWidth
      maxWidth="sm"
      onClose={resetAndCancel}
      open={open}
      transitionDuration={0}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="warning">This action is destructive and requires explicit confirmation.</Alert>
          <DialogContentText id={descriptionId}>{description}</DialogContentText>
          <Typography id={confirmationInstructionId} variant="body2">
            Type <strong>{confirmationPhrase}</strong> to continue.
          </Typography>
          <TextField
            aria-describedby={confirmationInstructionId}
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
        <Button autoFocus onClick={resetAndCancel}>Cancel</Button>
        <Button color="error" disabled={!confirmed} onClick={confirm} variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
