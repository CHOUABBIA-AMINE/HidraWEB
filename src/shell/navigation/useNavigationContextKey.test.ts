import { describe, expect, it } from 'vitest';

import { navigationContextKey, workspaceScopeKey } from '@/shell/navigation/useNavigationContextKey';

describe('UXR-07 protected navigation restoration scope', () => {
  it('is stable for the same history entry regardless of module set order', () => {
    const a = navigationContextKey('route-1', 'operator', { scopeId: 9, targetId: 'GZ2' }, new Set(['topology', 'assets']));
    const b = navigationContextKey('route-1', 'operator', { scopeId: 9, targetId: 'GZ2' }, new Set(['assets', 'topology']));
    expect(a).toBe(b);
  });

  it('keeps authoring state across same-path query updates while isolating path, principal, scope and grants', () => {
    const modules = new Set(['topology']);
    const context = { scopeId: 9, targetId: 'GZ2' };
    const first = workspaceScopeKey('/network', 'operator', context, modules);
    // Query-only updates create new history entries, but share a pathname.
    expect(workspaceScopeKey('/network', 'operator', context, modules)).toBe(first);
    expect(navigationContextKey('entry-before', 'operator', context, modules))
      .not.toBe(navigationContextKey('entry-after', 'operator', context, modules));
    expect(workspaceScopeKey('/alarms', 'operator', context, modules)).not.toBe(first);
    expect(workspaceScopeKey('/network', 'another', context, modules)).not.toBe(first);
    expect(workspaceScopeKey('/network', 'operator', { scopeId: 10 }, modules)).not.toBe(first);
    expect(workspaceScopeKey('/network', 'operator', context, new Set())).not.toBe(first);
    expect(workspaceScopeKey('/network', 'operator', { ...context, companyPartyId: 'other' }, modules)).not.toBe(first);
    expect(workspaceScopeKey('/network', 'operator', { ...context, principalId: 'other' }, modules)).not.toBe(first);
  });

  it('invalidates remembered mobile/menu expansion on history, scope, principal or grant changes', () => {
    const initial = navigationContextKey('route-1', 'operator', { scopeId: 9, targetId: 'GZ2' }, new Set(['topology']));
    const changed = [
      navigationContextKey('route-2', 'operator', { scopeId: 9, targetId: 'GZ2' }, new Set(['topology'])),
      navigationContextKey('route-1', 'operator', { scopeId: 10, targetId: 'GZ2' }, new Set(['topology'])),
      navigationContextKey('route-1', 'operator', { scopeId: 9, targetId: 'GK1' }, new Set(['topology'])),
      navigationContextKey('route-1', 'other', { scopeId: 9, targetId: 'GZ2' }, new Set(['topology'])),
      navigationContextKey('route-1', 'operator', { scopeId: 9, targetId: 'GZ2' }, new Set()),
    ];
    expect(changed.every((key) => key !== initial)).toBe(true);
  });
});
