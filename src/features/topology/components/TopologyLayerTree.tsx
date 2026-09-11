import { Box, Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { LayerDescriptor } from '@/api/generated/topology/model';

export interface TopologyLayerTreeProps {
  layers: readonly LayerDescriptor[];
  hiddenLayerIds: ReadonlySet<string>;
  focusedLayerId?: string;
  onToggle: (layerId: string) => void;
  onFocus: (layerId: string) => void;
}

export function TopologyLayerTree({
  layers,
  hiddenLayerIds,
  focusedLayerId,
  onToggle,
  onFocus,
}: TopologyLayerTreeProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={1}>
      <Typography component="h2" variant="subtitle1">{t('topology.layers')}</Typography>
      {layers.flatMap((layer) => {
        if (!layer.id) return [];
        const layerId = layer.id;
        return [(
          <Box key={layerId} sx={{ border: 1, borderColor: focusedLayerId === layerId ? 'primary.main' : 'divider', borderRadius: 1, p: 1 }}>
            <FormControlLabel
              control={<Checkbox checked={!hiddenLayerIds.has(layerId)} onChange={() => onToggle(layerId)} />}
              label={layer.label ?? layerId}
            />
            <Typography color="text.secondary" sx={{ display: 'block' }} variant="caption">
              {layer.geometryType ?? '—'} · {layer.description ?? '—'}
            </Typography>
            <Button onClick={() => onFocus(layerId)} size="small" sx={{ mt: 0.5 }}>
              {t('topology.inspectLayer')}
            </Button>
          </Box>
        )];
      })}
    </Stack>
  );
}
