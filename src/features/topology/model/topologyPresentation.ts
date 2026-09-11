import type { Feature, FeatureCollection } from '@/api/generated/topology/model';
import type {
  HidraMapCoordinates,
  HidraMapFeature,
  HidraMapFeatureCollection,
  HidraMapGeometryType,
} from '@/components/map/mapTypes';

const EMPTY_MAP_COLLECTION: HidraMapFeatureCollection = { type: 'FeatureCollection', features: [] };

function isGeometryType(value: unknown): value is HidraMapGeometryType {
  return value === 'Point' || value === 'LineString' || value === 'MultiLineString';
}

function isCoordinates(value: unknown): value is HidraMapCoordinates {
  if (!Array.isArray(value)) return false;
  return value.every((item) => typeof item === 'number' || isCoordinates(item));
}

function toMapFeature(feature: Feature): HidraMapFeature | null {
  const geometry = feature.geometry as unknown as { type?: unknown; coordinates?: unknown };
  if (!isGeometryType(geometry.type) || !isCoordinates(geometry.coordinates)) return null;

  const rawProperties = feature.properties as unknown as Record<string, unknown>;
  const layer = rawProperties.layer;
  if (typeof layer !== 'string' || !layer) return null;

  const properties: Record<string, string | null> & { layer: string } = { layer };
  Object.entries(rawProperties).forEach(([key, value]) => {
    if (typeof value === 'string' || value === null) properties[key] = value;
  });

  return {
    type: 'Feature',
    id: feature.id,
    geometry: { type: geometry.type, coordinates: geometry.coordinates },
    properties,
  };
}

export function toHidraMapFeatureCollection(collection?: FeatureCollection): HidraMapFeatureCollection {
  if (!collection) return EMPTY_MAP_COLLECTION;
  return {
    type: 'FeatureCollection',
    features: collection.features.map(toMapFeature).filter((feature): feature is HidraMapFeature => feature !== null),
  };
}

export function topologyFeatureLabel(feature: Feature): string {
  const properties = feature.properties;
  return properties.code
    ?? properties.nameFr
    ?? properties.nameEn
    ?? properties.nameAr
    ?? properties.entityId
    ?? feature.id;
}

export function findTopologyFeature(collection: FeatureCollection | undefined, featureId: string): Feature | undefined {
  return collection?.features.find((feature) => feature.id === featureId);
}
