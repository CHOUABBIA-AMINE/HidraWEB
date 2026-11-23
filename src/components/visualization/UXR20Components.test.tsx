import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';

import { MapLayerExplorer } from '@/components/map/MapLayerExplorer';
import { FileEvidencePanel } from '@/components/feedback/FileEvidencePanel';
import { StationSynopticFrame } from '@/components/diagram/StationSynopticFrame';
import { TrendQualityPanel } from '@/features/telemetry-monitoring/components/TrendQualityPanel';
import { i18n } from '@/shared/i18n/i18n';

describe('UXR-20 owner-bound visualization primitives', () => {
  it('toggles and focuses only published layers without generating new IDs', () => {
    const toggle = vi.fn(); const focus = vi.fn();
    render(<MapLayerExplorer layers={[{ id: 'facilities', label: 'Facilities', geometryType: 'Point', description: '', featuresEndpoint: '' }]}
      hiddenLayerIds={new Set<string>()} focusedLayerId="facilities"
      title="Layers" inspectLabel="Inspect layer" onToggle={toggle} onFocus={focus} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Facilities' }));
    fireEvent.click(screen.getByRole('button', { name: 'Inspect layer' }));
    expect(toggle).toHaveBeenCalledWith('facilities');
    expect(focus).toHaveBeenCalledWith('facilities');
    expect(screen.queryByText('HCA')).not.toBeInTheDocument();
  });

  it('shows owner reading quality but never admits readings belonging to a different point', () => {
    const reading = { id: 'r1', pointId: 'PT-1', numericValue: 12.5, qualityCodeId: 'UNKNOWN', state: 'RECEIVED', unitId: 'bar', sourceTimestamp: '2026-11-23T09:00:00Z' };
    render(<I18nextProvider i18n={i18n}><TrendQualityPanel pointId="PT-1" title="Pressure trend" readings={[
      reading, { ...reading, id: 'r2', numericValue: 13.5 },
      { ...reading, id: 'private', pointId: 'PT-OTHER', numericValue: 999 },
    ]} /></I18nextProvider>);
    expect(screen.getByRole('img', { name: 'Pressure trend' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveTextContent('UNKNOWN');
    expect(screen.getByRole('table')).toHaveTextContent('RECEIVED');
    expect(screen.getByRole('table')).not.toHaveTextContent('999');
  });

  it('fails closed for an absent or malformed station graph', () => {
    const view = render(<StationSynopticFrame label="Station synoptic" source="HidraAPI Topology"
      state={{ kind: 'unavailable' }} />);
    expect(screen.getByRole('region', { name: 'Station synoptic' })).toHaveTextContent('No equipment or connection is inferred.');
    view.rerender(<StationSynopticFrame label="Station synoptic" source="HidraAPI Topology"
      state={{ kind: 'ready', revision: 'rev-1', nodes: [{ id: 'unit-1', label: 'Unit 1' }],
        connections: [{ id: 'edge-1', fromId: 'unit-1', toId: 'UNKNOWN' }] }} />);
    expect(screen.getByRole('region', { name: 'Station synoptic' })).not.toHaveTextContent('Unit 1');
  });

  it('shows only owner published file evidence and requires an explicit download permission', () => {
    const download = vi.fn();
    const props = {
      versionId: 'version-1',
      attributes: { originalFilename: 'proof.pdf', mimeType: 'application/pdf', fileSizeBytes: 52, checksumValue: 'owner-digest' },
      onDownload: download,
    };
    const view = render(<FileEvidencePanel {...props} downloadPermitted={false} />);
    expect(screen.getByText('proof.pdf')).toBeInTheDocument();
    expect(screen.getByText('52 bytes')).toBeInTheDocument();
    expect(screen.getByText('owner-digest')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Download' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(download).not.toHaveBeenCalled();
    view.rerender(<FileEvidencePanel {...props} downloadPermitted />);
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(download).toHaveBeenCalledTimes(1);
    expect(download).toHaveBeenCalledWith('version-1');
  });
});
