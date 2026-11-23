import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { EvidenceState } from '@/shell/evidence/evidenceTypes';

/** A non-ready state never has a data payload to accidentally render. */
export function EvidenceStateNotice({ kind }: { kind: Exclude<EvidenceState<unknown>['kind'], 'ready'> }) {
  const { t } = useTranslation();
  return <Alert role={kind === 'loading' ? 'status' : 'alert'}
    severity={kind === 'loading' ? 'info' : 'warning'}>
    {t(`evidence.${kind}`)}
  </Alert>;
}
