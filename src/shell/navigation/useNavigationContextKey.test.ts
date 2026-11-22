import { describe, expect, it } from 'vitest';

import { navigationContextKey } from '@/shell/navigation/useNavigationContextKey';

describe('UXR-07 protected navigation restoration scope', () => {
  it('is stable for the same history entry regardless of module set order', () => {
    const a = navigationContextKey('route-1', 'operator', { scopeId: 9, targetId: 'GZ2' }, new Set(['topology', 'assets']));
    const b = navigationContextKey('route-1', 'operator', { scopeId: 9, targetId: 'GZ2' }, new Set(['assets', 'topology']));
    expect(a).toBe(b);
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
