import { Alert, Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import type { HidraMapAdapter, HidraMapFeatureCollection, HidraMapSelection } from '@/components/map/mapTypes';

export interface HidraMapProps {
  data: HidraMapFeatureCollection;
  selectedFeatureId?: string;
  ariaLabel: string;
  onFeatureSelect: (selection: HidraMapSelection) => void;
}

export function HidraMap({ data, selectedFeatureId, ariaLabel, onFeatureSelect }: HidraMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<HidraMapAdapter | undefined>(undefined);
  const dataRef = useRef(data);
  const selectedFeatureRef = useRef(selectedFeatureId);
  const selectionHandlerRef = useRef(onFeatureSelect);
  const [adapterError, setAdapterError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    let ownedAdapter: HidraMapAdapter | undefined;

    void import('@/components/map/adapters/maplibreAdapter')
      .then(({ createMapLibreAdapter }) => {
        if (cancelled || !containerRef.current) return;
        ownedAdapter = createMapLibreAdapter(
          containerRef.current,
          (selection) => selectionHandlerRef.current(selection),
        );
        adapterRef.current = ownedAdapter;
        ownedAdapter.setData(dataRef.current);
        ownedAdapter.setSelectedFeature(selectedFeatureRef.current);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setAdapterError(error instanceof Error ? error.message : 'Unable to initialize map adapter.');
        }
      });

    return () => {
      cancelled = true;
      ownedAdapter?.destroy();
      if (adapterRef.current === ownedAdapter) adapterRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    dataRef.current = data;
    adapterRef.current?.setData(data);
  }, [data]);

  useEffect(() => {
    selectedFeatureRef.current = selectedFeatureId;
    adapterRef.current?.setSelectedFeature(selectedFeatureId);
  }, [selectedFeatureId]);

  useEffect(() => {
    selectionHandlerRef.current = onFeatureSelect;
  }, [onFeatureSelect]);

  return (
    <Box aria-label={ariaLabel} role="region">
      {adapterError ? <Alert severity="error">{adapterError}</Alert> : null}
      <Box ref={containerRef} sx={{ minHeight: 520, overflow: 'hidden', width: '100%' }} />
    </Box>
  );
}
