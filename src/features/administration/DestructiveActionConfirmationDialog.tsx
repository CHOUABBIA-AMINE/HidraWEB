import { ReviewDialog } from '@/shell/overlay/ReviewDialog';

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

export function DestructiveActionConfirmationDialog(props: DestructiveActionConfirmationDialogProps) {
  return (
    <ReviewDialog
      {...props}
      notice="This action is destructive and requires explicit confirmation."
    />
  );
}
