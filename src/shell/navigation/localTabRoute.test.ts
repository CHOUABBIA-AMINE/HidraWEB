import { describe, expect, it } from 'vitest';

import { readLocalTab, writeLocalTab } from '@/shell/navigation/localTabRoute';

const tabs = ['active', 'history'] as const;

describe('UXR-07 URL-owned local tab selection', () => {
  it('restores only registered tab identities and falls back on forged values', () => {
    expect(readLocalTab('history', tabs, 'active')).toBe('history');
    expect(readLocalTab('unknown', tabs, 'active')).toBe('active');
    expect(readLocalTab(null, tabs, 'active')).toBe('active');
  });

  it('preserves unrelated route parameters without retaining default/invalid tab values', () => {
    expect(writeLocalTab(new URLSearchParams('instanceId=case-1&tab=wrong'), 'history', tabs, 'active').toString())
      .toBe('instanceId=case-1&tab=history');
    expect(writeLocalTab(new URLSearchParams('instanceId=case-1&tab=history'), 'active', tabs, 'active').toString())
      .toBe('instanceId=case-1');
    expect(writeLocalTab(new URLSearchParams('tab=history'), 'admin', tabs, 'active').toString()).toBe('');
  });
});
