import type { LayerDescriptor } from '@/api/generated/topology/model';

export interface HidraLayerRegistration {
  id: string;
  label: string;
  geometryType: string;
  description: string;
  featuresEndpoint: string;
}

export function buildLayerRegistry(layers: readonly LayerDescriptor[]): HidraLayerRegistration[] {
  return layers.flatMap((layer) => {
    if (!layer.id) return [];
    return [{
      id: layer.id,
      label: layer.label ?? layer.id,
      geometryType: layer.geometryType ?? 'Unknown',
      description: layer.description ?? '',
      featuresEndpoint: layer.featuresEndpoint ?? '',
    }];
  });
}
