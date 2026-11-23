import { Button, Checkbox, FormControlLabel, Stack } from '@mui/material';
import type { FormEvent, ReactNode } from 'react';

export interface TypedFormProps<Request> {
  label: string;
  request: Request;
  children: ReactNode;
  permitted: boolean;
  valid: boolean;
  blocked?: boolean;
  pending?: boolean;
  confirmed: boolean;
  confirmationLabel: string;
  submitLabel: string;
  onConfirmationChange: (confirmed: boolean) => void;
  onSubmit: (request: Request) => void;
}

/** Typed UI boundary only; request shape and business validation remain owner-provided. */
export function TypedForm<Request>({
  label, request, children, permitted, valid, blocked = false, pending = false,
  confirmed, confirmationLabel, submitLabel, onConfirmationChange, onSubmit,
}: TypedFormProps<Request>) {
  if (!permitted) return null;
  const disabled = blocked || pending;
  const eligible = valid && confirmed && !disabled;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (eligible) onSubmit(request);
  };
  return (
    <form aria-label={label} noValidate onSubmit={submit}>
      <fieldset disabled={disabled} style={{ border: 0, margin: 0, minWidth: 0, padding: 0 }}>
        <Stack spacing={1}>
          {children}
          <FormControlLabel
            control={<Checkbox checked={confirmed} onChange={(_, next) => onConfirmationChange(next)} />}
            label={confirmationLabel}
          />
          <Button disabled={!eligible} type="submit" variant="contained">{pending ? '…' : submitLabel}</Button>
        </Stack>
      </fieldset>
    </form>
  );
}
