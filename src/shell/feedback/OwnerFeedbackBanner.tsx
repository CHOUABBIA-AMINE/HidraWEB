import { Alert, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { classifyOwnerError } from './ownerFeedback';

type FeedbackProps =
  | { kind: 'error'; error: unknown; message?: string; onReview?: () => void }
  | { kind: 'success' | 'unverified'; message: string; onReview?: () => void; error?: never };

/** Display trusted presentation copy, not raw API error descriptions. */
export function OwnerFeedbackBanner(props: FeedbackProps) {
  const { t } = useTranslation();
  const classified = props.kind === 'error' ? classifyOwnerError(props.error) : undefined;
  const code = classified?.kind;
  const severity = props.kind === 'success' ? 'success'
    : props.kind === 'unverified' || code === 'conflict' || code === 'denied' || code === 'validation' ? 'warning'
    : 'error';
  const description = props.kind === 'error'
    ? props.message ?? t(`ownerFeedback.${code ?? 'unavailable'}`)
    : props.message;
  const canReview = props.kind === 'unverified' || code === 'conflict';
  return (
    <Alert
      role={props.kind === 'success' ? 'status' : 'alert'}
      severity={severity}
      action={canReview && props.onReview
        ? <Button color="inherit" onClick={props.onReview} size="small">{t('ownerFeedback.review')}</Button>
        : undefined}
    >
      <Typography component="span">{description}</Typography>
      {classified?.supportReference ? (
        <Typography component="span" sx={{ display: 'block', mt: 0.5 }} variant="caption">
          {t('ownerFeedback.reference', { id: classified.supportReference })}
        </Typography>
      ) : null}
    </Alert>
  );
}
