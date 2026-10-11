import { describe, expect, it } from 'vitest';

import { parseOrganizationUnitValidFrom } from '@/features/context/model/organizationUnitValidFrom';

describe('HWEB-F01 organization unit validFrom contract', () => {
  it('does not invent an effective time for an empty or malformed input', () => {
    expect(parseOrganizationUnitValidFrom('')).toBeNull();
    expect(parseOrganizationUnitValidFrom('   ')).toBeNull();
    expect(parseOrganizationUnitValidFrom('tomorrow')).toBeNull();
    expect(parseOrganizationUnitValidFrom('2026-02-30T10:00')).toBeNull();
    expect(parseOrganizationUnitValidFrom('2026-10-11')).toBeNull();
  });

  it('preserves the explicitly entered local date/time as an ISO instant', () => {
    const local = '2026-10-11T14:30';
    expect(parseOrganizationUnitValidFrom(local)).toBe(new Date(local).toISOString());
  });
});
