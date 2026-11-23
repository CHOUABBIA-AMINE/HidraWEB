import { Box, Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';

import type { HidraLayerRegistration } from '@/components/map/LayerRegistry';

export interface MapLayerExplorerProps {
  layers: readonly HidraLayerRegistration[];
  hiddenLayerIds: ReadonlySet<string>;
  focusedLayerId?: string;
  title: string;
  inspectLabel: string;
  onToggle: (layerId: string) => void;
  onFocus: (layerId: string) => void;
}

/** Presentation only: caller supplies precisely the authorized owner-issued layers. */
export function MapLayerExplorer({ layers, hiddenLayerIds, focusedLayerId, title, inspectLabel, onToggle, onFocus }: MapLayerExplorerProps) {
  return (
    <Stack spacing={1} aria-label={title} role="region">
      <Typography component="h2" variant="subtitle1">{title}</Typography>
      {layers.map((layer) => (
        <Box key={layer.id} sx={{ border: 1, borderColor: focusedLayerId === layer.id ? 'primary.main' : 'divider', borderRadius: 1, p: 1 }}>
          <FormControlLabel
            control={<Checkbox checked={!hiddenLayerIds.has(layer.id)} onChange={() => onToggle(layer.id)} />}
            label={layer.label}
          />
          <Typography color="text.secondary" sx={{ display: 'block' }} variant="caption">
            {layer.geometryType || '—'} · {layer.description || '—'}
          </Typography>
          <Button onClick={() => onFocus(layer.id)} size="small" sx={{ mt: 0.5 }}>
            {inspectLabel}
          </Button>
        </Box>
      ))}
    </Stack>
  );
}
