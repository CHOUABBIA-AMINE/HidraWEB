import { Box, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Feature } from '@/api/generated/topology/model';
import { topologyFeatureLabel } from '@/features/topology/model/topologyPresentation';

export interface TopologyInspectorProps {
  feature: Feature;
}

export function TopologyInspector({ feature }: TopologyInspectorProps) {
  const { t } = useTranslation();
  const properties = Object.entries(feature.properties)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .sort(([left], [right]) => left.localeCompare(right));

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="overline">{feature.properties.entityType}</Typography>
        <Typography component="h3" variant="h6">{topologyFeatureLabel(feature)}</Typography>
        <Typography color="text.secondary" variant="body2">{feature.id}</Typography>
      </Box>
      <Divider />
      <Box component="dl" sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'minmax(120px, auto) 1fr', m: 0 }}>
        {properties.map(([key, value]) => (
          <Box key={key} sx={{ display: 'contents' }}>
            <Typography component="dt" color="text.secondary" variant="caption">{key}</Typography>
            <Typography component="dd" sx={{ m: 0, overflowWrap: 'anywhere' }} variant="body2">{String(value)}</Typography>
          </Box>
        ))}
      </Box>
      <Typography color="text.secondary" variant="caption">{t('topology.inspectorBackendOwned')}</Typography>
    </Stack>
  );
}
