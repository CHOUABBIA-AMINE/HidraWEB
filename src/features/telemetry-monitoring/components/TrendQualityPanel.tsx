import { Alert, Box, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { ReadingView } from '@/api/generated/telemetry-monitoring/model';
import { numericTrendPath, readingTimestamp, readingValue } from '@/features/telemetry-monitoring/model/telemetryPresentation';

export interface TrendQualityPanelProps {
  pointId: string;
  readings: readonly ReadingView[];
  title: string;
}

/**
 * Displays returned observations only. Quality and state are backend code
 * evidence, not a local declaration of calibrated or trusted measurement.
 */
export function TrendQualityPanel({ pointId, readings, title }: TrendQualityPanelProps) {
  const { t } = useTranslation();
  const owned = readings.filter((reading) => reading.pointId === pointId);
  const path = numericTrendPath(owned);
  const sample = owned.slice(-10);
  return (
    <Stack spacing={1} aria-label={title} role="region">
      <Typography component="h3" variant="subtitle1">{title}</Typography>
      <Typography color="text.secondary" variant="caption">{t('evidence.legacy')}</Typography>
      {path ? (
        <Box component="svg" aria-label={title} role="img" viewBox="0 0 480 120"
          sx={{ display: 'block', height: 180, width: '100%' }}>
          <Box component="path" d={path} fill="none" stroke="currentColor" strokeWidth="3" />
        </Box>
      ) : <Alert severity="info">{t('telemetryMonitoring.noTrend')}</Alert>}
      {sample.length > 0 ? (
        <>
          <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
            {sample.slice(-3).map((reading, index) => (
              <Chip key={reading.id ?? index} size="small" variant="outlined"
                label={`${t('telemetryMonitoring.quality')}: ${reading.qualityCodeId ?? '—'} · ${t('telemetryMonitoring.state')}: ${reading.state ?? '—'}`} />
            ))}
          </Stack>
          <TableContainer>
            <Table size="small" aria-label={`${title} · ${t('telemetryMonitoring.quality')}`}>
              <TableHead><TableRow>
                <TableCell>{t('telemetryMonitoring.timestamp')}</TableCell>
                <TableCell>{t('telemetryMonitoring.value')}</TableCell>
                <TableCell>{t('telemetryMonitoring.unit')}</TableCell>
                <TableCell>{t('telemetryMonitoring.quality')}</TableCell>
                <TableCell>{t('telemetryMonitoring.state')}</TableCell>
              </TableRow></TableHead>
              <TableBody>{sample.map((reading, index) => (
                <TableRow key={reading.id ?? index}>
                  <TableCell>{readingTimestamp(reading)}</TableCell>
                  <TableCell>{readingValue(reading)}</TableCell>
                  <TableCell>{reading.unitId ?? '—'}</TableCell>
                  <TableCell>{reading.qualityCodeId ?? '—'}</TableCell>
                  <TableCell>{reading.state ?? '—'}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </Stack>
  );
}
