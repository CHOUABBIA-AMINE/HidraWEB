import { describe, expect, it } from 'vitest';

import {
  formatDisplayInstant,
  formatDisplayNumber,
  formatDisplayQuantity,
  resolveDisplayLocale,
} from '@/shared/i18n/localePresentation';

describe('UXR-04 / presentation locale contracts', () => {
  it('normalizes regional subtags without inventing production locales', () => {
    expect(resolveDisplayLocale('ar-DZ')).toBe('ar');
    expect(resolveDisplayLocale('EN-us')).toBe('en');
    expect(resolveDisplayLocale('fr')).toBe('fr');
    expect(resolveDisplayLocale('other')).toBe('fr');
  });

  it('uses locale-specific numerals and preserves engineering units and values', () => {
    const value = 1234.5;
    const quantity = formatDisplayQuantity(value, 'bar', 'fr-DZ');
    expect(quantity).toContain('bar');
    expect(quantity).toContain('1');
    expect(formatDisplayNumber(value, 'en')).toBe('1,234.5');
    expect(formatDisplayNumber(value, 'ar')).not.toBe(formatDisplayNumber(value, 'en'));
    expect(formatDisplayQuantity(Number.NaN, 'bar', 'en')).toBe('—');
    expect(value).toBe(1234.5);
  });

  it('rejects ambiguous instants and makes the chosen display zone explicit', () => {
    const source = '2026-11-22T08:15:00+01:00';
    const displayed = formatDisplayInstant(source, 'fr', 'UTC');
    expect(displayed).toContain('2026');
    expect(displayed).toContain('UTC');
    expect(source).toBe('2026-11-22T08:15:00+01:00');
    expect(formatDisplayInstant('2026-11-22T08:15:00', 'fr', 'UTC')).toBe('—');
    expect(formatDisplayInstant('not-a-time', 'ar', 'UTC')).toBe('—');
    expect(formatDisplayInstant(source, 'en', 'Invalid/Zone')).toBe('—');
  });
});
