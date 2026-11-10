import { accessibleSystems, type GasSystem, type RoleId, type Station, type SystemId, type WindowId } from './fixtures';

export const sixViewFixtureVersion = 'six-interface-preview-v1';

export type SixViewContext = {
  role: RoleId;
  systemId: SystemId;
  assetId: string | null;
  windowId: WindowId;
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
  const points: SixViewPoint[] = system.stations.map((asset, index) => {
    const reading = asset.evidence[context.windowId].pressure;
    return {
      id: asset.id,
      chainageKm: index * 85,
      elevationM: [190, 340, 220, 270][index] ?? 210,
      authoredFlowKgS: 125 - index * 3,
      pressureBarG: 'value' in reading && reading.state === 'available' ? reading.value.samples.at(-1) : undefined,
      pressureState: reading.state,
    };
  });
  return {
    system,
    station,
    points,
    revision: technical && 'value' in technical ? technical.value.revision : null,
    alarmId: alarm && 'value' in alarm ? alarm.value.id : null,
    pressureTime: pressure && 'value' in pressure ? pressure.observedAt : null,
  };
}
