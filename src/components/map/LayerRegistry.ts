import type { LayerDescriptor } from '@/api/generated/topology/model';

export interface HidraLayerRegistration {
  id: string;
  label: string;
  geometryType: string;
  description: string;
  featuresEndpoint: string;
}

export function buildLayerRegistry(layers: readonly LayerDescriptor[]): HidraLayerRegistration[] {
  return layers.map((layer) => ({
    id: layer.id,
    label: layer.label,
    geometryType: layer.geometryType,
    description: layer.description,
    featuresEndpoint: layer.featuresEndpoint,
  }));
}
