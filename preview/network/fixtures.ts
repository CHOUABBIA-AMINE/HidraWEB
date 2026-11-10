export const fixtureVersion = 'network-fixture-v1';

export const windows = {
  morning: { label: '06:00–10:00 UTC' },
  afternoon: { label: '10:00–14:00 UTC' },
} as const;

export type WindowId = keyof typeof windows;
export const fixtureDate = '2026-11-06';

const workspaceAssetGrants = [
  'demo-gz2-west', 'demo-gz2-atlas', 'demo-gz2-east', 'demo-orion-cedar', 'demo-orion-ridge',
];

const workspaceScope = {
  company: 'Demo Gas Operations',
  organizations: ['West Gas Control', 'East Gas Control'],
  assetGrants: workspaceAssetGrants,
};

export const roles = {
  operator: { label: 'Scoped operator', ...workspaceScope },
  observer: { label: 'Read-only observer', ...workspaceScope },
  otherScope: {
    label: 'Same company · outside asset grant',
    company: 'Demo Gas Operations',
    organizations: ['West Gas Control'],
    assetGrants: ['demo-west-training'],
  },
  otherCompany: {
    label: 'Different company',
    company: 'Demo Utility Partners',
    organizations: ['West Gas Control'],
    assetGrants: ['demo-partner-training'],
  },
} as const;

export type RoleId = keyof typeof roles;
export type SystemId = 'gz2' | 'orion';

export type Evidence<T> =
  | { state: 'available' | 'stale'; observedAt: string; value: T }
  | { state: 'empty' | 'unavailable' };

type Technical = { revision: string; description: string };
type Pressure = { samples: readonly number[] };
type Alarm = { id: string; title: string };
export type StationEvidence = {
  technical: Evidence<Technical>;
  pressure: Evidence<Pressure>;
  alarm: Evidence<Alarm>;
};

export type Station = {
  id: string;
  name: string;
  kind: string;
  point: readonly [number, number];
  evidence: Record<WindowId, StationEvidence>;
};

export type GasSystem = {
  id: SystemId;
  name: string;
  code: string;
  company: string;
  organization: string;
  stations: readonly Station[];
};

const empty = { state: 'empty' } as const;
const unavailable = { state: 'unavailable' } as const;
const at = (time: string) => fixtureDate + 'T' + time + ':00Z';
const revision = (id: string, description: string, time = '06:10'): Evidence<Technical> =>
  ({ state: 'available', observedAt: at(time), value: { revision: id, description } });
const pressure = (samples: readonly number[], time: string, state: 'available' | 'stale' = 'available'): Evidence<Pressure> =>
  ({ state, observedAt: at(time), value: { samples } });
const alarm = (id: string, title: string, time: string): Evidence<Alarm> =>
  ({ state: 'available', observedAt: at(time), value: { id, title } });

const systems: readonly GasSystem[] = [
  {
    id: 'gz2', name: 'GZ2 Reference', code: 'GZ2',
    company: 'Demo Gas Operations', organization: 'West Gas Control',
    stations: [
      {
        id: 'demo-gz2-west', name: 'West Intake', kind: 'Inlet station', point: [17, 68],
        evidence: {
          morning: { technical: revision('REV-W01', 'Metering and inlet manifold'), pressure: pressure([65.1, 65.4, 65.2, 65.5, 65.2], '09:50'), alarm: empty },
          afternoon: { technical: revision('REV-W02', 'Metering and inlet manifold', '10:15'), pressure: pressure([65.2, 65.0, 64.9, 65.1, 65.3], '13:40'), alarm: empty },
        },
      },
      {
        id: 'demo-gz2-atlas', name: 'Atlas Compression', kind: 'Compressor station', point: [50, 39],
        evidence: {
          morning: { technical: revision('REV-A03', 'Compression train and discharge header'), pressure: pressure([67.1, 66.4, 65.8, 64.9, 64.1], '09:45'), alarm: alarm('DEMO-204', 'Low discharge pressure', '09:32') },
          afternoon: { technical: revision('REV-A04', 'Compression train and discharge header', '10:25'), pressure: pressure([64.1, 64.3, 64.2], '10:12', 'stale'), alarm: unavailable },
        },
      },
      {
        id: 'demo-gz2-east', name: 'East Delivery', kind: 'Delivery station', point: [82, 53],
        evidence: {
          morning: { technical: revision('REV-E02', 'Delivery metering and outlet header'), pressure: pressure([59.3, 59.1, 59.4, 59.6, 59.5], '09:48'), alarm: empty },
          afternoon: { technical: unavailable, pressure: pressure([59.5, 59.7, 59.5, 59.6, 59.8], '13:43'), alarm: empty },
        },
      },
    ],
  },
  {
    id: 'orion', name: 'Orion Gas Link', code: 'ORION',
    company: 'Demo Gas Operations', organization: 'East Gas Control',
    stations: [
      {
        id: 'demo-orion-cedar', name: 'Cedar Entry', kind: 'Inlet station', point: [22, 40],
        evidence: {
          morning: { technical: revision('REV-C01', 'Intake manifold and isolation valves'), pressure: pressure([48.0, 48.1, 47.8, 48.2, 48.2], '09:46'), alarm: empty },
          afternoon: { technical: revision('REV-C02', 'Intake manifold and isolation valves', '10:20'), pressure: empty, alarm: empty },
        },
      },
      {
        id: 'demo-orion-ridge', name: 'Ridge Delivery', kind: 'Delivery station', point: [77, 65],
        evidence: {
          morning: { technical: revision('REV-R01', 'Delivery metering'), pressure: unavailable, alarm: empty },
          afternoon: { technical: revision('REV-R02', 'Delivery metering', '10:30'), pressure: pressure([44.7, 44.8, 44.6, 44.9, 44.7], '13:50'), alarm: empty },
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
