import { Alert, Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { EvidenceStateNotice } from '@/shell/evidence/EvidenceStateNotice';
import { ContextLink } from '@/shell/navigation/ContextLink';
import type { EvidenceEvent, EvidenceState } from '@/shell/evidence/evidenceTypes';

interface EvidenceTimelineProps {
  label: string;
  state: EvidenceState<readonly EvidenceEvent[]>;
  /** Only the owning workspace may enable links to its protected task GET. */
  workflowTasksAdmitted?: boolean;
  onWorkflowTaskNavigate?: () => void;
}

export function EvidenceTimeline({ label, state, workflowTasksAdmitted = false, onWorkflowTaskNavigate }: EvidenceTimelineProps) {
  const { t } = useTranslation();
  return (
    <Box component="section" aria-label={label} sx={{ minWidth: 0 }}>
      <Typography component="h3" variant="subtitle1">{label}</Typography>
      {state.kind !== 'ready' ? <EvidenceStateNotice kind={state.kind} /> :
        state.value.length === 0 ? <Alert role="status" severity="info">{t('evidence.empty')}</Alert> : (
          <TableContainer sx={{ mt: 1 }}>
            <Table size="small" aria-label={label}>
              <TableHead><TableRow>
                <TableCell>{t('evidence.timestamp')}</TableCell>
                <TableCell>{t('evidence.event')}</TableCell>
                <TableCell>{t('evidence.actor')}</TableCell>
                <TableCell>{t('evidence.source')}</TableCell>
                <TableCell>{t('evidence.note')}</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {state.value.map((event, index) => (
                  <TableRow key={event.id ?? `${event.source}-${event.occurredAt ?? 'no-time'}-${index}`}>
                    <TableCell>{event.occurredAt ?? '—'}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">{event.title}</Typography>
                        {event.status ? <Typography color="text.secondary" variant="caption">{t('evidence.status')}: {event.status}</Typography> : null}
                      </Stack>
                    </TableCell>
                    <TableCell>{event.actor ?? '—'}</TableCell>
                    <TableCell>{event.source}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {event.note ? <Typography variant="body2">{event.note}</Typography> : null}
                        {event.workflowTaskId && workflowTasksAdmitted ? (
                          <ContextLink target={{ kind: 'workflow-task', taskId: event.workflowTaskId }}
                            admitted ownerIssued onNavigate={onWorkflowTaskNavigate}
                            label={t('contextLink.openTask')} />
                        ) : null}
                        {([
                          ['quality', event.quality], ['unit', event.unit],
                          ['revision', event.revision],
                          ['effectiveFrom', event.effectiveFrom], ['effectiveTo', event.effectiveTo],
                          ['correlation', event.correlationId],
                        ] as const).filter(([, value]) => value !== undefined && value !== '').map(([key, value]) => (
                          <Typography key={key} color="text.secondary" variant="caption">
                            {t(`evidence.${key}`)}: {value}
                          </Typography>
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      }
    </Box>
  );
}
