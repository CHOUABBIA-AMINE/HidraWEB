export type HidraMapGeometryType = 'Point' | 'LineString' | 'MultiLineString';
export type HidraMapCoordinates = number[] | number[][] | number[][][];

export interface HidraMapGeometry {
  type: HidraMapGeometryType;
  coordinates: HidraMapCoordinates;
}

export interface HidraMapFeature {
  type: 'Feature';
  id: string;
  geometry: HidraMapGeometry;
  properties: Record<string, string | null> & { layer: string };
}

export interface HidraMapFeatureCollection {
  type: 'FeatureCollection';
  features: HidraMapFeature[];
}

export interface HidraMapSelection {
  featureId: string;
  layerId: string;
}

export interface HidraMapAdapter {
  setData: (data: HidraMapFeatureCollection) => void;
  setSelectedFeature: (featureId?: string) => void;
  destroy: () => void;
}

export interface HidraGeographicBasemap {
  url: string;
  bounds: [[number, number], [number, number]];
  center: [number, number];
  locale: Record<string, string>;
  errorLabel: string;
}
