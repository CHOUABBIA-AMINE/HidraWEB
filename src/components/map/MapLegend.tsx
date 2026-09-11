import { Chip, Stack } from '@mui/material';

import type { HidraLayerRegistration } from '@/components/map/LayerRegistry';

export interface MapLegendProps {
  layers: readonly HidraLayerRegistration[];
}

export function MapLegend({ layers }: MapLegendProps) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
      {layers.map((layer) => (
        <Chip key={layer.id} label={`${layer.label} · ${layer.geometryType}`} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}
