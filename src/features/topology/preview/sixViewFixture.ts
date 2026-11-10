import { accessibleSystems, type GasSystem, type RoleId, type Station, type SystemId, type WindowId } from './fixtures';

export const sixViewFixtureVersion = 'six-interface-preview-v2';

export type SixViewContext = {
  role: RoleId;
  systemId: SystemId;
  assetId: string | null;
  windowId: WindowId;
};

export type ElevationSample = {
  chainageKm: number;
  elevationM: number;
};

// Authored terrain chainage points, NOT surveying, DEM, pipeline centerline, or GIS elevations.
// Dense enough to demonstrate climbs and depressions between the sparse facility markers.
const profileBySystem: Record<SystemId, readonly ElevationSample[]> = {
  gz2: [
    { chainageKm: 0, elevationM: 190 }, { chainageKm: 12, elevationM: 205 },
    { chainageKm: 25, elevationM: 245 }, { chainageKm: 39, elevationM: 275 },
    { chainageKm: 54, elevationM: 260 }, { chainageKm: 68, elevationM: 310 },
    { chainageKm: 76, elevationM: 370 }, { chainageKm: 85, elevationM: 340 },
    { chainageKm: 100, elevationM: 325 }, { chainageKm: 115, elevationM: 380 },
    { chainageKm: 130, elevationM: 300 }, { chainageKm: 146, elevationM: 245 },
    { chainageKm: 160, elevationM: 260 }, { chainageKm: 170, elevationM: 220 },
  ],
  orion: [
    { chainageKm: 0, elevationM: 270 }, { chainageKm: 12, elevationM: 310 },
    { chainageKm: 26, elevationM: 280 }, { chainageKm: 41, elevationM: 235 },
    { chainageKm: 54, elevationM: 250 }, { chainageKm: 68, elevationM: 280 },
    { chainageKm: 77, elevationM: 240 }, { chainageKm: 85, elevationM: 220 },
  ],
};

export type SixViewPoint = {
  id: string;
  chainageKm: number;
  elevationM: number;
  authoredFlowKgS: number;
  pressureBarG?: number;
  pressureState: 'available' | 'stale' | 'empty' | 'unavailable';
};

export type SixViewModel = {
  system: GasSystem;
  station?: Station;
  points: readonly SixViewPoint[];
  elevationSamples: readonly ElevationSample[];
  revision: string | null;
  alarmId: string | null;
  pressureTime: string | null;
};

/**
 * Presentation-only demo. The elevation, chainage, flow and integrity numbers
 * are authored fictional fixtures. This is NOT a numerical solver or survey.
 * Authority is represented by the pre-existing scoped demo grants only.
 */
export function sixViewModel(context: SixViewContext): SixViewModel | undefined {
  const system = accessibleSystems(context.role).find(({ id }) => id === context.systemId);
  if (!system) return undefined;
  const station = system.stations.find(({ id }) => id === context.assetId);
  const technical = station?.evidence[context.windowId].technical;
  const alarm = station?.evidence[context.windowId].alarm;
  const pressure = station?.evidence[context.windowId].pressure;
  const elevationSamples = profileBySystem[system.id];
  const points: SixViewPoint[] = system.stations.map((asset, index) => {
    const reading = asset.evidence[context.windowId].pressure;
    return {
      id: asset.id,
      chainageKm: index * 85,
      // Station nodes are annotations on the route profile, not its only elevation samples.
      elevationM: elevationSamples.find((point) => point.chainageKm === index * 85)!.elevationM,
      authoredFlowKgS: 125 - index * 3,
      pressureBarG: 'value' in reading && reading.state === 'available' ? reading.value.samples.at(-1) : undefined,
      pressureState: reading.state,
    };
  });
  return {
    system,
    station,
    points,
    elevationSamples,
    revision: technical && 'value' in technical ? technical.value.revision : null,
    alarmId: alarm && 'value' in alarm ? alarm.value.id : null,
    pressureTime: pressure && 'value' in pressure ? pressure.observedAt : null,
  };
}
