import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Stack, TextField, Typography,
} from '@mui/material';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ReviewDialogProps {
  open: boolean;
  permitted?: boolean;
  pending?: boolean;
  title: string;
  description: string;
  confirmationPhrase: string;
  confirmationLabel?: string;
  confirmLabel: string;
  notice?: string;
  auditReference?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Modal confirmation is UX only; owner authorization and current revision remain mandatory. */
export function ReviewDialog(props: ReviewDialogProps) {
  // Unmount on admission or selection loss so sensitive input cannot survive.
  if (!props.open || props.permitted === false) return null;
  return <ReviewDialogContent {...props} />;
}

function ReviewDialogContent({
  title, description, confirmationPhrase, confirmationLabel = 'Confirmation phrase',
  confirmLabel, notice, auditReference, onCancel, onConfirm, pending = false,
}: ReviewDialogProps) {
  const { t } = useTranslation();
  const [confirmation, setConfirmation] = useState('');
  const titleId = useId();
  const descriptionId = useId();
  const instructionId = useId();
  const confirmed = confirmation === confirmationPhrase;
  const mismatch = confirmation.length > 0 && !confirmed;
  const cancel = () => { if (!pending) { setConfirmation(''); onCancel(); } };
  const confirm = () => {
    if (pending || !confirmed) return;
    setConfirmation('');
    onConfirm();
  };
  return (
    <Dialog aria-describedby={descriptionId} aria-labelledby={titleId}
      fullWidth maxWidth="sm" onClose={cancel} open transitionDuration={0}>
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {notice ? <Alert severity="warning">{notice}</Alert> : null}
          <DialogContentText id={descriptionId}>{description}</DialogContentText>
          <Typography id={instructionId} variant="body2">
            {t('ownerFeedback.typeToContinue')} <strong>{confirmationPhrase}</strong>
          </Typography>
          <TextField aria-describedby={instructionId} autoComplete="off"
            disabled={pending} error={mismatch} fullWidth
            helperText={mismatch ? t('ownerFeedback.confirmationMismatch') : undefined}
            label={confirmationLabel} onChange={(event) => setConfirmation(event.target.value)}
            value={confirmation} />
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
        <Button autoFocus disabled={pending} onClick={cancel}>{t('ownerFeedback.cancel')}</Button>
        <Button color="error" disabled={!confirmed || pending} onClick={confirm} variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
