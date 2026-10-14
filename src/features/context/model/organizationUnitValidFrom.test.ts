import { describe, expect, it } from 'vitest';

import { parseOrganizationUnitValidFrom } from '@/features/context/model/organizationUnitValidFrom';
import type { CreateOrganizationUnitRequest } from '@/api/generated/identity-organization/model';

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

  it('requires validFrom in the Orval-generated create-unit transport request', () => {
    const request: CreateOrganizationUnitRequest = { validFrom: '2026-10-11T13:30:00Z' };
    // TypeScript rejects this assignment if Orval makes validFrom optional again.
    const requiredInstant: string = request.validFrom;
    expect(requiredInstant).toBe('2026-10-11T13:30:00Z');
  });
});
