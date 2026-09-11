import { Box, Divider, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { fetchWorkbenchRecord, workbenchQueryKeys } from '@/features/workbench/api/workbenchApi';
import { WorkbenchErrorState, WorkbenchLoadingState } from '@/features/workbench/components/WorkbenchState';

interface WorkbenchDetailPanelProps {
  module: string;
  resource: string;
  id: string;
}

function valueText(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function WorkbenchDetailPanel({ module, resource, id }: WorkbenchDetailPanelProps) {
  const { t } = useTranslation();
  const detailQuery = useQuery({
    queryKey: workbenchQueryKeys.detail(module, resource, id),
    queryFn: () => fetchWorkbenchRecord(module, resource, id),
  });

  if (detailQuery.isLoading) {
    return <WorkbenchLoadingState label={t('workbench.loadingDetail')} />;
  }
  if (detailQuery.error) {
    return <WorkbenchErrorState error={detailQuery.error} onRetry={() => { void detailQuery.refetch(); }} />;
  }
  if (!detailQuery.data) {
    return null;
  }

  return (
    <Box component="dl" sx={{ m: 0 }}>
      <Typography color="text.secondary" variant="caption">{detailQuery.data.module}/{detailQuery.data.resource}</Typography>
      <Typography sx={{ mb: 2 }} variant="h6">{String(detailQuery.data.id ?? id)}</Typography>
      <Divider sx={{ mb: 2 }} />
      {Object.entries(detailQuery.data.attributes ?? {}).map(([key, value]) => (
        <Box key={key} sx={{ borderBottom: 1, borderColor: 'divider', py: 1.25 }}>
          <Typography component="dt" color="text.secondary" variant="caption">{key}</Typography>
          <Typography component="dd" sx={{ m: 0, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }} variant="body2">
            {valueText(value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
