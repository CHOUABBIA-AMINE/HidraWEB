import type { HidraMapCoordinates, HidraMapFeatureCollection } from '@/components/map/mapTypes';

export interface HidraMapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

function visitCoordinates(coordinates: HidraMapCoordinates, bounds: HidraMapBounds): void {
  if (
    coordinates.length >= 2
    && typeof coordinates[0] === 'number'
    && Number.isFinite(coordinates[0])
    && typeof coordinates[1] === 'number'
    && Number.isFinite(coordinates[1])
  ) {
    bounds.west = Math.min(bounds.west, coordinates[0]);
    bounds.south = Math.min(bounds.south, coordinates[1]);
    bounds.east = Math.max(bounds.east, coordinates[0]);
    bounds.north = Math.max(bounds.north, coordinates[1]);
    return;
  }

  for (const value of coordinates) {
    if (Array.isArray(value)) {
      visitCoordinates(value as HidraMapCoordinates, bounds);
    }
  }
}

export function getFeatureCollectionBounds(data: HidraMapFeatureCollection): HidraMapBounds | undefined {
  if (data.features.length === 0) return undefined;

  const bounds: HidraMapBounds = {
    west: Number.POSITIVE_INFINITY,
    south: Number.POSITIVE_INFINITY,
    east: Number.NEGATIVE_INFINITY,
    north: Number.NEGATIVE_INFINITY,
  };

  for (const feature of data.features) {
    visitCoordinates(feature.geometry.coordinates, bounds);
  }

  if (![bounds.west, bounds.south, bounds.east, bounds.north].every(Number.isFinite)) {
    return undefined;
  }

  return bounds;
}
