export const fixtureVersion = 'network-fixture-v2';

export const windows = {
  morning: ['06:00', '10:00'],
  afternoon: ['10:00', '14:00'],
} as const;

export type WindowId = keyof typeof windows;
export const fixtureDate = '2026-11-06';
export const observedAt = (time: string) => fixtureDate + 'T' + time + ':00Z';

const workspaceAssetGrants = [
  'demo-gz2-west', 'demo-gz2-atlas', 'demo-gz2-east', 'demo-orion-cedar', 'demo-orion-ridge',
] as const;

const workspaceScope = {
  company: 'demoGas',
  organizations: ['westControl', 'eastControl'],
  assetGrants: workspaceAssetGrants,
};

export const roles = {
  operator: workspaceScope,
  observer: workspaceScope,
  otherScope: {
    company: 'demoGas',
    organizations: ['westControl'],
    assetGrants: ['demo-west-training'],
  },
  otherCompany: {
    company: 'demoUtility',
    organizations: ['westControl'],
    assetGrants: ['demo-partner-training'],
  },
} as const;

export type RoleId = keyof typeof roles;
export type SystemId = 'gz2' | 'orion';
export type StationId = typeof workspaceAssetGrants[number];
export type StationKind = 'inlet' | 'compressor' | 'delivery';
export type Organization = 'westControl' | 'eastControl';
export type TechnicalDescription = 'meteringInlet' | 'compression' | 'meteringOutlet' | 'intakeValves' | 'deliveryMetering';

export type Evidence<T> =
  | { state: 'available' | 'stale'; observedAt: string; value: T }
  | { state: 'empty' | 'unavailable' };

type Technical = { revision: string; description: TechnicalDescription };
type Pressure = { samples: readonly number[] };
type Alarm = { id: string };
export type StationEvidence = {
  technical: Evidence<Technical>;
  pressure: Evidence<Pressure>;
  alarm: Evidence<Alarm>;
};

export type Station = {
  id: StationId;
  kind: StationKind;
  coordinates: readonly [number, number];
  evidence: Record<WindowId, StationEvidence>;
};

export type GasSystem = {
  id: SystemId;
  company: 'demoGas';
  organization: Organization;
  stations: readonly Station[];
};

const empty = { state: 'empty' } as const;
const unavailable = { state: 'unavailable' } as const;
const revision = (id: string, description: TechnicalDescription, time = '06:10'): Evidence<Technical> =>
  ({ state: 'available', observedAt: observedAt(time), value: { revision: id, description } });
const pressure = (samples: readonly number[], time: string, state: 'available' | 'stale' = 'available'): Evidence<Pressure> =>
  ({ state, observedAt: observedAt(time), value: { samples } });
const alarm = (id: string, time: string): Evidence<Alarm> =>
  ({ state: 'available', observedAt: observedAt(time), value: { id } });

const systems: readonly GasSystem[] = [
  {
    id: 'gz2',
    company: 'demoGas', organization: 'westControl',
    stations: [
      {
        id: 'demo-gz2-west', kind: 'inlet', coordinates: [-0.88, 35.03],
        evidence: {
          morning: { technical: revision('REV-W01', 'meteringInlet'), pressure: pressure([65.1, 65.4, 65.2, 65.5, 65.2], '09:50'), alarm: empty },
          afternoon: { technical: revision('REV-W02', 'meteringInlet', '10:15'), pressure: pressure([65.2, 65.0, 64.9, 65.1, 65.3], '13:40'), alarm: empty },
        },
      },
      {
        id: 'demo-gz2-atlas', kind: 'compressor', coordinates: [1.10, 35.38],
        evidence: {
          morning: { technical: revision('REV-A03', 'compression'), pressure: pressure([67.1, 66.4, 65.8, 64.9, 64.1], '09:45'), alarm: alarm('DEMO-204', '09:32') },
          afternoon: { technical: revision('REV-A04', 'compression', '10:25'), pressure: pressure([64.1, 64.3, 64.2], '10:12', 'stale'), alarm: unavailable },
        },
      },
      {
        id: 'demo-gz2-east', kind: 'delivery', coordinates: [3.10, 35.65],
        evidence: {
          morning: { technical: revision('REV-E02', 'meteringOutlet'), pressure: pressure([59.3, 59.1, 59.4, 59.6, 59.5], '09:48'), alarm: empty },
          afternoon: { technical: unavailable, pressure: pressure([59.5, 59.7, 59.5, 59.6, 59.8], '13:43'), alarm: empty },
        },
      },
    ],
  },
  {
    id: 'orion',
    company: 'demoGas', organization: 'eastControl',
    stations: [
      {
        id: 'demo-orion-cedar', kind: 'inlet', coordinates: [4.90, 35.72],
        evidence: {
          morning: { technical: revision('REV-C01', 'intakeValves'), pressure: pressure([48.0, 48.1, 47.8, 48.2, 48.2], '09:46'), alarm: empty },
          afternoon: { technical: revision('REV-C02', 'intakeValves', '10:20'), pressure: empty, alarm: empty },
        },
      },
      {
        id: 'demo-orion-ridge', kind: 'delivery', coordinates: [8.25, 35.54],
        evidence: {
          morning: { technical: revision('REV-R01', 'deliveryMetering'), pressure: unavailable, alarm: empty },
          afternoon: { technical: revision('REV-R02', 'deliveryMetering', '10:30'), pressure: pressure([44.7, 44.8, 44.6, 44.9, 44.7], '13:50'), alarm: empty },
        },
      },
    ],
  },
];

export function accessibleSystems(roleId: RoleId): GasSystem[] {
  const { company, organizations, assetGrants } = roles[roleId];
  return systems
    .filter((system) => system.company === company && organizations.some((name) => name === system.organization))
    .map((system) => ({ ...system, stations: system.stations.filter((station) => assetGrants.some((id) => id === station.id)) }))
    .filter((system) => system.stations.length > 0);
}
