import { Alert, Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { CreateSuppressionRequest } from '@/api/generated/alarm/model';
import { alarmQueryKeys, createSuppression, fetchSuppressions, releaseSuppression } from '@/features/alarm/api/alarmApi';

function optional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function toIso(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function displayError(error: unknown): string {
  const normalized = normalizeHidraApiError(error);
  return normalized.message || 'Alarm suppression operation failed.';
}

export interface AlarmSuppressionPanelProps {
  alarmId: string;
  canRead: boolean;
  canExecute: boolean;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}

export function AlarmSuppressionPanel({ alarmId, canRead, canExecute, disabled = false, onBusyChange }: AlarmSuppressionPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ suppressionReasonId: '', reasonText: '', suppressedUntil: '', workflowInstanceId: '' });
  const params = useMemo(() => ({ alarmId, page: 0, size: 50 }), [alarmId]);
  const query = useQuery({ queryKey: alarmQueryKeys.suppressions(params), queryFn: () => fetchSuppressions(params), enabled: canRead && Boolean(alarmId) });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: alarmQueryKeys.all });
  };

  const createMutation = useMutation({
    mutationFn: () => {
      const request: CreateSuppressionRequest = {
        scopeType: 'ALARM' as CreateSuppressionRequest['scopeType'],
        scopeReferenceId: alarmId,
        alarmId,
        suppressionReasonId: form.suppressionReasonId.trim(),
        reasonText: optional(form.reasonText),
        suppressedUntil: toIso(form.suppressedUntil),
        workflowInstanceId: optional(form.workflowInstanceId),
      };
      return createSuppression(request);
    },
    onSuccess: refresh,
  });

  const releaseMutation = useMutation({ mutationFn: (suppressionId: string) => releaseSuppression(suppressionId), onSuccess: refresh });
  const busy = createMutation.isPending || releaseMutation.isPending;

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const error = query.error ?? createMutation.error ?? releaseMutation.error;
  const success = Boolean(createMutation.data ?? releaseMutation.data);
  const suppressions = query.data?.content ?? [];

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography component="h4" variant="subtitle2">{t('alarm.suppression')}</Typography>
          <Typography color="text.secondary" variant="caption">{t('alarm.suppressionBackendNotice')}</Typography>
        </Box>
        {!canRead ? <Alert severity="info">{t('alarm.suppressionReadUnavailable')}</Alert> : null}
        {error ? <Alert severity="error">{displayError(error)}</Alert> : null}
        {success ? <Alert severity="success">{t('alarm.suppressionSuccess')}</Alert> : null}
        {canRead ? (
          <>
            <Typography component="h5" variant="subtitle2">{t('alarm.suppressionHistory')}</Typography>
            {suppressions.length ? (
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow><TableCell>{t('alarm.status')}</TableCell><TableCell>{t('alarm.reason')}</TableCell><TableCell>{t('alarm.when')}</TableCell><TableCell>{t('alarm.suppressedUntil')}</TableCell><TableCell>{t('alarm.actor')}</TableCell><TableCell /></TableRow></TableHead>
                  <TableBody>{suppressions.map((suppression, index) => (
                    <TableRow key={suppression.id ?? `suppression-${index}`}>
                      <TableCell>{suppression.status ?? '—'}</TableCell>
                      <TableCell>{suppression.suppressionReasonId ?? suppression.reasonText ?? '—'}</TableCell>
                      <TableCell>{suppression.suppressedAt ?? '—'}</TableCell>
                      <TableCell>{suppression.suppressedUntil ?? t('alarm.openEnded')}</TableCell>
                      <TableCell>{suppression.suppressedByActorId ?? '—'}</TableCell>
                      <TableCell>{suppression.id && suppression.status === 'ACTIVE' && canExecute ? <Button disabled={busy || disabled} onClick={() => releaseMutation.mutate(suppression.id!)} size="small">{t('alarm.releaseSuppression')}</Button> : suppression.releasedAt ?? '—'}</TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </TableContainer>
            ) : !query.isLoading && !query.error ? <Typography color="text.secondary">{t('alarm.noSuppressions')}</Typography> : null}
          </>
        ) : null}
        {canExecute ? (
          <>
            <Typography component="h5" variant="subtitle2">{t('alarm.createSuppression')}</Typography>
            <Alert severity="info">{t('alarm.openEndedApprovalNotice')}</Alert>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField label={t('alarm.suppressionReasonId')} onChange={(event) => setForm({ ...form, suppressionReasonId: event.target.value })} required size="small" value={form.suppressionReasonId} />
              <TextField label={t('alarm.suppressedUntil')} onChange={(event) => setForm({ ...form, suppressedUntil: event.target.value })} size="small" slotProps={{ inputLabel: { shrink: true } }} type="datetime-local" value={form.suppressedUntil} />
              <TextField label={t('alarm.workflowApprovalId')} onChange={(event) => setForm({ ...form, workflowInstanceId: event.target.value })} size="small" value={form.workflowInstanceId} />
              <TextField label={t('alarm.reasonText')} multiline onChange={(event) => setForm({ ...form, reasonText: event.target.value })} size="small" value={form.reasonText} />
            </Box>
            <Button disabled={busy || disabled || !form.suppressionReasonId.trim()} onClick={() => createMutation.mutate()} variant="outlined">{t('alarm.createSuppression')}</Button>
          </>
        ) : canRead ? <Alert severity="warning">{t('alarm.suppressionExecuteUnavailable')}</Alert> : null}
      </Stack>
    </Paper>
  );
}
