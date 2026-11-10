import { describe, expect, it } from 'vitest';

import { sixViewFixtureVersion, sixViewModel } from './sixViewFixture';

const context = { role: 'operator', systemId: 'gz2', assetId: 'demo-gz2-atlas', windowId: 'morning' } as const;

describe('six-view synthetic model authorization and provenance', () => {
  it('binds all demo views to the existing scoped and versioned fixture evidence', () => {
    const view = sixViewModel(context);
    expect(sixViewFixtureVersion).toBe('six-interface-preview-v2');
    expect(view?.system.id).toBe('gz2');
    expect(view?.station?.id).toBe('demo-gz2-atlas');
    expect(view?.revision).toBe('REV-A03');
    expect(view?.alarmId).toBe('DEMO-204');
    expect(view?.pressureTime).toBe('2026-11-06T09:45:00Z');
    expect(view?.points).toHaveLength(3);
    expect(view?.elevationSamples).toHaveLength(14);
    expect(view?.elevationSamples.filter((p) => p.chainageKm !== 0 && p.chainageKm !== 85 && p.chainageKm !== 170)).toHaveLength(11);
    expect(view?.elevationSamples.find((p) => p.chainageKm === 76)?.elevationM).toBe(370);
    for (const station of view?.points ?? []) {
      expect(view?.elevationSamples).toContainEqual({ chainageKm: station.chainageKm, elevationM: station.elevationM });
    }
    expect(view?.points[1]).toMatchObject({
      chainageKm: 85, elevationM: 340, authoredFlowKgS: 122, pressureBarG: 64.1, pressureState: 'available',
    });
  });

  it('keeps stale and unavailable pressure out of usable plotted readings', () => {
    const later = sixViewModel({ ...context, windowId: 'afternoon' });
    expect(later?.revision).toBe('REV-A04');
    expect(later?.alarmId).toBeNull();
    expect(later?.points[1].pressureState).toBe('stale');
    expect(later?.points[1].pressureBarG).toBeUndefined();
    const orion = sixViewModel({ ...context, systemId: 'orion', assetId: 'demo-orion-cedar' });
    expect(orion?.station?.id).toBe('demo-orion-cedar');
    expect(orion?.elevationSamples).toHaveLength(8);
    expect(orion?.points.map((p) => p.elevationM)).toEqual([270, 220]);
    expect(orion?.elevationSamples.at(-1)?.chainageKm).toBe(85);
  });

  it('denies every system and asset when demo scope is not granted', () => {
    for (const role of ['otherScope', 'otherCompany'] as const) {
      expect(sixViewModel({ ...context, role })).toBeUndefined();
    }
    expect(sixViewModel({ ...context, assetId: 'demo-orion-cedar' })?.station).toBeUndefined();
  });
});
