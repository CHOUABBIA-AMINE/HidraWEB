import { Box, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface BackendObjectInspectorProps {
  title: string;
  value: Record<string, unknown>;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  try { return JSON.stringify(value); } catch { return String(value); }
}

export function BackendObjectInspector({ title, value }: BackendObjectInspectorProps) {
  const { t } = useTranslation();
  const entries = Object.entries(value)
    .filter(([, item]) => item !== null && item !== undefined && item !== '')
    .sort(([left], [right]) => left.localeCompare(right));

  return (
    <Stack spacing={2}>
      <Typography component="h3" variant="h6">{title}</Typography>
      <Divider />
      <Box component="dl" sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'minmax(130px, auto) 1fr', m: 0 }}>
        {entries.map(([key, item]) => (
          <Box key={key} sx={{ display: 'contents' }}>
            <Typography component="dt" color="text.secondary" variant="caption">{key}</Typography>
            <Typography component="dd" sx={{ m: 0, overflowWrap: 'anywhere' }} variant="body2">{renderValue(item)}</Typography>
          </Box>
        ))}
      </Box>
      <Typography color="text.secondary" variant="caption">{t('telemetryMonitoring.backendOwned')}</Typography>
    </Stack>
  );
}
