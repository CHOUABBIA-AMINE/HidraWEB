import { Chip, Stack } from '@mui/material';

import type { HidraLayerRegistration } from '@/components/map/LayerRegistry';

export interface MapLegendProps {
  layers: readonly HidraLayerRegistration[];
}

export function MapLegend({ layers }: MapLegendProps) {
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
      {layers.map((layer) => (
        <Chip key={layer.id} label={`${layer.label} · ${layer.geometryType}`} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}
