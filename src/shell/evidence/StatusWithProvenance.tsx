import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { EvidenceStateNotice } from '@/shell/evidence/EvidenceStateNotice';
import type { EvidenceState, StatusEvidence } from '@/shell/evidence/evidenceTypes';

interface StatusWithProvenanceProps {
  label: string;
  state: EvidenceState<StatusEvidence>;
}

export function StatusWithProvenance({ label, state }: StatusWithProvenanceProps) {
  const { t } = useTranslation();
  return (
    <Paper component="section" variant="outlined" aria-label={label} sx={{ minWidth: 0, p: 2 }}>
      <Typography component="h2" variant="h6">{label}</Typography>
      {state.kind !== 'ready' ? <Box sx={{ mt: 1 }}><EvidenceStateNotice kind={state.kind} /></Box> : (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          <Stack direction="row" useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography component="p" variant="h5" sx={{ overflowWrap: 'anywhere' }}>{state.value.value}</Typography>
            {state.value.unit ? <Typography variant="subtitle2">{state.value.unit}</Typography> : null}
            {state.value.status ? <Chip size="small" variant="outlined" label={state.value.status} /> : null}
          </Stack>
          <Box component="dl" sx={{ display: 'grid', gap: 0.75, gridTemplateColumns: 'minmax(100px, auto) minmax(0, 1fr)', m: 0 }}>
            {([
              ['source', state.value.source],
              ['quality', state.value.quality],
              ['observedAt', state.value.observedAt],
              ['receivedAt', state.value.receivedAt],
              ['revision', state.value.revision],
              ['effectiveFrom', state.value.effectiveFrom],
              ['effectiveTo', state.value.effectiveTo],
              ['reference', state.value.reference],
            ] as const).filter(([, value]) => value !== undefined && value !== '').map(([key, value]) => (
              <Box key={key} sx={{ display: 'contents' }}>
                <Typography component="dt" color="text.secondary" variant="caption">{t(`evidence.${key}`)}</Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      )}
    </Paper>
  );
}
